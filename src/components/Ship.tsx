// 파일 경로: src/components/Ship.tsx

import React, { forwardRef, useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { useControls } from 'leva'; // leva import 추가
import { socket } from './SocketManager';
import { shipHealthAtom, shipHealthPercentageAtom } from '../store/stores';

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

  // Leva를 사용하여 배의 물리 값을 실시간으로 조절
  const { acceleration, maxSpeed, backwardMaxSpeed, rotationSpeed, drag, angularDrag } = useControls('Ship Controls', {
    acceleration: { value: 25.0, min: 5, max: 50, step: 0.5 },
    maxSpeed: { value: 5.0, min: 1, max: 10, step: 0.1 },
    backwardMaxSpeed: { value: 2.5, min: 0.5, max: 5, step: 0.1 },
    rotationSpeed: { value: 8.0, min: 1, max: 20, step: 0.5 },
    drag: { value: 0.97, min: 0.9, max: 0.99, step: 0.005 },
    angularDrag: { value: 0.95, min: 0.9, max: 0.99, step: 0.005 },
  });

  useFrame((_state, delta) => {
    const shipRb = (ref as React.RefObject<RapierRigidBody>).current;
    if (!shipRb) return;

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
    if (controls.current.left) newAngvelY += rotationSpeed * delta;
    if (controls.current.right) newAngvelY -= rotationSpeed * delta;
    
    currentVelocity.multiplyScalar(drag);
    newAngvelY *= angularDrag;

    const currentSpeed = currentVelocity.length();
    if (currentSpeed > maxSpeed) currentVelocity.setLength(maxSpeed);
    if (currentVelocity.dot(forwardDirection) < 0 && currentSpeed > backwardMaxSpeed) {
        currentVelocity.setLength(backwardMaxSpeed);
    }

    shipRb.setLinvel({ x: currentVelocity.x, y: 0, z: currentVelocity.z }, true);
    shipRb.setAngvel({ x: 0, y: newAngvelY, z: 0 }, true);

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
