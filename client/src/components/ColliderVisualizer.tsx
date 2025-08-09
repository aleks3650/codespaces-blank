import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export function ColliderVisualizer() {
  const rawData = useLoader(THREE.FileLoader, "/map_collider.json");
  const { vertices, indices } = JSON.parse(rawData as string);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return (
    <mesh geometry={geometry} >
      <meshBasicMaterial color="lime" wireframe={true} />
    </mesh>
  );
}