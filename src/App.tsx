// 파일 경로: src/App.tsx

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Ship } from './components/Ship';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { shipHealthAtom } from './store/shipStore';
import { isFishingAtom, fishingResultAtom } from './store/gameStore';
import { playerGoldAtom } from './store/playerStore';
import { Physics, RapierRigidBody, CuboidCollider, RigidBody } from '@react-three/rapier'; // RigidBody import 추가
import { Rock } from './components/Rock';
import { FishingUI } from './components/ui/FishingUI';
import { PlayerUI } from './components/ui/PlayerUI';
import { World } from './components/World';
import { Environment } from './components/Environment';
import { Ocean } from './components/Water';

// 게임 액션 컨트롤러 (수리 로직)
const GameActionsController = () => {
  const [shipHealth, setShipHealth] = useAtom(shipHealthAtom);
  const [playerGold, setPlayerGold] = useAtom(playerGoldAtom);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        const repairCost = 100 - shipHealth;
        if (playerGold >= repairCost) {
          setShipHealth(100);
          setPlayerGold((prev) => prev - repairCost);
          console.log(`Ship repaired! -${repairCost} Gold`);
        } else {
          console.log("골드가 부족합니다!");
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shipHealth, setShipHealth, playerGold, setPlayerGold]);

  return null;
};

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

// 낚시 결과 텍스트
const FishingResultText = ({ target }: { target: React.RefObject<RapierRigidBody> }) => {
  const result = useAtomValue(fishingResultAtom);
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (result) {
      setText(result === 'success' ? '잡았다!' : '놓쳤다...');
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!visible || !target.current) return null;
  
  const position = target.current.translation();

  return (
    <Html position={[position.x, position.y + 2, position.z]}>
      <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '5px' }}>
        {text}
      </div>
    </Html>
  );
}

// 카메라 컴포넌트
const GameCamera = ({ target }: { target: React.RefObject<RapierRigidBody> }) => {
  const [zoom, setZoom] = useState(25);

  useFrame(({ camera }) => {
    if (target.current) {
      const shipPosition = target.current.translation();
      const offset = new THREE.Vector3(0, zoom, zoom * 0.75);
      const desiredPosition = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z).add(offset);
      camera.position.lerp(desiredPosition, 0.1);
      camera.lookAt(shipPosition.x, shipPosition.y, shipPosition.z);
    }
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      setZoom(prev => Math.max(15, Math.min(50, prev + e.deltaY * 0.05)));
    };
    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  return null;
}

// 씬 컴포넌트
const Scene = () => {
  const shipRef = useRef<RapierRigidBody>(null!);

  return (
    <>
      <Environment targetRef={shipRef} />
      <Ocean />
      
      <Physics>
        <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[2000, 1, 2000]} position={[0, -1.5, 0]} />
        </RigidBody>
        
        <Ship ref={shipRef} />
        <World />

        <Rock position={[0, 0, -20]} />
        <Rock position={[10, 0, -30]} />
        <Rock position={[-15, 0, -40]} />
      </Physics>
      
      <GameCamera target={shipRef} />
      <GameActionsController />
      <FishingController />
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
    </>
  )
}

// 메인 App 컴포넌트
function App() {
  return (
    <>
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
