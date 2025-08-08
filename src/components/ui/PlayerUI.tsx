// 파일 경로: src/components/ui/PlayerUI.tsx (새 파일)

import { useAtomValue } from 'jotai';
import { playerGoldAtom } from '../../store/playerStore';
import './PlayerUI.css';

export const PlayerUI = () => {
  const gold = useAtomValue(playerGoldAtom);

  return (
    <div className="player-ui-container">
      <span>💰 {gold} Gold</span>
    </div>
  );
};
