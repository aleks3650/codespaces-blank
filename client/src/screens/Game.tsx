import { Effects } from "../components/Effects";
import EnvironmentItem from "../components/Environment";
import { InputControlsProvider } from "../context/InputContext";
import LocalPlayer from "../players/LocalPlayer";
import { PlayerControls } from "../players/PlayerControls";
import RemotePlayers from "../players/RemotePlayers";
import * as THREE from "three";

const Game = ({ environmentRef, playerRef }: {
    environmentRef: React.RefObject<THREE.Group>;
    playerRef: React.RefObject<THREE.Group>;
}) => {

    return (
        <InputControlsProvider>
            <EnvironmentItem ref={environmentRef} />
            <LocalPlayer ref={playerRef} />
            <RemotePlayers />
            <PlayerControls
                playerRef={playerRef}
                environmentRef={environmentRef}
            />
            <Effects />
        </InputControlsProvider>
    );
};

export default Game;
