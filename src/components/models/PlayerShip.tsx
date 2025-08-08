// 파일 경로: src/components/models/PlayerShip.tsx

import React from 'react';
import * as THREE from 'three';

// 배의 외형을 담당하는 컴포넌트
export const PlayerShipModel = () => {
  return (
    // 나중에 이 부분을 gltfjsx로 생성된 컴포넌트로 교체하면 됩니다.
    <group>
        {/* 선체 */}
        <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.5, 2.5]} />
            <meshStandardMaterial color="#8B4513" />
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
            <meshStandardMaterial color="white" side={THREE.DoubleSide} />
        </mesh>
    </group>
  );
};
