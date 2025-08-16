import { Environment, PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useRefStore } from "../state/Store";

export default function MiniMap() {
  const { playerRef, environmentRef } = useRefStore();
  const camRef = useRef<THREE.PerspectiveCamera>(null!);
  const markerRef = useRef<THREE.Mesh>(null!);
  const gl = useThree((state) => state.gl);

  useFrame(() => {
    gl.clearDepth();
    if (camRef.current && playerRef?.current) {
      const pos = playerRef.current.position;
      camRef.current.position.set(pos.x, 7.5, pos.z);
      camRef.current.lookAt(pos.x, 0, pos.z);
    }
    if (markerRef.current && playerRef?.current) {
      markerRef.current.position.copy(playerRef.current.position);
    }
  }, 1);
  if (!playerRef?.current || !environmentRef?.current) {
    return null;
  }

  return (
    <>
      <ambientLight intensity={1} />
      <Environment preset="sunset" />
      <PerspectiveCamera ref={camRef} makeDefault fov={50} />

      <primitive object={environmentRef.current} />
      <primitive object={playerRef.current} />

      <mesh ref={markerRef} renderOrder={999}>
        <coneGeometry args={[0.3, 0.8]} />
        <meshBasicMaterial color="red" depthTest={false} />
      </mesh>
    </>
  );
}
