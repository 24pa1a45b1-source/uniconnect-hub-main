/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export type PostType = 'hackathon' | 'freshers' | 'flashmob' | 'placement' | 'internship' | 'topper' | 'others';

export interface Post {
  id: string;
  title: string;
  description: string;
  postedBy: string;
  posterName: string;
  role: 'student' | 'faculty';
  type: PostType;
  applyEnabled: boolean;
  createdAt: string;
  college: string;
  image?: string;
}

export interface Application {
  id: string;
  postId: string;
  studentId: string;
  studentName: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  year: string;
  course: string;
  email: string;
}

export interface BorrowItem {
  id: string;
  title: string;
  item?: string;
  description: string;
  category?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  borrowerId: string | null;
  borrowerName: string | null;
  borrowerEmail?: string | null;
  price: number;
  availableFrom: string;
  availableTo: string;
  status: 'available' | 'borrowed' | 'returned';
  isFriendOnly: boolean;
  type?: 'borrow' | 'give';
  createdAt?: string;
}

export interface SellItem {
  id: string;
  title: string;
  item?: string;
  sellerId: string;
  sellerName: string;
  sellerEmail?: string;
  price: number;
  category?: string;
  status?: 'available' | 'sold';
  isSold?: boolean;
  buyerId?: string;
  buyerName?: string;
  description: string;
  condition: string;
  image?: string;
  images?: string[];
  createdAt?: string;
}

export interface LostFoundItem {
  id: string;
  title: string;
  item?: string;
  ownerId: string;
  ownerName: string;
  location: string;
  description: string;
  notifiedUsers: string[];
  status: 'lost' | 'found';
  reportedAt: string;
  contactEmail: string;
  category?: string;
  reporterPhone?: string;
  reporterEmail?: string;
  images?: string[];
  resolved?: boolean;
}

export interface HelpRequest {
  id: string;
  request: string;
  requesterId: string;
  requesterName: string;
  helpersNotified: string[];
  status: 'pending' | 'resolved';
  createdAt: string;
  category: string;
}

export interface Emergency {
  id: string;
  message: string;
  reportedBy: string;
  reporterName: string;
  notifiedUsers: string[];
  createdAt: string;
  location: string;
  type: 'fire' | 'medical' | 'security' | 'other';
}

