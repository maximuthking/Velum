// 파일 경로: src/components/ui/FishingUI.tsx (수정된 파일)

import { useState, useEffect, useRef } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { isFishingAtom, fishingResultAtom } from '../../store/gameStore';
import { fishInventoryAtom } from '../../store/playerStore';
import { getRandomFish } from '../../data/fishData';
import './FishingUI.css';

export const FishingUI = () => {
  const [isFishing, setIsFishing] = useAtom(isFishingAtom);
  const setFishingResult = useSetAtom(fishingResultAtom);
  const setFishInventory = useSetAtom(fishInventoryAtom);

  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [successZone, setSuccessZone] = useState({ start: 0, width: 0 });
  
  const indicatorPositionRef = useRef(0);
  const direction = useRef(1);
  const speed = 150;
  const hasCaught = useRef(false); // 물고기를 잡았는지 여부를 체크하는 Ref

  useEffect(() => {
    if (isFishing) {
      hasCaught.current = false; // 낚시 시작 시 초기화
      const width = 50 + Math.random() * 50;
      const start = Math.random() * (400 - width);
      setSuccessZone({ start, width });

      setIndicatorPosition(0);
      indicatorPositionRef.current = 0;
      direction.current = 1;

      let lastTime = 0;
      let animationFrameId: number;
      const animate = (time: number) => {
        if (lastTime !== 0) {
          const deltaTime = (time - lastTime) / 1000;
          setIndicatorPosition(prev => {
            let newPos = prev + direction.current * speed * deltaTime;
            if (newPos > 396 || newPos < 0) {
              direction.current *= -1;
              newPos = Math.max(0, Math.min(396, newPos));
            }
            indicatorPositionRef.current = newPos;
            return newPos;
          });
        }
        lastTime = time;
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);

      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.code === 'Space') {
          // 이미 물고기를 잡았다면 더 이상 진행하지 않음
          if (hasCaught.current) return;
          hasCaught.current = true; // 잡기 시도 시 즉시 잠금

          cancelAnimationFrame(animationFrameId);
          
          const finalPos = indicatorPositionRef.current;
          
          setSuccessZone(currentZone => {
            if (finalPos >= currentZone.start && finalPos <= currentZone.start + currentZone.width) {
              const caughtFish = getRandomFish();
              setFishingResult(`잡았다! (${caughtFish.name})`);
              setFishInventory(prevInventory => {
                const newInventory = new Map(prevInventory);
                const currentCount = newInventory.get(caughtFish.name) || 0;
                newInventory.set(caughtFish.name, currentCount + 1);
                return newInventory;
              });
              console.log(`낚시 성공! ${caughtFish.name} 1마리 획득!`);
            } else {
              setFishingResult('fail');
              console.log("낚시 실패!");
            }
            setIsFishing(false);
            return currentZone;
          });
        }
      };

      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [isFishing, setIsFishing, setFishingResult, setFishInventory]);

  if (!isFishing) return null;

  return (
    <div className="fishing-ui-container">
      <p>타이밍에 맞춰 SPACE를 누르세요!</p>
      <div className="fishing-bar-background">
        <div 
          className="fishing-bar-success" 
          style={{ left: `${successZone.start}px`, width: `${successZone.width}px` }} 
        />
        <div 
          className="fishing-bar-indicator" 
          style={{ left: `${indicatorPosition}px` }}
        />
      </div>
    </div>
  );
};
