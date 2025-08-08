// 파일 경로: src/components/Ship.tsx (수정된 파일)

import React, { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { shipHealthAtom, shipHealthPercentageAtom } from '../store/shipStore';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';

// 키보드 입력을 관리하는 커스텀 훅 (변경 없음)
const useKeyboardControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = true; break;
        case 'KeyS': keys.current.backward = true; break;
        case 'KeyA': keys.current.left = true; break;
        case 'KeyD': keys.current.right = true; break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': keys.current.forward = false; break;
        case 'KeyS': keys.current.backward = false; break;
        case 'KeyA': keys.current.left = false; break;
        case 'KeyD': keys.current.right = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  return keys;
};

// GLB 모델을 불러와 배의 외형을 담당하는 컴포넌트
const PlayerShipModel = () => {
  // 1. public 폴더에 있는 GLB 파일을 불러옵니다. 파일명이 다르면 경로를 수정해주세요.
  const { scene } = useGLTF('/ship.glb'); 
  const healthPercentage = useAtomValue(shipHealthPercentageAtom);

  // 2. 불러온 모델의 모든 메시에 그림자 속성을 적용합니다.
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group>
        {/* 3. primitive를 사용해 불러온 모델을 렌더링합니다. */}
        <primitive 
          object={scene} 
          scale={6.0} // 모델 크기를 키웠습니다.
          rotation={[0, Math.PI, 0]} // 모델을 180도 회전시켜 앞뒤를 맞췄습니다.
          position={[0, -0.25, 0]} 
        />
        
        {/* 심각한 손상 시(30% 이하) 연기 파티클은 그대로 유지합니다. */}
        {healthPercentage <= 30 && (
          <mesh position={[0, 0.5, -1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="black" emissive="grey" />
          </mesh>
        )}
    </group>
  );
};

// 배 컴포넌트
export const Ship = forwardRef<RapierRigidBody>((_props, ref) => {
  const controls = useKeyboardControls();
  const setShipHealth = useSetAtom(shipHealthAtom);

  useFrame((_state, delta) => {
    const shipRb = (ref as React.RefObject<RapierRigidBody>).current;
    if (!shipRb) return;

    const acceleration = 25.0;
    const maxSpeed = 5.0;
    const backwardMaxSpeed = 2.5;
    const rotationSpeed = 8;
    const drag = 0.97;
    const angularDrag = 0.95;

    const linvel = shipRb.linvel();
    const angvel = shipRb.angvel();

    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(shipRb.rotation());
    const currentVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

    if (controls.current.forward) {
      currentVelocity.add(forwardDirection.multiplyScalar(acceleration * delta));
    }
    if (controls.current.backward) {
      currentVelocity.add(forwardDirection.multiplyScalar(-acceleration * 0.5 * delta));
    }
    
    let newAngvelY = angvel.y;
    if (controls.current.left) {
      newAngvelY += rotationSpeed * delta;
    }
    if (controls.current.right) {
      newAngvelY -= rotationSpeed * delta;
    }
    
    currentVelocity.multiplyScalar(drag);
    newAngvelY *= angularDrag;

    const currentSpeed = currentVelocity.length();
    if (currentSpeed > maxSpeed) {
      currentVelocity.setLength(maxSpeed);
    }
    if (currentVelocity.dot(forwardDirection) < 0 && currentSpeed > backwardMaxSpeed) {
        currentVelocity.setLength(backwardMaxSpeed);
    }

    shipRb.setLinvel({ x: currentVelocity.x, y: 0, z: currentVelocity.z }, true);
    shipRb.setAngvel({ x: 0, y: newAngvelY, z: 0 }, true);
  });

  const handleCollision = (payload: any) => {
    if (payload.other.rigidBody.userData?.type === 'rock') {
      console.log('Rock hit!');
      setShipHealth((prev) => Math.max(0, prev - 5));
    }
  };

  return (
    <RigidBody 
      ref={ref}
      colliders={false}
      onCollisionEnter={handleCollision}
      gravityScale={0}
      enabledRotations={[false, true, false]} 
    >
      <PlayerShipModel />
      {/* 물리적 충돌 범위(Collider)는 모델의 크기에 맞게 조절해야 할 수 있습니다. */}
      <CuboidCollider args={[0.6, 0.3, 1.2]} />
    </RigidBody>
  );
});
