import { Game } from "../game.ts";
import { UseItemPayload } from "../helpers/types.ts";
import { IActionCommand } from "./actionCommands.ts";
import { itemData } from "../gameData/items.ts";
import { GameEventType } from "../helpers/gameEvents.ts";

export class UseItemCommand implements IActionCommand<UseItemPayload> {
    execute(game: Game, playerId: string, payload: UseItemPayload): void {
        const player = game.getPlayer(playerId);
        if (!player || player.status === 'dead') return;

        const now = Date.now();
        if (now < (player.consumableCooldownEndsAt ?? 0)) {
            game.eventManager.queueEvent(GameEventType.ActionOnCooldown, {
                actionType: 'consumable',
                remainingMs: player.consumableCooldownEndsAt! - now,
            }, playerId);
            return;
        }

        const inventorySlot = player.inventory[payload.inventorySlot];
        if (!inventorySlot) {
            console.warn(`Player ${playerId} tried to use item from empty slot: ${payload.inventorySlot}`);
            return;
        }

        const itemDef = itemData.get(inventorySlot.itemId);
        if (!itemDef || itemDef.type !== 'consumable') return;

        for (const effect of itemDef.effects) {
            switch (effect.type) {
                case 'heal_health':
                    game.applyHeal(playerId, effect.amount);
                    break;
                case 'restore_mana':
                    game.applyManaRestore(playerId, effect.amount);
                    break;
                case 'apply_status_effect':
                    game.applyStatusEffect(playerId, effect.effectId, playerId);
                    break;
            }
        }
        
        inventorySlot.quantity -= 1;
        if (inventorySlot.quantity <= 0) {
            player.inventory.splice(payload.inventorySlot, 1);
        }
        player.consumableCooldownEndsAt = now + itemDef.cooldownMs;
    }
}