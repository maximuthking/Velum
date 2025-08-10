// 파일 경로: src/components/Scene.tsx

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Physics, RapierRigidBody, CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';

// 컴포넌트 Import
import { Environment } from './Environment';
import { Ocean } from './Water';
import { Ship } from './Ship';
import { World } from './World';
import { Harbor } from './Harbor';
import { OtherPlayers } from './OtherPlayers';
import { Rock } from './Rock';

// 상태 관리 및 데이터 Import
import { isFishingAtom, fishingResultAtom, isInventoryOpenAtom } from '../store/stores';

// 낚시 시작 컨트롤러 (키 입력 감지)
const FishingController = () => {
  const setIsFishing = useSetAtom(isFishingAtom);
  const setFishingResult = useSetAtom(fishingResultAtom);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') {
        setFishingResult(null);
        setIsFishing(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setIsFishing, setFishingResult]);

  return null;
};

// 인벤토리 창 열기 컨트롤러 (키 입력 감지)
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

// 낚시 결과 텍스트를 배 위에 표시하는 컴포넌트
const FishingResultText = ({ target }: { target: React.RefObject<RapierRigidBody> }) => {
  const result = useAtomValue(fishingResultAtom);
  const [visible, setVisible] = React.useState(false);
  const [text, setText] = React.useState("");

  useEffect(() => {
    if (result) {
      setText(result === 'fail' ? '놓쳤다...' : result);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result]);

  if (!visible || !target.current) return null;
  
  const position = target.current.translation();

  return (
    <Html position={[position.x, position.y + 2, position.z]}>
      <div className="fishing-result-text">
        {text}
      </div>
    </Html>
  );
}

// 3D 씬의 모든 요소를 포함하는 메인 컴포넌트
export const Scene = () => {
  const shipRef = useRef<RapierRigidBody>(null!);
  const controlsRef = useRef<any>(null!);
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  
  const smoothTarget = useRef(new THREE.Vector3()).current;

  // 매 프레임마다 카메라와 조명이 배를 따라가도록 업데이트
  useFrame((state) => {
    if (shipRef.current && controlsRef.current && lightRef.current) {
      const shipPosition = shipRef.current.translation();
      
      // 카메라 타겟을 부드럽게 이동
      smoothTarget.lerp(shipPosition, 0.1);

      const offset = new THREE.Vector3().subVectors(state.camera.position, controlsRef.current.target);
      controlsRef.current.target.copy(smoothTarget);
      state.camera.position.copy(smoothTarget).add(offset);
      controlsRef.current.update();

      // 조명 위치 업데이트
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
        {/* 바닥 충돌체 */}
        <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[2000, 1, 2000]} position={[0, -1.5, 0]} />
        </RigidBody>
        
        {/* 게임 월드 요소들 */}
        <Ship ref={shipRef} />
        <World />
        <Harbor position={[-10, 0, -10]} />
        <OtherPlayers />

        {/* 장애물 */}
        <Rock position={[0, 0, -20]} />
        <Rock position={[10, 0, -30]} />
        <Rock position={[-15, 0, -40]} />
      </Physics>
      
      {/* 키 입력 감지용 컨트롤러 */}
      <FishingController />
      <InventoryController />
      <FishingResultText target={shipRef} />
    </>
  );
};
