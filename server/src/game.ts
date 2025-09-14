import { LivePlayerState, PlayerAction, PlayerInput, PlayerState, ActiveStatusEffect, PlayerClass, AnimationState } from "./helpers/types.ts";
import { PhysicsWorld } from "./physics.ts";
import { IActionCommand, UseAbilityCommand } from "./commands/actionCommands.ts";
import { statusEffectData } from './gameData/statusEffects.ts'
import { GameEventManager } from "./gameEventManager.ts";
import { GameEventType } from "./helpers/gameEvents.ts";
import { classData } from "./gameData/classes.ts";
import { ResetPlayerCommand } from "./commands/resetPlayerCommand.ts";

const RESPAWN_TIME_MS = 5000;
const SPAWN_POINT = { x: 1, y: 1.5, z: 0.0 };
const MANA_REGEN_PER_SECOND = .1
const DOT_FLUSH_INTERVAL_MS = 1000;

export class Game {
  public physics: PhysicsWorld;
  public eventManager: GameEventManager;
  private players: Map<string, PlayerState> = new Map();
  private actionHandlers: Map<string, IActionCommand<unknown>>;

  constructor() {
    this.physics = new PhysicsWorld();
    this.eventManager = new GameEventManager();

    this.actionHandlers = new Map();
    this.actionHandlers.set("useAbility", new UseAbilityCommand());
    this.actionHandlers.set("resetPlayer", new ResetPlayerCommand());
  }

  public getPlayer(id: string): PlayerState | undefined {
    return this.players.get(id);
  }

  public addNewPlayer(id: string, playerClass: string) {
    const stats = classData.get(playerClass) ?? classData.get("Mage")!;

    const newPlayer: PlayerState = {
      id,
      class: playerClass as PlayerClass,
      health: stats.baseHealth,
      mana: stats.baseMana,
      spellCooldowns: new Map(),
      status: "alive",
      respawnAt: null,
      activeStatusEffects: [],
      animationState: "idle"
    };
    this.players.set(id, newPlayer);
    this.physics.addPlayer(id);
  }

  public removePlayer(id: string) {
    this.players.delete(id);
    this.physics.removePlayer(id);
  }

  public applyDamage(targetId: string, damage: number, killerId: string) {
    const targetPlayer = this.players.get(targetId);
    if (!targetPlayer || targetPlayer.status === 'dead') return;

    const newHealth = targetPlayer.health - damage;

    targetPlayer.health = newHealth

    const playersPhysicsState = this.physics.getState();
    const targetPhysicsState = playersPhysicsState.players[targetId];

    this.eventManager.queueEvent(GameEventType.PlayerDamaged, {
      playerId: targetId,
      damage: damage,
      newHealth: this._formatNumber(newHealth),
      attackerId: killerId,
      position: targetPhysicsState.position
    });

    if (targetPlayer.health <= 0) {
      targetPlayer.health = 0;
      targetPlayer.status = 'dead';
      targetPlayer.respawnAt = Date.now() + RESPAWN_TIME_MS;
      targetPlayer.activeStatusEffects = [];

      console.log(`Player ${targetId} was killed by ${killerId}`);

      this.eventManager.queueEvent(GameEventType.PlayerDeath, {
        playerId: targetId,
        killerId: killerId,
      })
    }
  }

  public applyStatusEffect(targetId: string, effectId: string, casterId: string) {
    const targetPlayer = this.players.get(targetId);
    const effectDef = statusEffectData.get(effectId);
    if (!targetPlayer || !effectDef || targetPlayer.status === 'dead') {
      return;
    }

    const newEffect: ActiveStatusEffect = {
      effectId: effectDef.id,
      expiresAt: Date.now() + effectDef.duration * 1000,
      casterId: casterId,
    };

    targetPlayer.activeStatusEffects = targetPlayer.activeStatusEffects.filter(e => e.effectId !== effectId);
    targetPlayer.activeStatusEffects.push(newEffect);

    this.eventManager.queueEvent(GameEventType.StatusEffectGained, {
      targetId: targetId,
      effectId: effectId,
      duration: newEffect.expiresAt - Date.now(),
      casterId: casterId,
    });
  }

  public handlePlayerAction(playerId: string, actionData: PlayerAction) {
    const handler = this.actionHandlers.get(actionData.actionType);

    if (handler) {
      handler.execute(this, playerId, actionData.payload);
    } else {
      console.warn(`No handler for action type: ${actionData.actionType}`);
    }
  }

