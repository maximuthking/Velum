// 파일 경로: src/components/Environment.tsx

import { useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useAtom } from 'jotai';
import { timeOfDayAtom } from '../store/gameStore';
import { RapierRigidBody } from '@react-three/rapier';

// 하늘, 조명, 그림자를 모두 관리하는 컴포넌트
export const Environment = ({ lightRef, targetRef }: { lightRef: React.RefObject<THREE.DirectionalLight>, targetRef: React.RefObject<RapierRigidBody> }) => {
  const [timeOfDay, setTimeOfDay] = useAtom(timeOfDayAtom);
  const { scene } = useThree();

  useEffect(() => {
    if (lightRef.current) {
      scene.add(lightRef.current.target);
    }
    return () => {
      if (lightRef.current) {
        scene.remove(lightRef.current.target);
      }
    }
  }, [scene, lightRef]);
  
  useFrame((_, delta) => {
    // 'prev' 매개 변수에 number 타입을 명시적으로 지정합니다.
    setTimeOfDay((prev: number) => (prev + delta / 60) % 24);

    if (targetRef.current && lightRef.current) {
        const shipPosition = targetRef.current.translation();
        const angle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
        const sunX = Math.cos(angle) * 100;
        const sunY = Math.sin(angle) * 100;
        const sunZ = 30;

        lightRef.current.position.set(
            shipPosition.x + sunX,
            shipPosition.y + sunY,
            shipPosition.z + sunZ
        );

        lightRef.current.target.position.copy(shipPosition);
        lightRef.current.target.updateMatrixWorld();
    }
  });

  const cycle = Math.sin((timeOfDay / 24) * Math.PI);
  const directionalIntensity = Math.max(0, cycle) * 2;
  const ambientIntensity = Math.max(0.2, cycle * 1.5);
  const rayleigh = Math.max(0, 2 - (timeOfDay > 6 && timeOfDay < 18 ? 0 : 10));

  return (
    <>
      <Sky sunPosition={lightRef.current?.position} turbidity={10} rayleigh={rayleigh} />
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        ref={lightRef}
        intensity={directionalIntensity}
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-left={-50} 
        shadow-camera-right={50} 
        shadow-camera-top={50} 
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />
    </>
  );
};
