// 파일 경로: src/components/Harbor.tsx

import { RigidBody } from '@react-three/rapier';
import { InteractionZone } from './InteractionZone';

// 항구의 시각적 모델과 상호작용 영역을 포함하는 컴포넌트
export const Harbor = (props: any) => {
  return (
    <RigidBody type="fixed" {...props}>
      {/* 부두의 시각적 모델 */}
      <mesh>
        <boxGeometry args={[10, 0.5, 4]} />
        <meshStandardMaterial color="#966F33" />
      </mesh>
      {/* 플레이어 감지를 위한 상호작용 영역 */}
      <InteractionZone 
        zoneId="harbor" 
        size={[15, 5, 10]} 
        offset={[0, 2, 0]} 
      />
    </RigidBody>
  );
};
