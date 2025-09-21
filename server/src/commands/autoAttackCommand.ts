// ===== src/commands/autoAttackCommand.ts =====
import { Game } from "../game.ts";
import { AutoAttackPayload } from "../helpers/types.ts";
import { IActionCommand } from "./actionCommands.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

const ATTACK_SWING_SPEED_MS = 1200;
const ATTACK_LOCK_DURATION_MS = 600;
const WARRIOR_ATTACK_RANGE = 0.7; 
const WARRIOR_ATTACK_ANGLE = 25;  
const WARRIOR_ATTACK_DAMAGE = 10;
const MAGE_ATTACK_RANGE = 25.0;
const MAGE_ATTACK_DAMAGE = 5;

export class AutoAttackCommand implements IActionCommand<AutoAttackPayload> {
    execute(game: Game, playerId: string, _payload: AutoAttackPayload): void {
        const player = game.getPlayer(playerId);
        if (!player || player.status === 'dead' || (player.actionLockUntil && Date.now() < player.actionLockUntil)) {
            return;
        }

        const now = Date.now();
        if (now < (player.lastAutoAttackTime ?? 0) + ATTACK_SWING_SPEED_MS) {
            return; // Swing timer not ready
        }

        player.lastAutoAttackTime = now;
        player.actionLockUntil = now + ATTACK_LOCK_DURATION_MS;

        game.eventManager.queueEvent(GameEventType.PlayerAutoAttacked, {
            attackerId: playerId,
        });

        if (player.class === "Warrior") {
            const hitPlayerIds = game.physics.findPlayersInCone(playerId, WARRIOR_ATTACK_RANGE, WARRIOR_ATTACK_ANGLE);
            for (const hitPlayerId of hitPlayerIds) {
                game.applyDamage(hitPlayerId, WARRIOR_ATTACK_DAMAGE, playerId);
            }
        }

        if (player.class === "Mage") {
            const controller = game.physics.getPlayerController(playerId);
            if (!controller) return;
            
            const rot = controller.getState().rotation;
            const forward = { x: 0, y: 0, z: -1 };
            
            const qx = rot.x, qy = rot.y, qz = rot.z, qw = rot.w;
            const x = forward.x, y = forward.y, z = forward.z;

            const ix = qw * x + qy * z - qz * y;
            const iy = qw * y + qz * x - qx * z;
            const iz = qw * z + qx * y - qy * x;
            const iw = -qx * x - qy * y - qz * z;

            const final_x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
            const final_y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
            const final_z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
            
            const direction = [final_x, final_y, final_z];

            const result = game.physics.castRayForSpell(playerId, direction, MAGE_ATTACK_RANGE);

            if (result.type === 'player') {
                game.applyDamage(result.playerId, MAGE_ATTACK_DAMAGE, playerId);
                game.eventManager.queueEvent(GameEventType.AreaEffectTriggered, {
                    effectId: 'spellImpact',
                    position: result.point,
                });
            }
        }
    }
}