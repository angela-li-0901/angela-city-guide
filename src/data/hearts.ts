import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  increment,
} from 'firebase/firestore';

const HEARTS_COLLECTION = 'hearts';
const LOCAL_STORAGE_KEY = 'angelas-guide_hearted';

// Get which entries this browser has already hearted
function getHeartedIds(): Set<string> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

function saveHeartedIds(ids: Set<string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // Ignore quota errors
  }
}

export function isHearted(entryId: string): boolean {
  return getHeartedIds().has(entryId);
}

export async function getHeartCount(entryId: string): Promise<number> {
  const docRef = doc(db, HEARTS_COLLECTION, entryId);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().count ?? 0) : 0;
}

export async function toggleHeart(entryId: string): Promise<{ count: number; hearted: boolean }> {
  const ids = getHeartedIds();
  const docRef = doc(db, HEARTS_COLLECTION, entryId);
  const wasHearted = ids.has(entryId);

  if (wasHearted) {
    // Un-heart
    ids.delete(entryId);
    await setDoc(docRef, { count: increment(-1) }, { merge: true });
  } else {
    // Heart
    ids.add(entryId);
    await setDoc(docRef, { count: increment(1) }, { merge: true });
  }

  saveHeartedIds(ids);

  const snap = await getDoc(docRef);
  const count = Math.max(0, snap.exists() ? (snap.data().count ?? 0) : 0);
  return { count, hearted: !wasHearted };
}
