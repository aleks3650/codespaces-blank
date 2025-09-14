import { Game } from "../game.ts";
import { ResetPlayerPayload } from "../helpers/types.ts";
import { IActionCommand } from "./actionCommands.ts";
import {GameEventType} from "../helpers/gameEvents.ts";

const PLAYER_RESET_COOLDOWN_MS = 30000

export class ResetPlayerCommand implements IActionCommand<ResetPlayerPayload> {
    execute(game: Game, playerId: string, _payload: ResetPlayerPayload): void {
        const playerState = game.getPlayer(playerId);
        if (!playerState) {
            console.warn(`Attempted to reset non-existent player: ${playerId}`);
            return;
        }

        const now = Date.now();
        const cooldownEndsAt = playerState.resetCooldownEndsAt ?? 0;

        if (now < cooldownEndsAt) {
            const remainingMs = cooldownEndsAt - now;
            console.log(`Player ${playerId} reset is on cooldown. ${Math.ceil(remainingMs / 1000)}s remaining.`);
            
            game.eventManager.queueEvent(
                GameEventType.ActionOnCooldown,
                { actionType: 'resetPlayer', remainingMs },
                playerId 
            );
            return; 
        }

        game.resetPlayer(playerId);

        playerState.resetCooldownEndsAt = now + PLAYER_RESET_COOLDOWN_MS;
    }
}
