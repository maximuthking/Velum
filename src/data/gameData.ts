// 파일 경로: src/data/gameData.ts

//================================//
// Ship Data
//================================//
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
};

//================================//
// Fish Data
//================================//
export interface Fish {
  name: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare';
}

export const fishData: Fish[] = [
  { name: '고등어', value: 10, rarity: 'common' },
  { name: '꽁치', value: 12, rarity: 'common' },
  { name: '광어', value: 25, rarity: 'uncommon' },
  { name: '우럭', value: 28, rarity: 'uncommon' },
  { name: '참돔', value: 80, rarity: 'rare' },
  { name: '다금바리', value: 150, rarity: 'rare' },
];

export const getRandomFish = (): Fish => {
  const rand = Math.random();
  if (rand < 0.05) {
    const rareFish = fishData.filter(f => f.rarity === 'rare');
    return rareFish[Math.floor(Math.random() * rareFish.length)];
  }
  if (rand < 0.3) {
    const uncommonFish = fishData.filter(f => f.rarity === 'uncommon');
    return uncommonFish[Math.floor(Math.random() * uncommonFish.length)];
  }
  const commonFish = fishData.filter(f => f.rarity === 'common');
  return commonFish[Math.floor(Math.random() * commonFish.length)];
};
