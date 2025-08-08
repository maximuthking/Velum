// 파일 경로: src/components/ui/HarborUI.tsx (수정된 파일)

import { useAtom, useAtomValue } from 'jotai'; // useSetAtom 제거
import { isInHarborAtom } from '../../store/gameStore';
import { playerGoldAtom, fishInventoryAtom } from '../../store/playerStore';
import { shipHealthAtom } from '../../store/shipStore';
import { fishData } from '../../data/fishData';
import './HarborUI.css';
import { useState } from 'react';

export const HarborUI = () => {
  const isInHarbor = useAtomValue(isInHarborAtom);
  const [shipHealth, setShipHealth] = useAtom(shipHealthAtom);
  const [playerGold, setPlayerGold] = useAtom(playerGoldAtom);
  const [fishInventory, setFishInventory] = useAtom(fishInventoryAtom);
  const [message, setMessage] = useState('');

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRepair = () => {
    if (shipHealth === 100) {
      showMessage("이미 내구도가 최대입니다.");
      return;
    }
    const repairCost = 100 - shipHealth;
    if (playerGold >= repairCost) {
      setShipHealth(100);
      setPlayerGold((prev) => prev - repairCost);
      showMessage(`수리가 완료되었습니다! (-${repairCost} Gold)`);
    } else {
      showMessage("골드가 부족합니다!");
    }
  };

  const handleSellFish = () => {
    if (fishInventory.size === 0) {
      showMessage("판매할 물고기가 없습니다.");
      return;
    }

    let totalValue = 0;
    fishInventory.forEach((count, fishName) => {
      const fishInfo = fishData.find(f => f.name === fishName);
      if (fishInfo) {
        totalValue += fishInfo.value * count;
      }
    });

    setPlayerGold(prev => prev + totalValue);
    setFishInventory(new Map()); // 인벤토리 비우기
    showMessage(`물고기를 판매하여 ${totalValue} Gold를 얻었습니다!`);
  };

  if (!isInHarbor) return null;

  return (
    <div className="harbor-ui-container">
      <h2>항구</h2>
      <div className="button-group">
        <button onClick={handleRepair}>수리하기 (비용: {100 - shipHealth} Gold)</button>
        <button onClick={handleSellFish}>생선 팔기</button>
      </div>
      {message && <p className="message-text">{message}</p>}
    </div>
  );
};
