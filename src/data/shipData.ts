// 파일 경로: src/data/shipData.ts

export interface ShipStats {
  acceleration: number;
  maxSpeed: number;
  backwardMaxSpeed: number;
  rotationSpeed: number;
  drag: number;
  angularDrag: number;
}

export const shipData: Record<string, ShipStats> = {
  // 기본 배의 성능 데이터
  default: {
    acceleration: 5.0,
    maxSpeed: 3.0,
    backwardMaxSpeed: 1.5,
    rotationSpeed: 1.5,
    drag: 0.97,
    angularDrag: 0.95,
  },
  // 나중에 새로운 배를 추가할 수 있습니다.
  // fastShip: {
  //   acceleration: 7.0,
  //   maxSpeed: 4.0,
  //   ...
  // },
};