import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useFloatingTextStore } from '../../state/FloatingTextStore';

interface FloatingTextProps {
    id: string;
    text: string;
    position: THREE.Vector3;
    color?: string;
    fontSize?: number;
}

const DURATION = 1.5;
const FLOAT_SPEED = 0.5;

export const FloatingText = ({ id, text, position, color = 'white', fontSize = 0.05 }: FloatingTextProps) => {
    const removeText = useFloatingTextStore((state) => state.removeText);
    const textRef = useRef<any>(null!);
    const lifeTimer = useRef(0);

    useFrame((_, delta) => {
        lifeTimer.current += delta;
        if (textRef.current) { 
            textRef.current.position.y += FLOAT_SPEED * delta;
            if (lifeTimer.current > DURATION / 2) {
                const progress = (lifeTimer.current - DURATION / 2) / (DURATION / 2);
                textRef.current.material.opacity = 1 - progress;
            }
        }
        if (lifeTimer.current >= DURATION) {
            removeText(id);
        }
    });

    return (
        <Billboard position={position}>
            <Text
                ref={textRef}
                font='/Inter-Regular.woff' 
                fontSize={fontSize}
                color={color}
                strokeWidth=".5%"
                strokeColor="black"
                anchorX="center"
                anchorY="middle"
            >
                {text}
            </Text>
        </Billboard>
    );
};
