import { Wand } from '../models/Wand';
import { Axe } from '../models/Axe';
import * as THREE from 'three';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

export type WeaponConfig = {
    component: ForwardRefExoticComponent<Omit<React.JSX.IntrinsicElements['group'], "ref"> & RefAttributes<THREE.Group>>;
    transform: {
        position: THREE.Vector3;
        rotation: THREE.Euler;
        scale: THREE.Vector3;
    };
    attackAnimation: 'interact-right' | 'attack-melee-right';
};

export const WEAPON_CONFIG: Record<string, WeaponConfig> = {
    Mage: {
        component: Wand,
        transform: {
            position: new THREE.Vector3(-0.22, 0, 0.2),
            rotation: new THREE.Euler(0, 0, Math.PI / 2),
            scale: new THREE.Vector3(2, 2, 1),
        },
        attackAnimation: 'interact-right',
    },
    Warrior: {
        component: Axe,
        transform: {
            position: new THREE.Vector3(-0.1, -0.1, 0.3),
            rotation: new THREE.Euler(0, Math.PI / 1.5,0),
            scale: new THREE.Vector3(1.5, 1.5, 1.5),
        },
        attackAnimation: 'attack-melee-right',
    },
};
