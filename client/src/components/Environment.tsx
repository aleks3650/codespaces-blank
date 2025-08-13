import { EnvironmentMap, Sky } from "@react-three/drei";
import { ColliderVisualizer } from "./ColliderVisualizer";
import { Mapsko } from "../map/Mapsko";

const EnvironmentItem = () => {

  return (
    <>
      <Sky sunPosition={[0, 5, 1]} />
      <EnvironmentMap preset="sunset" />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 15]} intensity={1} />
      <Mapsko />
      <ColliderVisualizer />
    </>
  );
};

export default EnvironmentItem;
