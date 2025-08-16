import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  playerRef: React.RefObject<THREE.Group>;
  environmentRef: React.RefObject<THREE.Group>;
};

export default function MiniMap({ playerRef, environmentRef }: Props) {
  console.log("Player", playerRef.current,"Environment", environmentRef.current);


  return (
    <>
    <color attach="background" args={['#222']} />
    <ambientLight intensity={0.8} />
    <directionalLight position={[3, 3, 5]} intensity={1} castShadow />
    <PerspectiveCamera makeDefault position={[3, 2, 4]} fov={50} />
    <OrbitControls makeDefault enablePan={false} />
    <mesh castShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
    </>
  );
}
