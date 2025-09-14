import { useEffect } from 'react';
import { useSocketStore, useActionStore } from '../state/Store'; 
import { classData } from '../constants/classes';
import { socket } from '../socket/socket';

export const useActionHotkeys = () => {
    const localPlayer = useSocketStore((state) => state.players[socket.id!]);
    const { selectAction } = useActionStore(); 
    const inventory = useSocketStore((state) => state.players[socket.id!]?.inventory ?? []);

    // Ustawienie domyślnej akcji (pierwsza umiejętność)
    useEffect(() => {
        if (localPlayer?.class) {
            const playerAbilities = classData.get(localPlayer.class)?.abilities;
            if (playerAbilities && playerAbilities.length > 0) {
                selectAction({ type: 'ability', id: playerAbilities[0] });
            }
        }
    }, [localPlayer?.class, selectAction]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat || !localPlayer?.class) return;

            // Klawisze 1-4: Wybór umiejętności
            const playerAbilities = classData.get(localPlayer.class)?.abilities ?? [];
            let abilityIndex = -1;
            if (e.code === 'Digit1') abilityIndex = 0;
            if (e.code === 'Digit2') abilityIndex = 1;
            // ... itd.
            if (abilityIndex !== -1 && playerAbilities[abilityIndex]) {
                selectAction({ type: 'ability', id: playerAbilities[abilityIndex] });
                return;
            }

            // Klawisze 5-8: Wybór przedmiotu
            let itemSlotIndex = -1;
            if (e.code === 'Digit5') itemSlotIndex = 0;
            if (e.code === 'Digit6') itemSlotIndex = 1;
            // ... itd.
            if (itemSlotIndex !== -1 && inventory[itemSlotIndex]) {
                selectAction({ 
                    type: 'item', 
                    id: inventory[itemSlotIndex].itemId, 
                    inventorySlot: itemSlotIndex 
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [localPlayer, inventory, selectAction]);
};
