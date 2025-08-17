import { Game } from "../game.ts";
import { CastSpellPayload } from "../helpers/types.ts";
import { spellData } from "../gameData/spells.ts";
import { io } from "../helpers/IO_Server.ts";

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
            return;
        }

        if (playerState.mana < spell.manaCost) {
            return;
        }

        playerState.mana -= spell.manaCost;
        playerState.spellCooldowns.set(spell.id, Date.now() + spell.cooldown * 1000);

        const result = game.physics.castRayForSpell(playerId, payload.direction, spell.range);

        switch (result.type) {
            case "player":
                game.applyDamage(result.playerId, spell.damage, playerId);
                if (spell.appliesEffectId) {
                    game.applyStatusEffect(result.playerId, spell.appliesEffectId, playerId);
                }
                io.emit("spell-impact", { casterId: playerId, hitPlayerId: result.playerId, hitPoint: result.point });
                break;
            case "world":
                io.emit("spell-impact", { casterId: playerId, hitPoint: result.point });
                break;
            case "miss":
                io.emit("spell-miss", { casterId: playerId, direction: payload.direction });
                break;
        }
    }
}