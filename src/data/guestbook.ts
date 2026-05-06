import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';

const GUESTBOOK_COLLECTION = 'guestbook';

export interface GuestbookEntry {
  id: string;
  name: string;
  city: string;
  message: string;
  createdAt: Date;
}

interface GuestbookDoc {
  name: string;
  city: string;
  message: string;
  createdAt: Timestamp;
}

export async function getGuestbookEntries(): Promise<GuestbookEntry[]> {
  const q = query(
    collection(db, GUESTBOOK_COLLECTION),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as GuestbookDoc;
    return {
      id: d.id,
      name: data.name || 'Anonymous',
      city: data.city,
      message: data.message,
      createdAt: data.createdAt?.toDate() ?? new Date(),
    };
  });
}

export async function addGuestbookEntry(entry: {
  name: string;
  city: string;
  message: string;
}): Promise<void> {
  await addDoc(collection(db, GUESTBOOK_COLLECTION), {
    name: entry.name || 'Anonymous',
    city: entry.city,
    message: entry.message,
    createdAt: serverTimestamp(),
  });
}

export async function deleteGuestbookEntry(entryId: string): Promise<void> {
  await deleteDoc(doc(db, GUESTBOOK_COLLECTION, entryId));
}
