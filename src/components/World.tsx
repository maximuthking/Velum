// 파일 경로: src/components/World.tsx

import { CuboidCollider, RigidBody } from '@react-three/rapier';

// 개별 섬을 나타내는 컴포넌트
const Island = (props: any) => (
  <RigidBody type="fixed" colliders={false} {...props}>
    <mesh receiveShadow>
      <boxGeometry args={[15, 2, 15]} />
      <meshStandardMaterial color="#4E6037" />
    </mesh>
    <CuboidCollider args={[7.5, 1, 7.5]} />
  </RigidBody>
);

// 월드 전체의 지형을 구성하는 컴포넌트
export const World = () => {
  return (
    <>
      {/* 여러 개의 섬을 다른 위치에 배치합니다. */}
      <Island position={[-40, -1, -40]} />
      <Island position={[50, -1, -60]} />
      <Island position={[30, -1, 20]} />
      <Island position={[-20, -1, 70]} />
    </>
  );
};
