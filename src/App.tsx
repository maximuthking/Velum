// 파일 경로: src/App.tsx (수정된 파일)

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Ship } from './components/Ship';
import { useSetAtom, useAtomValue } from 'jotai';
import { isFishingAtom, fishingResultAtom, isInventoryOpenAtom } from './store/gameStore';
import { Physics, RapierRigidBody, CuboidCollider, RigidBody } from '@react-three/rapier';
import { Rock } from './components/Rock';
import { FishingUI } from './components/ui/FishingUI';
import { PlayerUI } from './components/ui/PlayerUI';
import { World } from './components/World';
import { Environment } from './components/Environment';
import { Ocean } from './components/Water';
import { Harbor } from './components/Harbor';
import { HarborUI } from './components/ui/HarborUI';
import { InventoryUI } from './components/ui/InventoryUI';
import { Leva } from 'leva'; // Leva 컴포넌트 import

// 낚시 시작 컨트롤러
const FishingController = () => {
  const setIsFishing = useSetAtom(isFishingAtom);
  const setFishingResult = useSetAtom(fishingResultAtom);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        console.log("낚시 시작!");
        setFishingResult(null);
        setIsFishing(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setIsFishing, setFishingResult]);

  return null;
};

// 인벤토리 컨트롤러
const InventoryController = () => {
  const setIsOpen = useSetAtom(isInventoryOpenAtom);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyI') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setIsOpen]);
  return null;
};


// 낚시 결과 텍스트
const FishingResultText = ({ target }: { target: React.RefObject<RapierRigidBody> }) => {
  const result = useAtomValue(fishingResultAtom);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (result) {
      if(result === 'fail') {
        setText('놓쳤다...');
      } else {
        setText(result);
      }
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!visible || !target.current) return null;
  
  const position = target.current.translation();

  return (
    <Html position={[position.x, position.y + 2, position.z]}>
      <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px', whiteSpace: 'nowrap' }}>
        {text}
      </div>
    </Html>
  );
}

// 씬 컴포넌트
const Scene = () => {
  const shipRef = useRef<RapierRigidBody>(null!);
  const controlsRef = useRef<any>(null!);
  const lightRef = useRef<THREE.DirectionalLight>(null!);

  useFrame((state) => {
    if (shipRef.current && controlsRef.current && lightRef.current) {
      const shipPosition = shipRef.current.translation();
      
      // 카메라가 배를 따라다니도록 업데이트
      const offset = new THREE.Vector3().subVectors(state.camera.position, controlsRef.current.target);
      controlsRef.current.target.copy(shipPosition);
      state.camera.position.copy(shipPosition).add(offset);
      controlsRef.current.update();

      // 광원이 배를 따라다니도록 업데이트
      lightRef.current.position.set(shipPosition.x + 100, shipPosition.y + 150, shipPosition.z + 50);
      lightRef.current.target.position.copy(shipPosition);
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <Environment lightRef={lightRef} />
      <Ocean lightRef={lightRef} />
      
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        minDistance={15}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.2}
      />
      
      <Physics>
        <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[2000, 1, 2000]} position={[0, -1.5, 0]} />
        </RigidBody>
        
        <Ship ref={shipRef} />
        <World />
        <Harbor position={[-10, 0, -10]} />

        <Rock position={[0, 0, -20]} />
        <Rock position={[10, 0, -30]} />
        <Rock position={[-15, 0, -40]} />
      </Physics>
      
      <FishingController />
      <InventoryController />
      <FishingResultText target={shipRef} />
    </>
  );
};

// 메인 UI 컴포넌트
const GameUI = () => {
  return (
    <>
      <PlayerUI />
      <FishingUI />
      <HarborUI />
      <InventoryUI />
    </>
  )
}

// 메인 App 컴포넌트
function App() {
  return (
    <>
      <Leva collapsed />
      <Canvas shadows camera={{ position: [0, 30, 30], fov: 50 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <GameUI />
    </>
  );
}

export default App;
