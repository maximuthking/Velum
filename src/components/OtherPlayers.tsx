// 파일 경로: src/components/OtherPlayers.tsx

import { useGLTF } from "@react-three/drei";
import { useMultiplayerStore, type PlayerState } from "../store/stores";
import * as THREE from 'three';
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

// 다른 플레이어 한 명의 배를 렌더링하는 컴포넌트
const OtherPlayer = ({ player, scene }: { player: PlayerState, scene: THREE.Group }) => {
  const ref = useRef<THREE.Group>(null!);

  // GLTF 모델을 복제하여 각 플레이어마다 고유한 객체를 갖도록 합니다.
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
  
  // 서버로부터 받은 위치로 부드럽게 이동하도록 보간(lerp/slerp)합니다.
  useFrame((_, delta) => {
    if (ref.current) {
      const targetPosition = new THREE.Vector3(...player.position);
      ref.current.position.lerp(targetPosition, delta * 10);

      const targetRotation = new THREE.Quaternion(...player.rotation);
      ref.current.quaternion.slerp(targetRotation, delta * 10);
    }
  });

  return (
    <group ref={ref}>
      <primitive
        object={clonedScene}
        scale={4.0}
        rotation={[0, Math.PI, 0]}
        position={[0, -0.25, 0]}
      />
    </group>
  );
};


// 모든 다른 플레이어들을 렌더링하는 컴포넌트
export const OtherPlayers = () => {
  const { players } = useMultiplayerStore();
  const { scene } = useGLTF('/ship.glb');

  return (
    <>
      {Object.values(players).map((player) => (
        <OtherPlayer key={player.id} player={player} scene={scene} />
      ))}
    </>
  );
};
