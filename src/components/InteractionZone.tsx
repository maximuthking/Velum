// 파일 경로: src/components/InteractionZone.tsx

import { CuboidCollider } from '@react-three/rapier';
import { useSetAtom } from 'jotai';
import { isInHarborAtom } from '../store/stores';

interface InteractionZoneProps {
  zoneId: string;
  size: [number, number, number];
  offset?: [number, number, number];
}

// 눈에 보이지 않는 센서 영역을 만들어 플레이어의 출입을 감지하는 컴포넌트
export const InteractionZone = ({ zoneId, size, offset }: InteractionZoneProps) => {
  const setIsInHarbor = useSetAtom(isInHarborAtom);

  // 플레이어가 영역에 들어오거나 나갔을 때 상태를 업데이트하는 함수
  const handleIntersection = (isInside: boolean) => {
    if (zoneId === 'harbor') {
      setIsInHarbor(isInside);
    }
    // 나중에 다른 종류의 영역이 추가될 수 있습니다 (예: 낚시 스팟)
  };

  return (
    <CuboidCollider
      sensor // 물리적 충돌 없이 감지만 하도록 설정
      args={size.map(s => s / 2) as [number, number, number]}
      position={offset}
      onIntersectionEnter={() => handleIntersection(true)}
      onIntersectionExit={() => handleIntersection(false)}
    />
  );
};
