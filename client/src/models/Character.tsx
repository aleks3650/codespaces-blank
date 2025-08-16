import * as THREE from 'three'
import React, { useRef, useLayoutEffect } from 'react'
import { useGraph } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import type { GLTF } from 'three-stdlib'
import { Wand } from './Wand'

type ActionName = 'static' | 'idle' | 'walk' | 'sprint' | 'jump' | 'fall' | 'crouch' | 'sit' | 'drive' | 'die' | 'pick-up' | 'emote-yes' | 'emote-no' | 'holding-right' | 'holding-left' | 'holding-both' | 'holding-right-shoot' | 'holding-left-shoot' | 'holding-both-shoot' | 'attack-melee-right' | 'attack-melee-left' | 'attack-kick-right' | 'attack-kick-left' | 'interact-right' | 'interact-left' | 'wheelchair-sit' | 'wheelchair-look-left' | 'wheelchair-look-right' | 'wheelchair-move-forward' | 'wheelchair-move-back' | 'wheelchair-move-left' | 'wheelchair-move-right'

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName
}

export type GLTFResult = GLTF & {
  nodes: {
    ['body-mesh']: THREE.SkinnedMesh
    ['head-mesh']: THREE.SkinnedMesh
    root: THREE.Bone
  }
  materials: {
    colormap: THREE.MeshStandardMaterial
  }
  animations: GLTFAction[]
}

// @ts-ignore
export function CharacterModel(props: JSX.IntrinsicElements['group']) {
  const group = React.useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.SkinnedMesh>(null)
  const itemRef = useRef<THREE.Group>(null)

  const { scene, animations } = useGLTF('/character.glb')
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { nodes, materials } = useGraph(clone) as unknown as GLTFResult
  const { actions: _actions } = useAnimations(animations, group)

  useLayoutEffect(() => {
    if (!bodyRef.current || !itemRef.current) return;

    const skeleton = bodyRef.current.skeleton;
    const handBone = skeleton.getBoneByName('arm-right'); 

    if (handBone) {
      handBone.add(itemRef.current);
      itemRef.current.position.set(-0.22, 0, .2); 
      itemRef.current.rotation.set(0, 0, Math.PI / 2); 
      itemRef.current.scale.set(2, 2, 1); 
    }

    return () => {
      if (handBone && itemRef.current) {
        handBone.remove(itemRef.current);
      }
    };
  }, []);

  return (
    <group ref={group} {...props} dispose={null} scale={0.1}>
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
          <Wand ref={itemRef}/>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/character.glb')