import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stats, View } from "@react-three/drei";
import * as THREE from "three";
import ConnectionStats from "./components/ConnectionStats";
import { useSocketConnect } from "./hooks/useSocket";
import { gl } from "./constants/constants";
import Game from "./screens/Game";
import MiniMap from "./screens/MiniMap";

export default function App() {
  useSocketConnect();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<THREE.Group>(null!);
  const environmentRef = useRef<THREE.Group>(null!);

  return (
    <div ref={containerRef} className="container">
      <View className="view1">
        <Game playerRef={playerRef} environmentRef={environmentRef} />
      </View>

      <View className="view2">
        <MiniMap
          playerRef={playerRef}
          environmentRef={environmentRef}
        />
      </View>
      <Canvas
        gl={gl}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        className="canvas"
      >
        <View.Port />
      </Canvas>
      <ConnectionStats />
      <Stats />
    </div>
  );
}