  public async initialize() {
    await this.physics.initializeMapCollider("./map_collider.json");
  }

  public update(inputs: Map<string, PlayerInput>, deltaTime: number) {
    const alivePlayerInputs = new Map<string, PlayerInput>();

    for (const player of this.players.values()) {
      if (player.status === 'dead') {
        if (player.respawnAt && Date.now() >= player.respawnAt) {
          this.resetPlayer(player.id);
        }
      } else {
        this._processStatusEffects(player, deltaTime);
        this._regenerateMana(player, deltaTime);
        const input = inputs.get(player.id);
        if (input) {
          const controller = this.physics.getPlayerController(player.id);
          if (controller) {
            let newState: AnimationState = "idle";

            if (!controller.isOnGround()) {
              newState = "fall";
            } else {
              const { forward, backward, left, right, sprint } = input.inputs;
              const isMoving = forward || backward || left || right;
              const isPureForward = forward && !backward && !left && !right;

              if (!isMoving) {
                newState = "idle";
              } else if (isPureForward && sprint) {
                newState = "sprint";
              } else {
                newState = "walk";
              }
            }
            player.animationState = newState;
          }
          alivePlayerInputs.set(player.id, input);
        }
      }
    }
    this.physics.update(alivePlayerInputs, deltaTime);
    this.eventManager.dispatchEvents()
  }

  public resetPlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    const data = classData.get(player.class)!;
    player.status = 'alive';
    player.health = data.baseHealth;
    player.mana = data.baseMana;
    player.respawnAt = null;
    player.activeStatusEffects = [];
    player.spellCooldowns.clear();

    this.physics.teleportPlayer(player.id, SPAWN_POINT);

    this.eventManager.queueEvent(GameEventType.PlayerRespawn, {
      playerId: player.id,
      position: SPAWN_POINT,
      newHealth: player.health,
      newMana: player.mana,
    });
  }

  private _regenerateMana(player: PlayerState, deltaTime: number) {
    const { baseMana } = classData.get(player.class)

    if (player.mana >= baseMana) return;

    const regenAmount = MANA_REGEN_PER_SECOND * deltaTime;
    player.mana = Math.min(baseMana, player.mana + regenAmount);
  }

  private _formatNumber(value: number, decimals: number = 1) {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  private _processStatusEffects(player: PlayerState, deltaTime: number) {
    player.activeStatusEffects = player.activeStatusEffects.filter(
      (effect) => effect.expiresAt > Date.now()
    );

    if (!player.accumulatedDotDamage) {
      player.accumulatedDotDamage = 0;
    }
    if (!player.lastDotFlushTime) {
      player.lastDotFlushTime = Date.now();
    }

    for (const effect of player.activeStatusEffects) {
      const effectDef = statusEffectData.get(effect.effectId);
      if (effectDef?.damagePerSecond) {
        player.accumulatedDotDamage += effectDef.damagePerSecond * deltaTime;
      }
    }

    const now = Date.now();
    if (now - player.lastDotFlushTime >= DOT_FLUSH_INTERVAL_MS) {
      if (player.accumulatedDotDamage > 0) {
        const damageToSend = Math.round(player.accumulatedDotDamage);

        if (damageToSend > 0) {
          const lastCasterId = player.activeStatusEffects[0]?.casterId ?? 'system';
          this.applyDamage(player.id, damageToSend, lastCasterId);
        }

        player.accumulatedDotDamage = 0;
      }
      player.lastDotFlushTime = now;
    }
  }

  public getState() {
    const playersPhysicsState = this.physics.getState();
    const liveGameState: { [id: string]: LivePlayerState } = {};

    for (const id in playersPhysicsState.players) {
      const physicsState = playersPhysicsState.players[id];
      const logicalState = this.players.get(id);

      if (logicalState) {
        liveGameState[id] = {
          position: physicsState.position,
          rotation: physicsState.rotation,
          health: this._formatNumber(logicalState.health),
          mana: this._formatNumber(logicalState.mana),
          class: logicalState.class,
          status: logicalState.status,
          respawnAt: logicalState.respawnAt,
          animationState: logicalState.animationState
        };
      }
    }

    return { players: liveGameState };
  }
}