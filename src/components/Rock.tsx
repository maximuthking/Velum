// 파일 경로: src/components/Rock.tsx

import { CuboidCollider, RigidBody } from '@react-three/rapier';

export const Rock = (props: any) => (
  // userData를 통해 충돌 시 이 객체가 'rock' 타입임을 식별할 수 있도록 합니다.
  <RigidBody type="fixed" colliders={false} userData={{ type: 'rock' }} {...props}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="grey" />
    </mesh>
    {/* 물리적 형태를 정의하는 충돌체 */}
    <CuboidCollider args={[1, 1, 1]} />
  </RigidBody>
);
