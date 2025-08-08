// 파일 경로: src/components/Rock.tsx (수정된 파일)

import { CuboidCollider, RigidBody } from '@react-three/rapier';

export const Rock = (props: any) => (
  // userData는 RigidBody에 직접 전달해야 합니다.
  <RigidBody type="fixed" colliders={false} userData={{ type: 'rock' }} {...props}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="grey" />
    </mesh>
    {/* CuboidCollider는 물리적인 형태만 정의합니다. */}
    <CuboidCollider args={[1, 1, 1]} />
  </RigidBody>
);