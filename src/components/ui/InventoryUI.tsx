// 파일 경로: src/components/ui/InventoryUI.tsx (새 파일)

import { useAtomValue } from 'jotai';
import { isInventoryOpenAtom } from '../../store/gameStore';
import { fishInventoryAtom } from '../../store/playerStore';
import './InventoryUI.css';

export const InventoryUI = () => {
  const isOpen = useAtomValue(isInventoryOpenAtom);
  const inventory = useAtomValue(fishInventoryAtom);

  if (!isOpen) return null;

  return (
    <div className="inventory-ui-overlay">
      <div className="inventory-ui-container">
        <h2>인벤토리</h2>
        <div className="inventory-list">
          {inventory.size === 0 ? (
            <p className="empty-message">잡은 물고기가 없습니다.</p>
          ) : (
            Array.from(inventory.entries()).map(([fishName, count]) => (
              <div key={fishName} className="inventory-item">
                <span>{fishName}</span>
                <span>x {count}</span>
              </div>
            ))
          )}
        </div>
        <p className="close-guide">I 키를 눌러 닫기</p>
      </div>
    </div>
  );
};