interface DataContextType {
  posts: Post[];
  applications: Application[];
  borrowItems: BorrowItem[];
  sellItems: SellItem[];
  lostFoundItems: LostFoundItem[];
  helpRequests: HelpRequest[];
  emergencies: Emergency[];
  
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'postedBy' | 'posterName' | 'role' | 'college'>) => void;
  applyToPost: (postId: string, data: { year: string; course: string; email: string }) => void;
  updateApplicationStatus: (applicationId: string, status: 'approved' | 'rejected') => void;
  
  addBorrowItem: (item: Omit<BorrowItem, 'id' | 'ownerId' | 'ownerName' | 'borrowerId' | 'borrowerName' | 'status'> & { type?: 'borrow' | 'give' }) => void;
  borrowItem: (itemId: string) => void;
  returnItem: (itemId: string) => void;
  claimGiveItem: (itemId: string) => void;
  
  addSellItem: (item: Omit<SellItem, 'id' | 'sellerId' | 'sellerName' | 'status' | 'createdAt'>) => void;
  markAsSold: (itemId: string) => void;
  buyItem: (itemId: string) => void;
  
  addLostFoundItem: (item: Omit<LostFoundItem, 'id' | 'ownerId' | 'ownerName' | 'notifiedUsers' | 'reportedAt'>) => void;
  markAsFound: (itemId: string) => void;
  
  addHelpRequest: (request: Omit<HelpRequest, 'id' | 'requesterId' | 'requesterName' | 'helpersNotified' | 'status' | 'createdAt'>) => void;
  resolveHelpRequest: (requestId: string) => void;
  
  addEmergency: (emergency: Omit<Emergency, 'id' | 'reportedBy' | 'reporterName' | 'notifiedUsers' | 'createdAt'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;

  const [posts, setPosts] = useState<Post[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_posts') || '[]')
  );
  const [applications, setApplications] = useState<Application[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_applications') || '[]')
  );
  const [borrowItems, setBorrowItems] = useState<BorrowItem[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_borrow') || '[]')
  );
  const [sellItems, setSellItems] = useState<SellItem[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_sell') || '[]')
  );
  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_lostfound') || '[]')
  );
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_help') || '[]')
  );
  const [emergencies, setEmergencies] = useState<Emergency[]>(() => 
    useFirebase ? [] : JSON.parse(localStorage.getItem('uniconnect_emergency') || '[]')
  );

  // If Firebase is enabled, subscribe to Firestore collections for real-time updates
  React.useEffect(() => {
    if (!useFirebase) return;

    const unsubscribes: Array<() => void> = [];

    (async () => {
      try {
        const { collection, query, orderBy, onSnapshot } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        if (!db) return;

        // borrow (ordered by createdAt desc)
        const bq = query(collection(db, 'borrow'), orderBy('createdAt', 'desc'));
        const ub = onSnapshot(bq, (snap) => {
          setBorrowItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as BorrowItem)));
        });
        unsubscribes.push(ub);

        // marketplace
        const mq = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'));
        const um = onSnapshot(mq, (snap) => {
          setSellItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as SellItem)));
        });
        unsubscribes.push(um);

        // lostfound
        const lq = query(collection(db, 'lostfound'), orderBy('createdAt', 'desc'));
        const ul = onSnapshot(lq, (snap) => {
          setLostFoundItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as LostFoundItem)));
        });
        unsubscribes.push(ul);

        // posts
        const pq = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
        const up = onSnapshot(pq, (snap) => {
          setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
        });
        unsubscribes.push(up);
      } catch (err) {
        console.error('Failed to subscribe to Firestore collections', err);
      }
    })();

    return () => {
      unsubscribes.forEach(u => { try { u(); } catch(e) { console.error('Error during unsubscribe', e); } });
    };
  }, [useFirebase]);

  // Persist to localStorage
  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_posts', JSON.stringify(posts));
  }, [posts, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_applications', JSON.stringify(applications));
  }, [applications, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_borrow', JSON.stringify(borrowItems));
  }, [borrowItems, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_sell', JSON.stringify(sellItems));
  }, [sellItems, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_lostfound', JSON.stringify(lostFoundItems));
  }, [lostFoundItems, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_help', JSON.stringify(helpRequests));
  }, [helpRequests, useFirebase]);

  useEffect(() => {
    if (!useFirebase) localStorage.setItem('uniconnect_emergency', JSON.stringify(emergencies));
  }, [emergencies, useFirebase]);

  const addPost = (postData: Omit<Post, 'id' | 'createdAt' | 'postedBy' | 'posterName' | 'role' | 'college'>) => {
    if (!user) return;
    const newPost: Post = {
      ...postData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      postedBy: user.uid,
      posterName: user.name,
      role: user.role,
      college: user.college,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const applyToPost = (postId: string, data: { year: string; course: string; email: string }) => {
    if (!user) return;
    const newApplication: Application = {
      id: crypto.randomUUID(),
      postId,
      studentId: user.uid,
      studentName: user.name,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      ...data,
    };
    setApplications(prev => [...prev, newApplication]);
  };

  const updateApplicationStatus = (applicationId: string, status: 'approved' | 'rejected') => {
    setApplications(prev => 
      prev.map(app => app.id === applicationId ? { ...app, status } : app)
    );
  };

  const addBorrowItem = async (itemData: Omit<BorrowItem, 'id' | 'ownerId' | 'ownerName' | 'borrowerId' | 'borrowerName' | 'status'> & { type?: 'borrow' | 'give' }) => {
    if (!user) return;

    if (useFirebase) {
      try {
        // Map local shape to service-required fields
        const payload = {
          title: itemData.item || itemData.title || '',
          description: itemData.description || '',
          category: itemData.category || '',
          ownerId: user.uid,
          ownerName: user.name,
          ownerEmail: user.email || '',
          ownerPhone: itemData.ownerPhone || '',
          borrowerId: null,
          borrowerName: null,
          status: 'available' as const,
          type: itemData.type || 'borrow',
          price: itemData.price || 0,
          availableFrom: itemData.availableFrom || '',
          availableTo: itemData.availableTo || '',
        };
        // call borrowService.create
        const { borrowService } = await import('@/services/firestore');
        await borrowService.create(payload as any);
        // Firestore listener will update local state
      } catch (err) {
        console.error('Failed to add borrow item to Firestore', err);
        toast.error('Failed to add item');
      }
      return;
    }

    const newItem: BorrowItem = {
      ...itemData,
      id: crypto.randomUUID(),
      ownerId: user.uid,
      ownerName: user.name,
      borrowerId: null,
      borrowerName: null,
      status: 'available',
    };
    setBorrowItems(prev => [...prev, newItem]);
  };

  const borrowItem = async (itemId: string) => {
    if (!user) return;

    if (useFirebase) {
      try {
        const { borrowService } = await import('@/services/firestore');
        await borrowService.update(itemId, { borrowerId: user.uid, borrowerName: user.name, status: 'borrowed' });
        return;
      } catch (err) {
        console.error('Failed to borrow item in Firestore', err);
        toast.error('Failed to borrow item');
        return;
      }
    }

    setBorrowItems(prev => 
      prev.map(item => item.id === itemId 
        ? { ...item, borrowerId: user.uid, borrowerName: user.name, status: 'borrowed' as const } 
        : item
      )
    );
  };

  const returnItem = async (itemId: string) => {
    if (useFirebase) {
      try {
        const { borrowService } = await import('@/services/firestore');
        await borrowService.update(itemId, { borrowerId: null, borrowerName: null, status: 'available' });
        return;
      } catch (err) {
        console.error('Failed to return item in Firestore', err);
        toast.error('Failed to return item');
        return;
      }
    }

    setBorrowItems(prev => 
      prev.map(item => item.id === itemId 
        ? { ...item, borrowerId: null, borrowerName: null, status: 'available' as const } 
        : item
      )
    );
  };

  const claimGiveItem = async (itemId: string) => {
    if (!user) return;

    if (useFirebase) {
      try {
        const { borrowService } = await import('@/services/firestore');
        // transfer ownership: set ownerId to claimant and keep status valid
        await borrowService.update(itemId, { ownerId: user.uid, ownerName: user.name, status: 'available' });
        toast.success('Item claimed successfully');
        return;
      } catch (err) {
        console.error('Failed to claim give-item in Firestore', err);
        toast.error('Failed to claim item');
        return;
      }
    }

    setBorrowItems(prev => prev.map(item => item.id === itemId ? { ...item, ownerId: user.uid, ownerName: user.name, status: 'available' } : item));
  };

  const addSellItem = async (itemData: Omit<SellItem, 'id' | 'sellerId' | 'sellerName' | 'status' | 'createdAt'>) => {
    if (!user) return;

    if (useFirebase) {
      try {
        const { marketplaceService } = await import('@/services/firestore');
        const payload = {
          title: itemData.item || itemData.title || '',
          description: itemData.description || '',
          price: itemData.price,
          category: itemData.category || '',
          condition: itemData.condition || 'good',
          sellerId: user.uid,
          sellerName: user.name,
          sellerEmail: user.email || '',
          images: itemData.images || (itemData.image ? [itemData.image] : []),
          isSold: false,
        };
        await marketplaceService.create(payload as any);
        return;
      } catch (err) {
        console.error('Failed to create marketplace item in Firestore', err);
        toast.error('Failed to create listing');
        return;
      }
    }

    const newItem: SellItem = {
      ...itemData,
      id: crypto.randomUUID(),
      sellerId: user.uid,
      sellerName: user.name,
      status: 'available',
      createdAt: new Date().toISOString(),
    };
    setSellItems(prev => [...prev, newItem]);
  };

  const markAsSold = async (itemId: string) => {
    if (useFirebase) {
      try {
        const { marketplaceService } = await import('@/services/firestore');
        await marketplaceService.update(itemId, { isSold: true });
        return;
      } catch (err) {
        console.error('Failed to mark sold in Firestore', err);
        toast.error('Failed to update item');
        return;
      }
    }

    setSellItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, status: 'sold' as const, isSold: true } : item)
    );
  };

  const buyItem = async (itemId: string) => {
    if (!user) return;
    if (useFirebase) {
      try {
        const { marketplaceService } = await import('@/services/firestore');
        await marketplaceService.update(itemId, { isSold: true });
        toast.success('Item purchased!');
        return;
      } catch (err) {
        console.error('Failed to buy item in Firestore', err);
        toast.error('Failed to complete purchase');
        return;
      }
    }

    setSellItems(prev => prev.map(item => item.id === itemId ? { ...item, status: 'sold' as const, isSold: true } : item));
  };

  const addLostFoundItem = async (itemData: Omit<LostFoundItem, 'id' | 'ownerId' | 'ownerName' | 'notifiedUsers' | 'reportedAt'> & { itemType?: 'lost' | 'found'; category?: string; reporterPhone?: string; contactEmail?: string }) => {
    if (!user) return;

    if (useFirebase) {
      try {
        const { lostFoundService } = await import('@/services/firestore');
        await lostFoundService.create({
          title: itemData.item || itemData.title || '',
          description: itemData.description || '',
          itemType: itemData.itemType || 'lost',
          category: itemData.category || '',
          location: itemData.location || '',
          reporterId: user.uid,
          reporterName: user.name || '',
          reporterEmail: itemData.contactEmail || user.email || '',
          reporterPhone: itemData.reporterPhone || '',
          images: itemData.images || [],
          resolved: false,
        });
        return;
      } catch (err) {
        console.error('Failed to create lost/found in Firestore', err);
        toast.error('Failed to submit report');
        return;
      }
    }

    const newItem: LostFoundItem = {
      ...itemData,
      id: crypto.randomUUID(),
      ownerId: user.uid,
      ownerName: user.name,
      notifiedUsers: [],
      reportedAt: new Date().toISOString(),
    };
    setLostFoundItems(prev => [...prev, newItem]);
  };

  const markAsFound = async (itemId: string) => {
    if (useFirebase) {
      try {
        const { lostFoundService } = await import('@/services/firestore');
        await lostFoundService.update(itemId, { resolved: true });
        return;
      } catch (err) {
        console.error('Failed to update lost/found in Firestore', err);
        toast.error('Failed to update item');
        return;
      }
    }

    setLostFoundItems(prev => 
      prev.map(item => item.id === itemId ? { ...item, status: 'found' as const } : item)
    );
  };

  const addHelpRequest = (requestData: Omit<HelpRequest, 'id' | 'requesterId' | 'requesterName' | 'helpersNotified' | 'status' | 'createdAt'>) => {
    if (!user) return;
    const newRequest: HelpRequest = {
      ...requestData,
      id: crypto.randomUUID(),
      requesterId: user.uid,
      requesterName: user.name,
      helpersNotified: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setHelpRequests(prev => [...prev, newRequest]);
  };

  const resolveHelpRequest = (requestId: string) => {
    setHelpRequests(prev => 
      prev.map(req => req.id === requestId ? { ...req, status: 'resolved' as const } : req)
    );
  };

  const addEmergency = (emergencyData: Omit<Emergency, 'id' | 'reportedBy' | 'reporterName' | 'notifiedUsers' | 'createdAt'>) => {
    if (!user) return;
    const newEmergency: Emergency = {
      ...emergencyData,
      id: crypto.randomUUID(),
      reportedBy: user.uid,
      reporterName: user.name,
      notifiedUsers: [],
      createdAt: new Date().toISOString(),
    };
    setEmergencies(prev => [newEmergency, ...prev]);
  };

  return (
    <DataContext.Provider value={{
      posts,
      applications,
      borrowItems,
      sellItems,
      lostFoundItems,
      helpRequests,
      emergencies,
      addPost,
      applyToPost,
      updateApplicationStatus,
      addBorrowItem,
      borrowItem,
      returnItem,
      claimGiveItem,
      addSellItem,
      markAsSold,
      buyItem,
      addLostFoundItem,
      markAsFound,
      addHelpRequest,
      resolveHelpRequest,
      addEmergency,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
