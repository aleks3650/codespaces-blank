import * as THREE from 'three';
import React, { useRef, useLayoutEffect } from 'react';
import type { GLTF } from 'three-stdlib';
import { WEAPON_CONFIG } from '../config/weaponConfig';

type ActionName = 'static' | 'idle' | 'walk' | 'sprint' | 'jump' | 'fall' | 'crouch' | 'sit' | 'drive' | 'die' | 'pick-up' | 'emote-yes' | 'emote-no' | 'holding-right' | 'holding-left' | 'holding-both' | 'holding-right-shoot' | 'holding-left-shoot' | 'holding-both-shoot' | 'attack-melee-right' | 'attack-melee-left' | 'attack-kick-right' | 'attack-kick-left' | 'interact-right' | 'interact-left' | 'wheelchair-sit' | 'wheelchair-look-left' | 'wheelchair-look-right' | 'wheelchair-move-forward' | 'wheelchair-move-back' | 'wheelchair-move-left' | 'wheelchair-move-right';

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

export type GLTFResult = GLTF & {
  nodes: {
    ['body-mesh']: THREE.SkinnedMesh;
    ['head-mesh']: THREE.SkinnedMesh;
    root: THREE.Bone;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type CharacterModelProps = React.JSX.IntrinsicElements['group'] & {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
  characterClass: string;
};

export function CharacterModel({ nodes, materials, characterClass, ...props }: CharacterModelProps) {
  const group = React.useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.SkinnedMesh>(null);
  const itemRef = useRef<THREE.Group>(null);

  const weaponConfig = WEAPON_CONFIG[characterClass];
  const WeaponComponent = weaponConfig?.component;

  useLayoutEffect(() => {
    if (!bodyRef.current || !itemRef.current || !weaponConfig) return;

    const skeleton = bodyRef.current.skeleton;
    const handBone = skeleton.getBoneByName('arm-right');

    if (handBone) {
      handBone.add(itemRef.current);

      const { position, rotation, scale } = weaponConfig.transform;
      itemRef.current.position.copy(position);
      itemRef.current.rotation.copy(rotation);
      itemRef.current.scale.copy(scale);
    }

    return () => {
      if (handBone && itemRef.current) {
        handBone.remove(itemRef.current);
      }
    };
  }, [weaponConfig]);

  return (
    <group ref={group} {...props} dispose={null}>
      <group name="character-male-b" rotation={[0, Math.PI, 0]}>
        <group name="character-male-b_1">
          <primitive object={nodes.root} />
          <skinnedMesh
            ref={bodyRef}
            name="body-mesh"
            geometry={nodes['body-mesh'].geometry}
            material={materials.colormap}
            skeleton={nodes['body-mesh'].skeleton}
          />
          <skinnedMesh
            name="head-mesh"
            geometry={nodes['head-mesh'].geometry}
            material={materials.colormap}
            skeleton={nodes['head-mesh'].skeleton}
          />
          {WeaponComponent && <WeaponComponent ref={itemRef} />}
        </group>
      </group>
    </group>
  );
}