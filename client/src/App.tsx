import "./App.css";
import { useSocketConnect } from "./hooks/useSocket";
import { Canvas } from "@react-three/fiber";
import ConnectionStats from "./components/ConnectionStats";
import EnvironmentItem from "./components/Environment";
import { CameraControls } from "@react-three/drei";
import Players from "./components/Players";


function App() {
  useSocketConnect();

  return (
    <>
      <Canvas
        style={{ height: "100dvh", width: "100dvw", position: "relative" }}
        
      > 
        <CameraControls />
        <EnvironmentItem />
        <Players />
      </Canvas>
      <ConnectionStats />
    </>
  );
}

export default App;
