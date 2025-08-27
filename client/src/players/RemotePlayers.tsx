import { useSocketStore } from "../state/Store";
import { socket } from "../socket/socket";
import RemotePlayer from "./RemotePlayer";

const selectPlayers = (state: ReturnType<typeof useSocketStore.getState>) => state.players;

const RemotePlayers = () => {
    const allPlayers = useSocketStore(selectPlayers);

    const remotePlayers = Object.fromEntries(
        Object.entries(allPlayers).filter(([id]) => id !== socket.id)
    );
    return (
        <>
            {Object.entries(remotePlayers).map(([id, playerState]) => (
                <RemotePlayer key={id} id={id} {...playerState} />
            ))}
        </>
    );
};

export default RemotePlayers;