// 파일 경로: src/components/InteractionZone.tsx (새 파일)

import { CuboidCollider } from '@react-three/rapier';
import { useSetAtom } from 'jotai';
import { isInHarborAtom } from '../store/gameStore';

interface InteractionZoneProps {
  zoneId: string;
  size: [number, number, number];
  offset?: [number, number, number];
}

// 눈에 보이지 않는 센서 영역을 만들어 플레이어의 출입을 감지하는 컴포넌트
export const InteractionZone = ({ zoneId, size, offset }: InteractionZoneProps) => {
  const setIsInHarbor = useSetAtom(isInHarborAtom);

  const handleIntersection = (isInside: boolean) => {
    if (zoneId === 'harbor') {
      console.log(`Player ${isInside ? 'entered' : 'left'} the harbor.`);
      setIsInHarbor(isInside);
    }
  };

  return (
    <CuboidCollider
      sensor
      args={size.map(s => s / 2) as [number, number, number]}
      position={offset}
      onIntersectionEnter={() => handleIntersection(true)}
      onIntersectionExit={() => handleIntersection(false)}
    />
  );
};
