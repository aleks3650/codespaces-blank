type ItemEffect = 
    | { type: 'heal_health'; amount: number }
    | { type: 'restore_mana'; amount: number }
    | { type: 'apply_status_effect'; effectId: string };

export interface ConsumableDefinition {
    id: string;
    name: string;
    type: 'consumable';
    effects: ItemEffect[];
    cooldownMs: number;
}

export type ItemDefinition = ConsumableDefinition;

export const itemData = new Map<string, ItemDefinition>([
    [
        "cheese",
        {
            id: "cheese",
            name: "Kawałek sera",
            type: 'consumable',
            effects: [{ type: 'heal_health', amount: 25 }],
            cooldownMs: 20000,
        }
    ],
    [
        "mana_potion",
        {
            id: "mana_potion",
            name: "Eliksir Many",
            type: 'consumable',
            effects: [{ type: 'restore_mana', amount: 40 }],
            cooldownMs: 30000,
        }
    ],
    [
        "spiced_meat",
        {
            id: "spiced_meat",
            name: "Mięso z przyprawami",
            type: 'consumable',
            effects: [
                { type: 'heal_health', amount: 15 },
                { type: 'apply_status_effect', effectId: 'well_fed' }
            ],
            cooldownMs: 45000,
        }
    ],
]);