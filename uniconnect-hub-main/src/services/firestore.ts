import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';

export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  category: 'event' | 'announcement' | 'discussion';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  likes?: number;
  comments?: number;
}

export interface MarketplaceItem {
  id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  images: string[];
  createdAt: Timestamp | Date;
  isSold: boolean;
}

export interface LostFoundItem {
  id?: string;
  title: string;
  description: string;
  itemType: 'lost' | 'found';
  category: string;
  location: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  images: string[];
  createdAt: Timestamp | Date;
  resolved: boolean;
}

export interface BorrowItem {
  id?: string;
  title: string;
  description: string;
  category: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  borrowerId?: string;
  borrowerName?: string;
  borrowerEmail?: string;
  status: 'available' | 'borrowed' | 'returned';
  createdAt: Timestamp | Date;
  borrowDate?: Timestamp | Date;
  returnDate?: Timestamp | Date;
}

export interface HelpRequest {
  id?: string;
  title: string;
  description: string;
  category: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requestStatus: 'open' | 'in-progress' | 'resolved';
  createdAt: Timestamp | Date;
  responses?: number;
}

export interface EmergencyAlert {
  id?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  alerterId: string;
  alerterName: string;
  alerterEmail: string;
  createdAt: Timestamp | Date;
  respondents?: string[];
}

export interface Hackathon {
  id?: string;
  title: string;
  description: string;
  startDate: Timestamp | Date;
  endDate: Timestamp | Date;
  location: string;
  theme: string;
  prizes: string;
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  maxParticipants?: number;
  applicants?: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: Timestamp | Date;
}

// Posts Service
export const postsService = {
  async create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        likes: 0,
        comments: 0,
      });
      return { id: docRef.id, ...post };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async getAll(constraints: QueryConstraint[] = []) {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  },

  async getById(postId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'posts', postId));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Post : null;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  },

  async update(postId: string, updates: Partial<Post>) {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async delete(postId: string) {
    try {
      await deleteDoc(doc(db, 'posts', postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },
};

// Marketplace Service
export const marketplaceService = {
  async create(item: Omit<MarketplaceItem, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'marketplace'), {
        ...item,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error creating marketplace item:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'marketplace'), where('isSold', '==', false), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MarketplaceItem));
    } catch (error) {
      console.error('Error fetching marketplace items:', error);
      return [];
    }
  },

  async update(itemId: string, updates: Partial<MarketplaceItem>) {
    try {
      await updateDoc(doc(db, 'marketplace', itemId), updates);
    } catch (error) {
      console.error('Error updating marketplace item:', error);
      throw error;
    }
  },

  async delete(itemId: string) {
    try {
      await deleteDoc(doc(db, 'marketplace', itemId));
    } catch (error) {
      console.error('Error deleting marketplace item:', error);
      throw error;
    }
  },
};

// Lost & Found Service
export const lostFoundService = {
  async create(item: Omit<LostFoundItem, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'lostfound'), {
        ...item,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error creating lost/found item:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'lostfound'), where('resolved', '==', false), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LostFoundItem));
    } catch (error) {
      console.error('Error fetching lost/found items:', error);
      return [];
    }
  },

  async update(itemId: string, updates: Partial<LostFoundItem>) {
    try {
      await updateDoc(doc(db, 'lostfound', itemId), updates);
    } catch (error) {
      console.error('Error updating lost/found item:', error);
      throw error;
    }
  },

  async delete(itemId: string) {
    try {
      await deleteDoc(doc(db, 'lostfound', itemId));
    } catch (error) {
      console.error('Error deleting lost/found item:', error);
      throw error;
    }
  },
};

// Borrow Service
export const borrowService = {
  async create(item: Omit<BorrowItem, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'borrow'), {
        ...item,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    } catch (error) {
      console.error('Error creating borrow item:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'borrow'), where('status', '==', 'available'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BorrowItem));
    } catch (error) {
      console.error('Error fetching borrow items:', error);
      return [];
    }
  },

  async update(itemId: string, updates: Partial<BorrowItem>) {
    try {
      await updateDoc(doc(db, 'borrow', itemId), updates);
    } catch (error) {
      console.error('Error updating borrow item:', error);
      throw error;
    }
  },

  async delete(itemId: string) {
    try {
      await deleteDoc(doc(db, 'borrow', itemId));
    } catch (error) {
      console.error('Error deleting borrow item:', error);
      throw error;
    }
  },
};

