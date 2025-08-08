// 파일 경로: src/components/Ship.tsx (수정된 파일)

import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { shipHealthAtom, shipHealthPercentageAtom } from '../store/shipStore';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';

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

// 배의 외형을 담당하는 모델 컴포넌트 (변경 없음)
const PlayerShipModel = () => {
  const healthPercentage = useAtomValue(shipHealthPercentageAtom);
  const getBodyColor = () => {
    if (healthPercentage <= 30) return "#4B3621";
    if (healthPercentage <= 70) return "#6F5E4E";
    return "#8B4513";
  };
  return (
    <group>
        <mesh castShadow receiveShadow>
            <boxGeometry args={[1.2, 0.5, 2.5]} />
            <meshStandardMaterial color={getBodyColor()} />
        </mesh>
        <mesh castShadow position={[0, 0.25, 0]}>
            <boxGeometry args={[1, 0.1, 2.2]} />
            <meshStandardMaterial color="#A0522D" />
        </mesh>
        <mesh castShadow position={[0, 1, -0.5]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
            <meshStandardMaterial color="#D2B48C" />
        </mesh>
        <mesh castShadow position={[0, 1.2, 0]}>
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial 
              color="white" 
              side={THREE.DoubleSide} 
              transparent={healthPercentage <= 70}
              opacity={healthPercentage <= 70 ? 0.8 : 1}
            />
        </mesh>
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

    // 물리 상수 값들을 상향 조정했습니다.
    const acceleration = 25.0;
    const maxSpeed = 5.0;
    const backwardMaxSpeed = 2.5;
    const rotationSpeed = 8;
    const drag = 0.97;
    const angularDrag = 0.95;

    // 현재 속도와 회전 속도를 가져옵니다.
    const linvel = shipRb.linvel();
    const angvel = shipRb.angvel();

    const forwardDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(shipRb.rotation());
    const currentVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z);

    // 전진/후진
    if (controls.current.forward) {
      currentVelocity.add(forwardDirection.multiplyScalar(acceleration * delta));
    }
    if (controls.current.backward) {
      currentVelocity.add(forwardDirection.multiplyScalar(-acceleration * 0.5 * delta));
    }
    
    // 회전
    let newAngvelY = angvel.y;
    if (controls.current.left) {
      newAngvelY += rotationSpeed * delta;
    }
    if (controls.current.right) {
      newAngvelY -= rotationSpeed * delta;
    }
    
    // 저항 적용
    currentVelocity.multiplyScalar(drag);
    newAngvelY *= angularDrag;

    // 속도 제한
    const currentSpeed = currentVelocity.length();
    if (currentSpeed > maxSpeed) {
      currentVelocity.setLength(maxSpeed);
    }
    if (currentVelocity.dot(forwardDirection) < 0 && currentSpeed > backwardMaxSpeed) {
        currentVelocity.setLength(backwardMaxSpeed);
    }

    // 계산된 새로운 속도를 물리 엔진에 다시 설정합니다.
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
      <CuboidCollider args={[0.6, 0.3, 1.2]} />
    </RigidBody>
  );
});