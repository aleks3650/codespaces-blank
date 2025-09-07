import { Game } from "../game.ts";
import { UseAbilityPayload } from "../helpers/types.ts";
import { abilityData, AbilityDefinition } from "../gameData/abilities.ts";
import { classData } from "../gameData/classes.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

export interface IActionCommand<T> {
    execute(game: Game, playerId: string, payload: T): void;
}

export class UseAbilityCommand implements IActionCommand<UseAbilityPayload> {
    execute(game: Game, playerId: string, payload: UseAbilityPayload): void {
        const playerState = game.getPlayer(playerId);
        if (!playerState || playerState.status === 'dead') {
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

        playerState.mana -= ability.manaCost;
        playerState.spellCooldowns.set(ability.id, Date.now() + ability.cooldown * 1000);

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

                switch (result.type) {
                    case "player":
                        game.applyDamage(result.playerId, ability.damage, playerId);
                        if (ability.appliesEffectId) {
                            game.applyStatusEffect(result.playerId, ability.appliesEffectId, playerId);
                        }
                        game.eventManager.queueEvent(GameEventType.SpellImpactPlayer, {
                            spellId: ability.id,
                            casterId: playerId,
                            hitPlayerId: result.playerId,
                            hitPoint: result.point,
                        });
                        break;
                    case "world":
                        game.eventManager.queueEvent(GameEventType.SpellImpactWorld, {
                            spellId: ability.id,
                            casterId: playerId,
                            hitPoint: result.point,
                        });
                        break;
                    case "miss":
                        game.eventManager.queueEvent(
                            GameEventType.SpellCastFailed,
                            { reason: 'missed' },
                            playerId
                        );
                        break;
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
                break;
            }

            case 'self_buff': {
                game.applyStatusEffect(playerId, ability.appliesEffectId, playerId);
                break;
            }
        }
    }
}