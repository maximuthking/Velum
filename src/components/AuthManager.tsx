// 파일 경로: src/components/AuthManager.tsx

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { onAuthStateChanged, type User } from 'firebase/auth'; // 'type' 키워드 추가
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from '../firebaseConfig';
import { authStateAtom } from '../store/stores';

const getOrCreatePlayer = async (user: User) => {
  const playerDocRef = doc(db, "players", user.uid);
  const playerDoc = await getDoc(playerDocRef);

  if (!playerDoc.exists()) {
    await setDoc(playerDocRef, {
      uid: user.uid,
      nickname: user.displayName || "Adventurer",
      gold: 0,
      shipHealth: 100,
      inventory: {},
      lastPosition: [0, 0, 0],
    });
    console.log(`New player created: ${user.uid}`);
  }
};

export const AuthManager = () => {
  const setAuthState = useSetAtom(authStateAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await getOrCreatePlayer(user);
      }
      setAuthState({ user, isLoading: false });
    });

    return () => unsubscribe();
  }, [setAuthState]);

  return null;
};
