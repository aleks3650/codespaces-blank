import { classData } from '../constants/classes';
import { socket } from '../socket/socket';
import { useAbilityStore } from '../state/Store';
import { useSocketStore } from '../state/Store';
import { AbilityIcon } from './AbilityIcon';

const selectLocalPlayer = (state: ReturnType<typeof useSocketStore.getState>) => {
    return state.players[socket.id!];
};

const ActionBar = () => {
    const localPlayer = useSocketStore(selectLocalPlayer);
    const { selectedAbilityId } = useAbilityStore();

    if (!localPlayer?.class) {
        return null;
    }
    const playerAbilities = classData.get(localPlayer.class)?.abilities ?? [];

    const selectedAbility = playerAbilities.find(ability => ability === selectedAbilityId)

    return (
        <>
            <h1 className='choosed-ability'>{selectedAbility}</h1>
            <div className="action-bar-container">
                {playerAbilities.map((abilityId, index) => (
                    <AbilityIcon
                        key={abilityId}
                        abilityId={abilityId}
                        hotkey={index + 1}
                        isSelected={abilityId === selectedAbilityId}
                    />
                ))}
            </div>
        </>
    );
};

export default ActionBar;