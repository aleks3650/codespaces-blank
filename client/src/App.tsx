import { Canvas } from "@react-three/fiber";
import { Stats, View } from "@react-three/drei";
import * as THREE from "three";
import ConnectionStats from "./components/ConnectionStats";
import { gl } from "./constants/constants";
import Game from "./screens/Game";
import MiniMap from "./screens/MiniMap";
import { useSocketConnect } from "./hooks/useSocket";

export default function App() {
  useSocketConnect();

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
      <ConnectionStats />
      <Stats />
    </div>
  );
}