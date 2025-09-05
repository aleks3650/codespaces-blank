import { Environment, Sky } from "@react-three/drei";
// import { ColliderVisualizer } from "./ColliderVisualizer";
import { Mapsko } from "../models/Map";

const EnvironmentItem = () => {
  return (
    <>
      <fog attach="fog" args={['#86a5b1', .5, 7.5]} />
      <group rotation={[Math.PI, 0, 0]}>
        <Sky
          sunPosition={[5, 10, 0]}
          turbidity={1.5}
          rayleigh={.2}
          mieCoefficient={0.003}
          mieDirectionalG={0.99}
        />
      </group>
      <Environment preset="sunset" background={false} />
      <ambientLight intensity={0.15} />
      <directionalLight
        castShadow
        position={[5, 10, 0]}
        intensity={.5}
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
        shadow-normalBias={0.05}
      />
      <Mapsko />
      {/* <ColliderVisualizer /> */}
    </>
  );
};

export default EnvironmentItem;
