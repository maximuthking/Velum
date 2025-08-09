// 파일 경로: src/components/Water.tsx

import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { useControls } from 'leva';

extend({ Water });

export const Ocean = ({ lightRef }: { lightRef: React.RefObject<THREE.DirectionalLight> }) => {
  const ref = useRef<Water>(null!);
  
  const waterControls = useControls('Water Settings', {
    color: '#00b8d4',
    alpha: { value: 1.0, min: 0, max: 1, step: 0.01 },
  });

  // Leva 컨트롤러에 해저면의 깊이와 색상 조절 기능을 추가합니다.
  const seabedControls = useControls('Seabed Settings', {
    depth: { value: -10, min: -50, max: -1, step: 1 },
    color: '#2c3e50',
  });

  const waterNormals = useMemo(() => new THREE.TextureLoader().load('/textures/waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }), []);

  const water = useMemo(() => {
    const water = new Water(
      new THREE.PlaneGeometry(2000, 2000), 
      {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffe0,
        waterColor: waterControls.color,
        distortionScale: 2.0,
        fog: false,
      }
    );
    water.material.transparent = true; 
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    return water;
  }, [waterNormals, waterControls.color]);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.5;
      ref.current.material.uniforms.alpha.value = waterControls.alpha;
    }
    if (ref.current && lightRef.current) {
      ref.current.material.uniforms.sunDirection.value.copy(lightRef.current.position).normalize();
    }
  });

  return (
    <group>
      <primitive ref={ref} object={water} />
      {/* Leva로 제어되는 값들을 해저면의 위치와 색상에 적용합니다. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, seabedControls.depth, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color={seabedControls.color} />
      </mesh>
    </group>
  );
};
