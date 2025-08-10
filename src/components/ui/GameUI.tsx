// 파일 경로: src/components/ui/GameUI.tsx

import { PlayerUI } from './PlayerUI';
import { FishingUI } from './FishingUI';
import { HarborUI } from './HarborUI';
import { InventoryUI } from './InventoryUI';

// 모든 게임 UI 컴포넌트를 렌더링하는 컨테이너
export const GameUI = () => {
  return (
    <>
      <PlayerUI />
      <FishingUI />
      <HarborUI />
      <InventoryUI />
    </>
  );
};
