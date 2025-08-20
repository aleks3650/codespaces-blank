import { Canvas } from "@react-three/fiber";
import { Stats, View } from "@react-three/drei";
import * as THREE from "three";
import ConnectionStats from "../components/ConnectionStats";
import { gl } from "../constants/constants";
import Game from "./Game";
import MiniMap from "./MiniMap";
import { useSocketConnect } from "../hooks/useSocket";
import { Crosshair } from "../components/UI/Crosshair";
import { HUD } from "../components/UI/HUD";
import { useSocketStore } from "../state/Store";
import { socket } from "../socket/socket";
import { DeathScreen } from "../components/UI/DeathScreen";
import { Notifications } from "../components/UI/Notifications";

export default function App() {
  useSocketConnect();
  const localPlayer = useSocketStore((state) => state.players[socket.id!]);

  return (
    <div className="container">
      <View index={1} className="view1">
        <Game />
      </View>

      <View index={2} className="view2">
        <MiniMap />
      </View>
      <Canvas
        gl={gl}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        className="canvas"
        onCreated={(state) => (state.gl.autoClear = false)}
      >
        <View.Port />
      </Canvas>
      {localPlayer?.status === 'alive' && (
        <>
          <Crosshair />
          <HUD />
        </>
      )}

      {localPlayer?.status === 'dead' && <DeathScreen />}
      <ConnectionStats />
      <Notifications />
      <Stats />
    </div>
  );
}