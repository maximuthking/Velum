// 파일 경로: src/components/Water.tsx

import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

extend({ Water });

export const Ocean = ({ lightRef }: { lightRef: React.RefObject<THREE.DirectionalLight> }) => {
  const ref = useRef<Water>(null!);
  
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
        waterColor: 0x00b8d4,
        distortionScale: 2.0, // 물결 왜곡을 줄여 반사를 더 은은하게 만듭니다.
        fog: false,
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5;
    return water;
  }, [waterNormals]);
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.5;
    }
    // lightRef가 존재하면, 물의 sunDirection을 업데이트합니다.
    if (ref.current && lightRef.current) {
      ref.current.material.uniforms.sunDirection.value.copy(lightRef.current.position).normalize();
    }
  });

  return <primitive ref={ref} object={water} />;
};