// Help Requests Service
export const helpService = {
  async create(request: Omit<HelpRequest, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'help'), {
        ...request,
        createdAt: Timestamp.now(),
        responses: 0,
      });
      return { id: docRef.id, ...request };
    } catch (error) {
      console.error('Error creating help request:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'help'), where('requestStatus', '==', 'open'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HelpRequest));
    } catch (error) {
      console.error('Error fetching help requests:', error);
      return [];
    }
  },

  async update(requestId: string, updates: Partial<HelpRequest>) {
    try {
      await updateDoc(doc(db, 'help', requestId), updates);
    } catch (error) {
      console.error('Error updating help request:', error);
      throw error;
    }
  },

  async delete(requestId: string) {
    try {
      await deleteDoc(doc(db, 'help', requestId));
    } catch (error) {
      console.error('Error deleting help request:', error);
      throw error;
    }
  },
};

// Emergency Alerts Service
export const emergencyService = {
  async create(alert: Omit<EmergencyAlert, 'id' | 'createdAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'emergency'), {
        ...alert,
        createdAt: Timestamp.now(),
        respondents: [],
      });
      return { id: docRef.id, ...alert };
    } catch (error) {
      console.error('Error creating emergency alert:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'emergency'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EmergencyAlert));
    } catch (error) {
      console.error('Error fetching emergency alerts:', error);
      return [];
    }
  },

  async update(alertId: string, updates: Partial<EmergencyAlert>) {
    try {
      await updateDoc(doc(db, 'emergency', alertId), updates);
    } catch (error) {
      console.error('Error updating emergency alert:', error);
      throw error;
    }
  },

  async delete(alertId: string) {
    try {
      await deleteDoc(doc(db, 'emergency', alertId));
    } catch (error) {
      console.error('Error deleting emergency alert:', error);
      throw error;
    }
  },
};

// Hackathons Service
export const hackathonsService = {
  async create(hackathon: Omit<Hackathon, 'id' | 'createdAt'>) {
    try {
      console.log('hackathonsService.create called, db is:', db ? 'initialized' : 'NULL');
      if (!db) {
        throw new Error('Firebase Firestore is not initialized. Check VITE_FIREBASE_* environment variables.');
      }
      const docRef = await addDoc(collection(db, 'hackathons'), {
        ...hackathon,
        createdAt: Timestamp.now(),
        applicants: [],
      });
      return { id: docRef.id, ...hackathon };
    } catch (error) {
      console.error('Error creating hackathon:', error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, 'hackathons'), orderBy('startDate', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hackathon));
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      return [];
    }
  },

  async getById(hackathonId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'hackathons', hackathonId));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Hackathon : null;
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      return null;
    }
  },

  async update(hackathonId: string, updates: Partial<Hackathon>) {
    try {
      await updateDoc(doc(db, 'hackathons', hackathonId), updates);
    } catch (error) {
      console.error('Error updating hackathon:', error);
      throw error;
    }
  },

  async delete(hackathonId: string) {
    try {
      await deleteDoc(doc(db, 'hackathons', hackathonId));
    } catch (error) {
      console.error('Error deleting hackathon:', error);
      throw error;
    }
  },

  async applyToHackathon(hackathonId: string, applicantId: string) {
    try {
      const hackathon = await this.getById(hackathonId);
      if (hackathon) {
        const applicants = hackathon.applicants || [];
        if (!applicants.includes(applicantId)) {
          applicants.push(applicantId);
          await this.update(hackathonId, { applicants });
        }
      }
    } catch (error) {
      console.error('Error applying to hackathon:', error);
      throw error;
    }
  },

  async removeApplicant(hackathonId: string, applicantId: string) {
    try {
      const hackathon = await this.getById(hackathonId);
      if (hackathon) {
        const applicants = (hackathon.applicants || []).filter(id => id !== applicantId);
        await this.update(hackathonId, { applicants });
      }
    } catch (error) {
      console.error('Error removing applicant from hackathon:', error);
      throw error;
    }
  },
};
