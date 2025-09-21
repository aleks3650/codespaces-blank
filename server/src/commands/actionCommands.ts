import { Game } from "../game.ts";
import { UseAbilityPayload } from "../helpers/types.ts";
import { abilityData, AbilityDefinition } from "../gameData/abilities.ts";
import { classData } from "../gameData/classes.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

const ABILITY_LOCK_DURATION_MS = 500;

export interface IActionCommand<T> {
    execute(game: Game, playerId: string, payload: T): void;
}

export class UseAbilityCommand implements IActionCommand<UseAbilityPayload> {
    execute(game: Game, playerId: string, payload: UseAbilityPayload): void {
        const playerState = game.getPlayer(playerId);
        if (!playerState || playerState.status === 'dead' || (playerState.actionLockUntil && Date.now() < playerState.actionLockUntil)) {
            return;
        }

        const { abilityId } = payload;
        const ability = abilityData.get(abilityId);

        if (!ability) {
            console.warn(`Player ${playerId} tried to use unknown ability: ${abilityId}`);
            return;
        }

        const playerClassInfo = classData.get(playerState.class);
        if (!playerClassInfo?.abilities.includes(abilityId)) {
            console.warn(`Player ${playerId} of class ${playerState.class} cannot use ability ${abilityId}`);
            return;
        }

        const cooldownEndsAt = playerState.spellCooldowns.get(ability.id) ?? 0;
        if (Date.now() < cooldownEndsAt) {
            game.eventManager.queueEvent(
                GameEventType.SpellOnCooldown,
                { spellId: ability.id, remainingMs: cooldownEndsAt - Date.now() },
                playerId
            );
            return;
        }

        if (playerState.mana < ability.manaCost) {
            game.eventManager.queueEvent(
                GameEventType.SpellCastFailed,
                { reason: 'not_enough_mana' },
                playerId
            );
            return;
        }
        
        const now = Date.now();
        playerState.actionLockUntil = now + ABILITY_LOCK_DURATION_MS;
        playerState.mana -= ability.manaCost;
        playerState.spellCooldowns.set(ability.id, now + ability.cooldown * 1000);

        game.eventManager.queueEvent(GameEventType.PlayerCastSpell, {
            casterId: playerId,
            spellId: ability.id,
        });

        this.executeAbilityEffect(game, playerId, payload, ability);
    }

    private executeAbilityEffect(game: Game, playerId: string, payload: UseAbilityPayload, ability: AbilityDefinition): void {
        switch (ability.type) {
            case 'projectile': {
                const result = game.physics.castRayForSpell(playerId, payload.direction, ability.range);

                if (result.type !== 'miss') {
                    game.eventManager.queueEvent(GameEventType.AreaEffectTriggered, {
                        effectId: 'spellImpact', 
                        position: result.point,
                    });
                }
                
                if (result.type === 'player') {
                    game.applyDamage(result.playerId, ability.damage, playerId);
                    if (ability.appliesEffectId) {
                        game.applyStatusEffect(result.playerId, ability.appliesEffectId, playerId);
                    }
                }
                break;
            }
            case 'radial_aoe': {
                const hitPlayerIds = game.physics.findPlayersInRadius(playerId, ability.radius);
                for (const hitPlayerId of hitPlayerIds) {
                    game.applyDamage(hitPlayerId, ability.damage, playerId);
                    if (ability.appliesEffectId) {
                        game.applyStatusEffect(hitPlayerId, ability.appliesEffectId, playerId);
                    }
                }

                const casterController = game.physics.getPlayerController(playerId);
                if (casterController) {
                    const casterPosition = casterController.getState().position;
                    game.eventManager.queueEvent(GameEventType.AreaEffectTriggered, {
                        effectId: ability.id,
                        position: casterPosition,
                    });
                }
                break;
            }
            case 'self_buff': {
                game.applyStatusEffect(playerId, ability.appliesEffectId, playerId);
                break;
            }
        }
    }
}