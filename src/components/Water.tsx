// 파일 경로: src/components/Water.tsx (수정된 파일)

import { useMemo, useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water.js';

extend({ Water });

export const Ocean = () => {
  const ref = useRef<Water>(null!); // 초기값으로 null을 전달합니다.
  
  // 물결 효과를 위한 노멀 맵 텍스처를 로드합니다.
  const waterNormals = useMemo(() => new THREE.TextureLoader().load('/textures/waternormals.jpg', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  }), []);

  // Water 객체를 생성하고 설정합니다.
  const water = useMemo(() => {
    const water = new Water(
      new THREE.PlaneGeometry(2000, 2000), 
      {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals,
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x0077be,
        distortionScale: 3.7,
        fog: false,
      }
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.5; // 바닥 평면과 동일한 높이로 설정
    return water;
  }, [waterNormals]);
  
  // 매 프레임마다 물결이 움직이도록 시간 값을 업데이트합니다.
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.material.uniforms.time.value += delta * 0.5;
    }
  });

  // primitive를 사용하여 three.js의 Water 객체를 씬에 렌더링합니다.
  return <primitive ref={ref} object={water} />;
};
