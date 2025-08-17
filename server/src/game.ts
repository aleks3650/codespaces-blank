import { io } from "./helpers/IO_Server.ts";
import { LivePlayerState, PlayerAction, PlayerInput, PlayerState, ActiveStatusEffect } from "./helpers/types.ts";
import { PhysicsWorld } from "./physics.ts";
import { IActionCommand, CastSpellCommand } from "./commands/actionCommands.ts";
import {statusEffectData} from './gameData/statusEffects.ts'

export type AnimationState = 'idle' | 'walk' | 'sprint';

const RESPAWN_TIME_MS = 5000;
const SPAWN_POINT = { x: 1.5, y: 1.5, z: 0.0 };

export class Game {
  public physics: PhysicsWorld;
  private players: Map<string, PlayerState> = new Map();
  private actionHandlers: Map<string, IActionCommand<unknown>>;

  constructor() {
    this.physics = new PhysicsWorld();

    this.actionHandlers = new Map();
    this.actionHandlers.set("castSpell", new CastSpellCommand());
  }

  public getPlayer(id: string): PlayerState | undefined {
    return this.players.get(id);
  }

  public addNewPlayer(id: string) {
    const newPlayer: PlayerState = {
      id,
      class: "Mage",
      health: 100,
      mana: 100,
      spellCooldowns: new Map(),
      status: "alive",
      respawnAt: null,
      activeStatusEffects: []
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

    const clampedHealth = Math.max(0, newHealth);
    
    targetPlayer.health = Math.round(clampedHealth * 100) / 100;

    if (targetPlayer.health <= 0) {
      targetPlayer.health = 0; 
      targetPlayer.status = 'dead';
      targetPlayer.respawnAt = Date.now() + RESPAWN_TIME_MS;
      targetPlayer.activeStatusEffects = [];

      console.log(`Player ${targetId} was killed by ${killerId}`);
      io.emit("player-death", { playerId: targetId, killerId: killerId });
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

    io.emit("status-effect-applied", { targetId, effectId });
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
          this._respawnPlayer(player);
        }
      } else {
        this._processStatusEffects(player, deltaTime);
        const input = inputs.get(player.id);
        if (input) {
          alivePlayerInputs.set(player.id, input);
        }
      }
    }
    this.physics.update(alivePlayerInputs, deltaTime);
  }

  private _respawnPlayer(player: PlayerState) {
    player.status = 'alive';
    player.health = 100;
    player.mana = 100;
    player.respawnAt = null;
    this.physics.teleportPlayer(player.id, SPAWN_POINT);
    console.log(`Player ${player.id} has respawned.`);
    io.emit("player-respawn", { playerId: player.id, position: SPAWN_POINT });
  }

  // NOWA METODA do przetwarzania efektów
  private _processStatusEffects(player: PlayerState, deltaTime: number) {
    // Usuń wygasłe efekty
    player.activeStatusEffects = player.activeStatusEffects.filter(
      (effect) => effect.expiresAt > Date.now()
    );

    // Zastosuj logikę aktywnych efektów
    for (const effect of player.activeStatusEffects) {
      const effectDef = statusEffectData.get(effect.effectId);
      if (effectDef?.damagePerSecond) {
        // Przekazujemy ID rzucającego efekt jako zabójcę
        this.applyDamage(player.id, effectDef.damagePerSecond * deltaTime, effect.casterId);
      }
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
          health: logicalState.health,
          mana: logicalState.mana,
          class: logicalState.class,
          status: logicalState.status, 
          respawnAt: logicalState.respawnAt
        };
      }
    }

    return { players: liveGameState };
  }
}