// 파일 경로: src/components/Environment.tsx (재생성된 파일)

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';

// 하늘, 조명, 그림자를 모두 관리하는 컴포넌트
export const Environment = ({ targetRef }: { targetRef: React.RefObject<RapierRigidBody> }) => {
  const lightRef = useRef<THREE.DirectionalLight>(null!);
  const { scene } = useThree();

  // light.target을 씬에 추가하여 그림자가 정상적으로 렌더링되도록 합니다.
  useEffect(() => {
    if (lightRef.current) {
      scene.add(lightRef.current.target);
    }
    return () => {
      if (lightRef.current) {
        scene.remove(lightRef.current.target);
      }
    }
  }, [scene]);

  // 매 프레임마다 광원의 위치와 타겟을 배에 맞춰 업데이트합니다.
  useFrame(() => {
    if (lightRef.current && targetRef.current) {
      const shipPosition = targetRef.current.translation();
      // 광원의 위치를 배의 위치를 기준으로 설정합니다.
      lightRef.current.position.set(
        shipPosition.x + 50, 
        shipPosition.y + 50, 
        shipPosition.z + 25
      );
      // 광원이 항상 배를 바라보도록 타겟 위치를 설정합니다.
      lightRef.current.target.position.copy(shipPosition);
      lightRef.current.target.updateMatrixWorld();
    }
  });
  
  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <ambientLight intensity={1.5} />
      <directionalLight 
        ref={lightRef}
        position={[100, 100, 50]} // 초기 위치
        intensity={2} 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-left={-50} 
        shadow-camera-right={50} 
        shadow-camera-top={50} 
        shadow-camera-bottom={-50} 
      />
    </>
  );
};
