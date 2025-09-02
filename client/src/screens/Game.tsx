import EnvironmentItem from "../components/Environment";
import { InputControlsProvider } from "../context/InputContext";
import LocalPlayer from "../players/LocalPlayer";
import { PlayerControls } from "../players/PlayerControls";
import RemotePlayers from "../players/RemotePlayers";
import { EffectsManager } from "../components/effects/EffectsManager";
import { FloatingTextManager } from "../components/effects/FloatingTextManager";
import { Effects } from "../components/Effects";
import { SceneReadySignal } from "../components/SceneReadySignal";

const Game = () => {

    return (
        <InputControlsProvider>
            <EnvironmentItem />
            <LocalPlayer />
            <RemotePlayers />
            <PlayerControls />
            <EffectsManager />
            <FloatingTextManager />
            <Effects />
            <SceneReadySignal />
        </InputControlsProvider>
    );
};

export default Game;
