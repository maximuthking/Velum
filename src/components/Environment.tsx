// 파일 경로: src/components/Environment.tsx

import { useThree } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useEffect } from 'react';

// 하늘, 조명, 그림자를 모두 관리하는 컴포넌트
export const Environment = ({ lightRef }: { lightRef: React.RefObject<THREE.DirectionalLight> }) => {
  const { scene } = useThree();

  // Leva 컨트롤러를 사용하여 하늘과 빛의 속성을 실시간으로 조절
  const { turbidity, rayleigh, sunColor, ambientIntensity } = useControls('Environment Settings', {
    turbidity: { value: 5, min: 0, max: 20, step: 0.1 },
    rayleigh: { value: 3, min: 0, max: 10, step: 0.1 },
    sunColor: '#ffffff',
    ambientIntensity: { value: 0.8, min: 0, max: 2, step: 0.1 },
  });

  // light.target을 씬에 추가하여 그림자가 정상적으로 렌더링되도록 함
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

  return (
    <>
      <Sky 
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={0.005}
        mieDirectionalG={0.7}
        sunPosition={[100, 150, 50]}
      />
      
      <ambientLight intensity={ambientIntensity} />

      <directionalLight 
        ref={lightRef} 
        castShadow
        intensity={1.5}
        color={sunColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
    </>
  );
};
