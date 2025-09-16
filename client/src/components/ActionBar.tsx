import { classData } from '../constants/classes';
import { socket } from '../socket/socket';
import { useActionStore, useSocketStore } from '../state/Store';
import { AbilityIcon } from './AbilityIcon';

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
    return state.players[socket.id!];
};

const ActionBar = () => {
    const localPlayer = useSocketStore(selectLocalPlayer);
    const { selectedAction } = useActionStore();

    if (!localPlayer?.class) {
        return null;
    }

    const playerAbilities = classData.get(localPlayer.class)?.abilities ?? [];

    const selectedAbilityName = 
        selectedAction?.type === 'ability' 
        ? selectedAction.id 
        : '';

    return (
        <>
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