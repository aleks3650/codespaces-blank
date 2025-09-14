import { classData } from '../constants/classes';
import { socket } from '../socket/socket';
import { useActionStore, useSocketStore } from '../state/Store'; // Zmieniony import
import { AbilityIcon } from './AbilityIcon';

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
    return state.players[socket.id!];
};

const ActionBar = () => {
    const localPlayer = useSocketStore(selectLocalPlayer);
    
    // Pobieramy wybraną akcję z nowego store'a
    const { selectedAction } = useActionStore();

    if (!localPlayer?.class) {
        return null;
    }

    const playerAbilities = classData.get(localPlayer.class)?.abilities ?? [];

    // Wyświetlamy nazwę wybranej akcji, jeśli jest to umiejętność
    const selectedAbilityName = 
        selectedAction?.type === 'ability' 
        ? selectedAction.id 
        : ''; // Można dodać nazwę przedmiotu, jeśli jest wybrany

    return (
        <>
            {/* Wyświetla nazwę aktualnie wybranej umiejętności */}
            <h1 className='choosed-ability'>{selectedAbilityName}</h1>
            
            <div className="action-bar-container">
                {playerAbilities.map((abilityId, index) => (
                    <AbilityIcon
                        key={abilityId}
                        abilityId={abilityId}
                        hotkey={index + 1}
                    />
                ))}
            </div>
        </>
    );
};

export default ActionBar;