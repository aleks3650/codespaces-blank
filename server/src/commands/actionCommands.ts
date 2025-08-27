import { Game } from "../game.ts";
import { CastSpellPayload } from "../helpers/types.ts";
import { spellData } from "../gameData/spells.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

export interface IActionCommand<T> {
    execute(game: Game, playerId: string, payload: T): void;
}

export class CastSpellCommand implements IActionCommand<CastSpellPayload> {
    execute(game: Game, playerId: string, payload: CastSpellPayload): void {
        const playerState = game.getPlayer(playerId);
        if (!playerState || playerState.status === 'dead') return;

        const spellId = payload.spellId;
        const spell = spellData.get(spellId);

        if (!spell) {
            console.warn(`Player ${playerId} tried to cast unknown spell: ${spellId}`);
            return;
        }

        const cooldownEndsAt = playerState.spellCooldowns.get(spell.id) ?? 0;
        if (Date.now() < cooldownEndsAt) {
            game.eventManager.queueEvent(
                GameEventType.SpellOnCooldown,
                { spellId: spell.id, remainingMs: cooldownEndsAt - Date.now() },
                playerId
            );
            return;
        }

        if (playerState.mana < spell.manaCost) {
            game.eventManager.queueEvent(
                GameEventType.SpellCastFailed,
                { reason: 'not_enough_mana' },
                playerId
            )
            return;
        }

        playerState.mana -= spell.manaCost;
        playerState.spellCooldowns.set(spell.id, Date.now() + spell.cooldown * 1000);

        game.eventManager.queueEvent(GameEventType.PlayerCastSpell, {
            casterId: playerId,
            spellId: spell.id
        })

        const result = game.physics.castRayForSpell(playerId, payload.direction, spell.range);

        switch (result.type) {
            case "player":
                game.applyDamage(result.playerId, spell.damage, playerId);
                if (spell.appliesEffectId) {
                    game.applyStatusEffect(result.playerId, spell.appliesEffectId, playerId);
                }
                game.eventManager.queueEvent(GameEventType.SpellImpactPlayer, {
                    spellId: spell.id,
                    casterId: playerId,
                    hitPlayerId: result.playerId,
                    hitPoint: result.point
                });
                break;
            case "world":
                game.eventManager.queueEvent(GameEventType.SpellImpactWorld, {
                    spellId: spell.id,
                    casterId: playerId,
                    hitPoint: result.point
                });
                break;
            case "miss":
                game.eventManager.queueEvent(
                    GameEventType.SpellCastFailed,
                    { reason: 'missed' },
                    playerId
                )
                break;
        }
    }
}