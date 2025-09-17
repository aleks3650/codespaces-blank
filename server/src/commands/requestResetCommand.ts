import { Game } from "../game.ts";
import { ResetPlayerPayload } from "../helpers/types.ts";
import { IActionCommand } from "./actionCommands.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

const PLAYER_RESET_COOLDOWN_MS = 30000;
const PLAYER_RESET_DURATION_MS = 3000;

export class RequestResetCommand implements IActionCommand<ResetPlayerPayload> {
    execute(game: Game, playerId: string, _payload: ResetPlayerPayload): void {
        const playerState = game.getPlayer(playerId);
        if (!playerState || playerState.status === 'dead' || playerState.resettingUntil) {
            return;
        }

        const now = Date.now();
        const cooldownEndsAt = playerState.resetCooldownEndsAt ?? 0;

        if (now < cooldownEndsAt) {
            game.eventManager.queueEvent(
                GameEventType.ActionOnCooldown,
                { actionType: 'resetPlayer', remainingMs: cooldownEndsAt - now },
                playerId 
            );
            return; 
        }

        playerState.resettingUntil = now + PLAYER_RESET_DURATION_MS;
        playerState.resetCooldownEndsAt = now + PLAYER_RESET_COOLDOWN_MS;

        game.eventManager.queueEvent(
            GameEventType.PlayerResetStarted,
            { playerId: playerId, duration: PLAYER_RESET_DURATION_MS }
        );

        console.log(`Player ${playerId} initiated a reset sequence (${PLAYER_RESET_DURATION_MS / 1000}s).`);
    }
}