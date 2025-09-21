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
    autoAttackAnimation: 'interact-right' | 'attack-melee-right';
    attackAnimation: 'interact-right' | 'attack-melee-right';
    abilityAnimations: Record<string, string>;
    genericAnimations: Record<string, string>;
};

export const WEAPON_CONFIG: Record<string, WeaponConfig> = {
    Mage: {
        component: Wand,
        transform: {
            position: new THREE.Vector3(-0.22, 0, 0.2),
            rotation: new THREE.Euler(0, 0, Math.PI / 2),
            scale: new THREE.Vector3(2, 2, 1),
        },
        autoAttackAnimation: 'interact-right',
        attackAnimation: 'interact-right',
        abilityAnimations: {
            fireball: 'interact-right',
            arcaneMissile: 'interact-right',
        },
        genericAnimations: {
            use_item: 'pick-up',
            emote_wave: 'emote-yes',
            'get-hit': 'crouch',
        }
    },
    Warrior: {
        component: Axe,
        transform: {
            position: new THREE.Vector3(-0.1, -0.1, 0.3),
            rotation: new THREE.Euler(0, Math.PI / 1.5, 0),
            scale: new THREE.Vector3(1.5, 1.5, 1.5),
        },
        autoAttackAnimation: 'attack-melee-right',
        attackAnimation: 'attack-melee-right',
        abilityAnimations: {
            groundSlam: 'attack-melee-right',
            battleShout: 'emote-yes',
        },
        genericAnimations: {
            use_item: 'pick-up',
            emote_wave: 'emote-yes',
            'get-hit': 'crouch',
        }
    },
};