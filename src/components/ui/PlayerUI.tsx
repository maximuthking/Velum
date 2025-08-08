// 파일 경로: src/components/ui/PlayerUI.tsx (수정된 파일)

import { useAtomValue } from 'jotai';
import { playerGoldAtom, totalFishCountAtom } from '../../store/playerStore';
import './PlayerUI.css';

export const PlayerUI = () => {
  const gold = useAtomValue(playerGoldAtom);
  const fishCount = useAtomValue(totalFishCountAtom);

  return (
    <div className="player-ui-container">
      <span>💰 {gold} Gold</span>
      <span className="fish-count">🐟 {fishCount} 마리</span>
    </div>
  );
};
