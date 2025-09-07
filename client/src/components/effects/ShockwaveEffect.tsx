import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffectStore } from '../../state/Store';

interface ShockwaveEffectProps {
    id: string;
    position: THREE.Vector3;
}

const DURATION = 0.8;
const MAX_RADIUS = 1.0;

export const ShockwaveEffect = ({ id, position }: ShockwaveEffectProps) => {
    const meshRef = useRef<THREE.Mesh>(null!);
    const lifeTimer = useRef(0);
    const removeEffect = useEffectStore((state) => state.removeEffect);

    useFrame((_, delta) => {
        lifeTimer.current += delta;
        const progress = lifeTimer.current / DURATION;

        if (progress >= 1) {
            removeEffect(id);
            return;
        }

        const currentRadius = progress * MAX_RADIUS;
        meshRef.current.scale.set(currentRadius, currentRadius, currentRadius);

        // @ts-ignore
        meshRef.current.material.opacity = 1.0 - progress * progress;
    });

    return (
        <mesh ref={meshRef} position={position} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.95, 1, 64]} />
            <meshStandardMaterial color="yellow" emissive="yellow" transparent side={THREE.DoubleSide} />
        </mesh>
    );
};