export enum GameEventType {
  PlayerDamaged = 'player-damaged',
  PlayerDeath = 'player-death',
  SpellImpactPlayer = 'spell-impact-player',
  SpellImpactWorld = 'spell-impact-world',

  StatusEffectGained = 'status-effect-gained',
  StatusEffectLost = 'status-effect-lost',

  SpellCastFailed = 'spell-cast-failed',
  SpellOnCooldown = 'spell-on-cooldown',

  PlayerRespawn = 'player-respawn',
}

export interface GameEventPayloads {
  [GameEventType.PlayerDamaged]: {
    playerId: string;
    damage: number;
    newHealth: number;
    attackerId: string;
    position: {x:number, y: number, z: number}
  };
  [GameEventType.PlayerDeath]: {
    playerId: string;
    killerId: string;
  };
  [GameEventType.SpellImpactPlayer]: {
    spellId: string;
    casterId: string;
    hitPlayerId: string;
    hitPoint: { x: number, y: number, z: number };
  };
  [GameEventType.SpellImpactWorld]: {
    spellId: string;
    casterId: string;
    hitPoint: { x: number, y: number, z: number };
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
}

export interface GameEvent<T extends GameEventType = GameEventType> {
  type: T;
  payload: GameEventPayloads[T];
  targetClientId?: string;
}