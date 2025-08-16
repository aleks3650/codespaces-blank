import { Effects } from "../components/Effects";
import EnvironmentItem from "../components/Environment";
import { InputControlsProvider } from "../context/InputContext";
import LocalPlayer from "../players/LocalPlayer";
import { PlayerControls } from "../players/PlayerControls";
import RemotePlayers from "../players/RemotePlayers";
import { EffectsManager } from "../components/effects/EffectsManager";

const Game = () => {

    return (
        <InputControlsProvider>
            <EnvironmentItem />
            <LocalPlayer />
            <RemotePlayers />
            <PlayerControls />
            <Effects />
            <EffectsManager />
        </InputControlsProvider>
    );
};

export default Game;
