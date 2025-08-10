// 파일 경로: src/components/models/PlayerShip.tsx

import * as THREE from 'three';
import { useAtomValue } from 'jotai';
// 잘못된 경로를 수정합니다.
import { shipHealthPercentageAtom } from '../../store/stores';

// 배의 외형을 담당하는 컴포넌트
export const PlayerShipModel = () => {
  // Jotai store에서 현재 내구도 비율을 가져옵니다.
  const healthPercentage = useAtomValue(shipHealthPercentageAtom);

  // 내구도에 따라 선체의 색상을 결정합니다.
  const getBodyColor = () => {
    if (healthPercentage <= 30) return "#4B3621"; // 심각한 손상
    if (healthPercentage <= 70) return "#6F5E4E"; // 경미한 손상
    return "#8B4513"; // 정상
  };

  return (
    <group>
        {/* 선체 */}
        <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.5, 2.5]} />
            <meshStandardMaterial color={getBodyColor()} />
        </mesh>
        {/* 갑판 */}
        <mesh castShadow position={[0, 0.25, 0]}>
            <boxGeometry args={[1, 0.1, 2.2]} />
            <meshStandardMaterial color="#A0522D" />
        </mesh>
        {/* 돛대 */}
        <mesh castShadow position={[0, 1, -0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
            <meshStandardMaterial color="#D2B48C" />
        </mesh>
        {/* 돛 */}
        <mesh castShadow position={[0, 1.2, 0]}>
            <planeGeometry args={[1, 1]} />
            {/* 내구도가 70% 이하일 때 돛에 구멍이 난 것처럼 보이도록 투명하게 만듭니다. */}
            <meshStandardMaterial 
              color="white" 
              side={THREE.DoubleSide} 
              transparent={healthPercentage <= 70}
              opacity={healthPercentage <= 70 ? 0.8 : 1}
            />
        </mesh>

        {/* 심각한 손상 시(30% 이하) 연기 파티클(임시)을 보여줍니다. */}
        {healthPercentage <= 30 && (
          <mesh position={[0, 0.5, -1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="black" emissive="grey" />
          </mesh>
        )}
    </group>
  );
};
