// 파일 경로: src/components/Ship.tsx

import React, { forwardRef, useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { socket } from './SocketManager';
import { shipHealthAtom, shipHealthPercentageAtom } from '../store/stores';
import { shipData } from '../data/gameData'; // shipData import

// 키보드 입력을 처리하는 커스텀 훅
const useKeyboardControls = () => {
  const keys = useRef({ forward: false, backward: false, left: false, right: false });
  useEffect(() => {
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

// 배의 3D 모델을 렌더링하는 컴포넌트
const PlayerShipModel = () => {
  const { scene } = useGLTF('/ship.glb'); 
  const healthPercentage = useAtomValue(shipHealthPercentageAtom);

  const clonedScene = useMemo(() => {
      const cloned = scene.clone();
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return cloned;
  }, [scene]);

  return (
    <group>
        <primitive 
          object={clonedScene} 
          scale={4.0}
          rotation={[0, Math.PI, 0]}
          position={[0, -0.25, 0]} 
        />
        {/* 내구도가 30% 이하일 때 연기 파티클 표시 */}
        {healthPercentage <= 30 && (
          <mesh position={[0, 0.5, -1.5]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="black" emissive="grey" />
          </mesh>
        )}
    </group>
  );
};

// Ship 컴포넌트 본체
export const Ship = forwardRef<RapierRigidBody>((_props, ref) => {
  const controls = useKeyboardControls();
  const setShipHealth = useSetAtom(shipHealthAtom);
  const stats = shipData.default; // 기본 배 성능 데이터 사용

  useFrame((_state, delta) => {
    const shipRb = (ref as React.RefObject<RapierRigidBody>).current;
    if (!shipRb) return;

    const { acceleration, maxSpeed, backwardMaxSpeed, rotationSpeed, drag, angularDrag } = stats;

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
    if (controls.current.left) newAngvelY += rotationSpeed * delta;
    if (controls.current.right) newAngvelY -= rotationSpeed * delta;
    
    // 저항 적용
    currentVelocity.multiplyScalar(drag);
    newAngvelY *= angularDrag;

    // 속도 제한
    const currentSpeed = currentVelocity.length();
    if (currentSpeed > maxSpeed) currentVelocity.setLength(maxSpeed);
    if (currentVelocity.dot(forwardDirection) < 0 && currentSpeed > backwardMaxSpeed) {
        currentVelocity.setLength(backwardMaxSpeed);
    }

    // 물리 상태 업데이트
    shipRb.setLinvel({ x: currentVelocity.x, y: 0, z: currentVelocity.z }, true);
    shipRb.setAngvel({ x: 0, y: newAngvelY, z: 0 }, true);

    // 서버로 위치 정보 전송
    if (socket && socket.connected) {
      const position = shipRb.translation();
      const rotation = shipRb.rotation();
      socket.emit('playerMove', {
        id: socket.id,
        position: [position.x, position.y, position.z],
        rotation: [rotation.x, rotation.y, rotation.z, rotation.w],
      });
    }
  });

  // 충돌 처리
  const handleCollision = (payload: any) => {
    if (payload.other.rigidBody.userData?.type === 'rock') {
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
