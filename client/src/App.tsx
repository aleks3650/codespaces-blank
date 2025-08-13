import "./App.css";
import { useSocketConnect } from "./hooks/useSocket";
import { Canvas } from "@react-three/fiber";
import ConnectionStats from "./components/ConnectionStats";
import EnvironmentItem from "./components/Environment";
import LocalPlayer from "./players/LocalPlayer";
import RemotePlayers from "./players/RemotePlayers";
import { useRef } from "react";
import * as THREE from "three";
import { PlayerControls } from "./players/PlayerControls";
import { Stats } from "@react-three/drei";


function App() {
  useSocketConnect();
    const playerRef = useRef<THREE.Group>(null!);

  return (
    <>
      <Canvas
        style={{ height: "100dvh", width: "100dvw", position: "relative" }}
        onClick={(e) => (e.target as HTMLCanvasElement).requestPointerLock()}
      > 
        <Stats />
        <EnvironmentItem />
        <LocalPlayer ref={playerRef} />
        <RemotePlayers />
        <PlayerControls playerRef={playerRef} />
      </Canvas>
      <ConnectionStats />
    </>
  );
}

export default App;
