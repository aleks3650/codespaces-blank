
interface ColliderVisualizerProps {
  radius: number;
  length: number;
}

export const ColliderBox = ({ radius, length }: ColliderVisualizerProps) => {
  return (
    <mesh>
      <capsuleGeometry args={[radius, length]} />
      <meshBasicMaterial
        color="lime" 
        wireframe={true}
        transparent={true}
        opacity={0.75}
      />
    </mesh>
  );
};