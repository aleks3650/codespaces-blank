import { Effects } from "../components/Effects";
import EnvironmentItem from "../components/Environment";
import { InputControlsProvider } from "../context/InputContext";
import LocalPlayer from "../players/LocalPlayer";
import { PlayerControls } from "../players/PlayerControls";
import RemotePlayers from "../players/RemotePlayers";
import { EffectsManager } from "../components/effects/EffectsManager";
import { FloatingTextManager } from "../components/effects/FloatingTextManager";

const Game = () => {

    return (
        <InputControlsProvider>
            <EnvironmentItem />
            <LocalPlayer />
            <RemotePlayers />
            <PlayerControls />
            <Effects />
            <EffectsManager />
            <FloatingTextManager />
        </InputControlsProvider>
    );
};

export default Game;
