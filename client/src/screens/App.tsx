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
import { Suspense } from "react";
import { useLoadingStore } from "../state/Store";
import { LoadingScreen } from "./LoadingScreen";

export default function App({ selectedClass }: { selectedClass: string }) {
  useSocketConnect(selectedClass);

  const localPlayer = useSocketStore((state) => state.players[socket.id!]);
  const isSceneReady = useLoadingStore((state) => state.isSceneReady);

  return (
    <div className="container">
      <Canvas
        gl={gl}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        className="canvas"
        onCreated={(state) => (state.gl.autoClear = false)}
      >
        <Suspense fallback={<LoadingScreen />}>
          <View index={1} className="view1">
            <Game />
          </View>
          <View index={2} className="view2">
            <MiniMap />
          </View>
          <View.Port />
        </Suspense>
      </Canvas>
      
      {isSceneReady && localPlayer?.status === 'alive' && (
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