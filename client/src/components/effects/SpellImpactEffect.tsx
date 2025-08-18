import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useEffectStore } from '../../state/Store';

interface SpellImpactEffectProps {
  id: string;
  position: THREE.Vector3;
}

const PLAYER_HEIGHT_OFFSET = -0.2;
const EFFECT_DURATION = 0.75;

export const SpellImpactEffect = ({ id, position }: SpellImpactEffectProps) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const lifeTimer = useRef(0);
  const removeEffect = useEffectStore((state) => state.removeEffect);

  const {x,y,z} = position

  const renderPos = useMemo(
    () => new THREE.Vector3(x, y + PLAYER_HEIGHT_OFFSET, z),
    [x, y, z]
  );

  useFrame((_, delta) => {
    lifeTimer.current += delta;

    const progress = lifeTimer.current / EFFECT_DURATION;
    const scale = Math.sin(progress * Math.PI);
    meshRef.current.scale.setScalar(scale * 0.5);

    // @ts-ignore
    meshRef.current.material.opacity = 1.0 - progress;

    if (lifeTimer.current >= EFFECT_DURATION) {
      removeEffect(id);
    }
  });

  return (
    <mesh ref={meshRef} position={renderPos}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="red" emissive="red" transparent />
    </mesh>
  );
};