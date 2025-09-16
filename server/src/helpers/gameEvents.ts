export enum GameEventType {
  AreaEffectTriggered = 'area-effect-triggered',

  PlayerDamaged = 'player-damaged',
  PlayerDeath = 'player-death',

  StatusEffectGained = 'status-effect-gained',
  StatusEffectLost = 'status-effect-lost',

  SpellCastFailed = 'spell-cast-failed',
  SpellOnCooldown = 'spell-on-cooldown',

  PlayerRespawn = 'player-respawn',
  PlayerCastSpell = 'player-cast-spell',
  ActionOnCooldown = 'action-on-cooldown',
}

export interface GameEventPayloads {
  [GameEventType.AreaEffectTriggered]: {
    effectId: string;
    position: { x: number, y: number, z: number };
  };

  [GameEventType.PlayerDamaged]: {
    playerId: string;
    damage: number;
    newHealth: number;
    attackerId: string;
    position: { x: number, y: number, z: number }
  };
  [GameEventType.PlayerCastSpell]: {
    casterId: string;
    spellId: string;
  };
  [GameEventType.PlayerDeath]: {
    playerId: string;
    killerId: string;
  };

  [GameEventType.StatusEffectGained]: {
    targetId: string;
    effectId: string;
    duration: number;
    casterId: string;
  };
  [GameEventType.StatusEffectLost]: {
    targetId: string;
    effectId: string;
  };
  [GameEventType.SpellCastFailed]: {
    reason: 'not_enough_mana' | 'silenced' | 'missed';
  };
  [GameEventType.SpellOnCooldown]: {
    spellId: string;
    remainingMs: number;
  };
  [GameEventType.PlayerRespawn]: {
    playerId: string;
    position: { x: number; y: number; z: number };
    newHealth: number;
    newMana: number;
  };
  [GameEventType.ActionOnCooldown]: {
    actionType: string;
    remainingMs: number;
  };
}

export interface GameEvent<T extends GameEventType = GameEventType> {
  type: T;
  payload: GameEventPayloads[T];
  targetClientId?: string;
}