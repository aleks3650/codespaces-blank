// src/App.tsx

import "./App.css";
import { useSocketConnect } from "./hooks/useSocket";
import { Canvas } from "@react-three/fiber";
import ConnectionStats from "./components/ConnectionStats";
import EnvironmentItem from "./components/Environment";
import LocalPlayer from "./players/LocalPlayer";
import RemotePlayers from "./players/RemotePlayers";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import { PlayerControls } from "./players/PlayerControls";
import { Stats } from "@react-three/drei";
import { FadingLoader } from "./components/FadingLoader";
import { Effects } from "./components/Effects";
import { InputControlsProvider } from "./context/InputContext"; // <-- IMPORTUJEMY

function App() {
  useSocketConnect();
  const playerRef = useRef<THREE.Group>(null!);
  const environmentRef = useRef<THREE.Group>(null!);

  return (
    <>
      <Canvas
        gl={{
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.6,
          outputColorSpace: THREE.SRGBColorSpace,
          antialias: false,
        }}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        style={{ height: "100dvh", width: "100dvw", position: "relative" }}
        onClick={(e) => (e.target as HTMLCanvasElement).requestPointerLock()}
      >
        <Suspense fallback={<FadingLoader />}>
          {/* Obejmujemy wszystko, co potrzebuje dostępu do inputu, naszym Providerem */}
          <InputControlsProvider>
            <Stats />
            <EnvironmentItem ref={environmentRef} />
            <LocalPlayer ref={playerRef} />
            <RemotePlayers />
            <PlayerControls
              playerRef={playerRef}
              environmentRef={environmentRef}
            />
            <Effects />
          </InputControlsProvider>
        </Suspense>
      </Canvas>
      <ConnectionStats />
    </>
  );
}

export default App;