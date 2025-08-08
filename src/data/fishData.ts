// 파일 경로: src/data/fishData.ts (새 파일)

// 각 물고기의 속성을 정의하는 인터페이스
export interface Fish {
  name: string;
  value: number;
  rarity: 'common' | 'uncommon' | 'rare';
}

// 게임에 등장하는 모든 물고기의 목록
export const fishData: Fish[] = [
  { name: '고등어', value: 10, rarity: 'common' },
  { name: '꽁치', value: 12, rarity: 'common' },
  { name: '광어', value: 25, rarity: 'uncommon' },
  { name: '우럭', value: 28, rarity: 'uncommon' },
  { name: '참돔', value: 80, rarity: 'rare' },
  { name: '다금바리', value: 150, rarity: 'rare' },
];

// 낚시 성공 시 잡을 물고기를 무작위로 선택하는 함수
export const getRandomFish = (): Fish => {
  const rand = Math.random();
  // 희귀도에 따라 확률을 다르게 설정합니다.
  // 70% 확률로 common, 25% 확률로 uncommon, 5% 확률로 rare
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
