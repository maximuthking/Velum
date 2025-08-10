// 파일 경로: src/components/ui/PlayerUI.tsx

import { useAtomValue } from 'jotai';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { playerGoldAtom, totalFishCountAtom, playerNicknameAtom } from '../../store/stores';
import './PlayerUI.css';

export const PlayerUI = () => {
  const gold = useAtomValue(playerGoldAtom);
  const fishCount = useAtomValue(totalFishCountAtom);
  const nickname = useAtomValue(playerNicknameAtom);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
    } catch (error) { // 중괄호 {} 추가
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="player-ui-container">
      <div className="player-info">
        <span>{nickname}</span>
        <button className="logout-button" onClick={handleLogout}>로그아웃</button>
      </div>
      <div className="player-stats">
        <span>💰 {gold} Gold</span>
        <span className="fish-count">🐟 {fishCount} 마리</span>
      </div>
    </div>
  );
};
