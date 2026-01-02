import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function fetchPosts() {
  const postsCol = collection(db, 'posts');
  const snapshot = await getDocs(postsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
