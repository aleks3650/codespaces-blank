import { useSocketStore } from "../state/Store";
import Player from "./Player";

const Players = () => {
    const players = useSocketStore((state) => state.gameState.players);

    return (
        <>
            {Object.entries(players).map(([id, playerState]) => (
                <Player key={id} {...playerState} />
            ))}
        </>
    );
};

export default Players;
