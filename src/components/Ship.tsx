// 파일 경로: src/components/Ship.tsx (수정된 파일)

import React, { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAtomValue, useSetAtom } from 'jotai';
import { shipHealthAtom, shipHealthPercentageAtom } from '../store/shipStore';
import { RigidBody, CuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { socket } from './SocketManager'; // SocketManager에서 소켓 인스턴스 import

// ... (useKeyboardControls, PlayerShipModel 컴포넌트는 이전과 동일) ...
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

const PlayerShipModel = () => {
  const { scene } = useGLTF('/ship.glb'); 
  const healthPercentage = useAtomValue(shipHealthPercentageAtom);

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
        <primitive 
          object={scene} 
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


// 배 컴포넌트
export const Ship = forwardRef<RapierRigidBody>((_props, ref) => {
  const controls = useKeyboardControls();
  const setShipHealth = useSetAtom(shipHealthAtom);

  useFrame((_state, delta) => {
    const shipRb = (ref as React.RefObject<RapierRigidBody>).current;
    if (!shipRb) return;

    // ... (움직임 로직은 이전과 동일) ...
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


    // 서버로 내 위치 정보를 전송합니다.
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
