import { useEffect } from 'react';
// import { useInputContext } from '../context/InputContext';
import { useSocketStore } from '../state/Store';
import { useAbilityStore } from '../state/Store';
import { classData } from '../constants/classes';
import { socket } from '../socket/socket';

export const useAbilitySelection = () => {
    const localPlayer = useSocketStore((state) => state.players[socket.id!]);
    const selectAbility = useAbilityStore((state) => state.selectAbility);
    const setSelectedAbilityId = useAbilityStore((state) => state.selectAbility);

    useEffect(() => {
        if (localPlayer?.class) {
            const playerAbilities = classData.get(localPlayer.class)?.abilities;
            if (playerAbilities && playerAbilities.length > 0) {
                setSelectedAbilityId(playerAbilities[0]);
            }
        }
    }, [localPlayer?.class, setSelectedAbilityId]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!localPlayer?.class) return;

            const playerAbilities = classData.get(localPlayer.class)?.abilities;
            if (!playerAbilities) return;
            
            let abilityIndex = -1;
            if (e.code === 'Digit1') abilityIndex = 0;
            if (e.code === 'Digit2') abilityIndex = 1;
            if (e.code === 'Digit3') abilityIndex = 2;
            if (e.code === 'Digit4') abilityIndex = 3;

            if (abilityIndex !== -1 && playerAbilities[abilityIndex]) {
                selectAbility(playerAbilities[abilityIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [localPlayer, selectAbility]);
};