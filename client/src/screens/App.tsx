import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { View, Stats, Preload } from '@react-three/drei';
import '../index.css'; 
import Game from './Game';
import MiniMap from './MiniMap'; 
import { useSocketConnect } from '../hooks/useSocket';
import { Crosshair } from '../components/UI/Crosshair';
import { HUD } from '../components/UI/HUD';
import { DeathScreen } from '../components/UI/DeathScreen';
import { Notifications } from '../components/UI/Notifications';
import ConnectionStats from '../components/ConnectionStats';
import { useSocketStore, useLoadingStore } from '../state/Store';
import { socket } from '../socket/socket';
import * as THREE from 'three';
import { gl } from '../constants/constants';
import { Suspense } from 'react';
import { LoadingScreen } from './LoadingScreen';
import ActionBar from '../components/ActionBar';
import { useResetAction } from '../hooks/useResetAction';

// import {Perf} from 'r3f-perf'
// import {useDetectGPU} from '@react-three/drei';

export default function App({ selectedClass }: { selectedClass: string }) {
  useSocketConnect(selectedClass);
  const localPlayer = useSocketStore((state) => state.players[socket.id!]);
  const isSceneReady = useLoadingStore((state) => state.isSceneReady);

  const mainViewRef = useRef(null!);
  const minimapViewRef = useRef(null!);

  useResetAction()

  return (
    <div ref={mainViewRef} className="container">
      <div ref={minimapViewRef} className="view2" />
      <Canvas
        gl={gl}
        shadows={{ enabled: true, type: THREE.PCFSoftShadowMap }}
        className="canvas"
        onCreated={(state) => (state.gl.autoClear = false)}
      >
        <Suspense fallback={<LoadingScreen />}>
          <View index={1} track={mainViewRef}>
            <Game />
          </View>
          <View index={2} track={minimapViewRef}>
            <MiniMap />
          </View>
          <Preload all />
        </Suspense>
        <View.Port />
      </Canvas>
      
      {isSceneReady && localPlayer?.status === 'alive' && (
        <>
          <Crosshair />
          <HUD />
          <ActionBar />
        </>
      )}
      {localPlayer?.status === 'dead' && <DeathScreen />}
      <ConnectionStats />
      <Notifications />
      <Stats />
    </div>
  );
}