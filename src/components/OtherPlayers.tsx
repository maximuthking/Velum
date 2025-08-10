// 파일 경로: src/components/OtherPlayers.tsx (수정된 파일)

import { useGLTF } from "@react-three/drei";
import { useMultiplayerStore, type PlayerState } from "../store/multiplayerStore";
import * as THREE from 'three';
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

// 다른 플레이어 한 명의 배를 렌더링하는 컴포넌트
const OtherPlayer = ({ player }: { player: PlayerState }) => {
  const { scene } = useGLTF('/ship.glb');
  const ref = useRef<THREE.Group>(null!);

  // 각 인스턴스가 고유한 모델을 갖도록 scene을 복제합니다.
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    // 복제된 모델의 모든 메시에 그림자 속성을 적용합니다.
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return cloned;
  }, [scene]);
  
  // 서버로부터 받은 위치로 부드럽게 이동하도록 보간합니다.
  useFrame((_, delta) => {
    if (ref.current) {
      const targetPosition = new THREE.Vector3(...player.position);
      ref.current.position.lerp(targetPosition, delta * 10);

      const targetRotation = new THREE.Quaternion(...player.rotation);
      ref.current.quaternion.slerp(targetRotation, delta * 10);
    }
  });

  return (
    <primitive
      ref={ref}
      object={clonedScene} // 복제된 scene을 사용합니다.
      scale={1.0}
      rotation={[0, Math.PI, 0]}
    />
  );
};


// 모든 다른 플레이어들을 렌더링하는 컴포넌트
export const OtherPlayers = () => {
  const { players } = useMultiplayerStore();

  return (
    <>
      {Object.values(players).map((player) => (
        <OtherPlayer key={player.id} player={player} />
      ))}
    </>
  );
};
