/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'student' | 'faculty';

export interface User {
  uid: string;
  name: string;
  email: string;
  college: string;
  role: UserRole;
  department: string;
  branch: string;
  year?: string;
  createdAt: string;
  profileComplete: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  migrateLocalUsersToFirebase: (options?: { removeLocal?: boolean }) => Promise<{ success: boolean; migrated?: number; results?: Array<{ email?: string; status: string; reason?: string; error?: string }>; error?: string; message?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateCollegeEmail = (email: string): boolean => {
  const validDomains = ['.edu', '.edu.in', '.ac.in'];
  return validDomains.some(domain => email.toLowerCase().endsWith(domain));
};

type FirebaseLikeError = { code?: string; message?: string };

// Map common Firebase Auth errors to user-friendly messages
const mapAuthError = (err: unknown) => {
  if (!err) return 'An unknown authentication error occurred.';
  const code = (err as FirebaseLikeError)?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/user-disabled':
      return 'This account has been disabled.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Try signing in or resetting your password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default: {
      const defaultMessage = (err as FirebaseLikeError)?.message;
      return typeof defaultMessage === 'string' ? defaultMessage : 'Authentication failed. Please try again.';
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    if (useFirebase) {
      // Firebase enabled - initialize with dynamic import
      import('@/lib/firebase')
        .then(async (fb) => {
          const { auth: fbAuth } = await fb.initFirebase();
          if (!fbAuth) {
            setIsLoading(false);
            return;
          }

          import('firebase/auth')
            .then(({ onAuthStateChanged }) => {
              unsubscribe = onAuthStateChanged(fbAuth, async (fbUser: unknown) => {
                if (!mounted) return;
                const authUser = fbUser as { uid: string; displayName?: string; email?: string } | null;
                if (authUser) {
                  // Try to load profile from Firestore users collection
                  try {
                    const { getDoc, doc } = await import('firebase/firestore');
                    const lib = await import('@/lib/firebase');
                    const { db } = await lib.initFirebase();

                    let profile: Record<string, unknown> | null = null;
                    if (db) {
                      const snap = await getDoc(doc(db, 'users', authUser.uid));
                      if (snap.exists()) profile = snap.data() as Record<string, unknown>;
                    }

                    const getProfileString = (key: string) => (profile && typeof profile[key] === 'string') ? (profile[key] as string) : '';

                    const u: User = {
                      uid: authUser.uid,
                      name: getProfileString('name') || authUser.displayName || '',
                      email: authUser.email || '',
                      college: getProfileString('college') || '',
                      role: (getProfileString('role') as UserRole) || 'student',
                      department: getProfileString('department') || '',
                      branch: getProfileString('branch') || '',
                      createdAt: getProfileString('createdAt') || new Date().toISOString(),
                      profileComplete: !!(profile && profile['profileComplete']),
                    };

                    setUser(u);
                  } catch (err: unknown) {
                    console.error('Failed to load user profile from Firestore', err);
                    const u: User = {
                      uid: authUser.uid,
                      name: authUser.displayName || '',
                      email: authUser.email || '',
                      college: '',
                      role: 'student',
                      department: '',
                      branch: '',
                      createdAt: new Date().toISOString(),
                      profileComplete: false,
                    };
                    setUser(u);
                  }
                } else {
                  setUser(null);
                }
                setIsLoading(false);
              });
            })
            .catch((err) => {
              console.error('Failed to load firebase/auth or subscribe to auth changes', err);
              setIsLoading(false);
            });
        })
        .catch((err) => {
          console.error('Failed to import Firebase app', err);
          setIsLoading(false);
        });
    } else {
      // Use localStorage mock
      const savedUser = localStorage.getItem('uniconnect_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    }

    return () => {
      mounted = false;
      if (unsubscribe) {
        try { unsubscribe(); } catch (e) { console.error('Error unsubscribing auth listener', e); }
      }
    };
  }, [useFirebase]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!validateCollegeEmail(email)) {
      return { success: false, error: 'Please use a valid college email (.edu, .edu.in, .ac.in)' };
    }
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const fb = await import('@/lib/firebase');
        const { auth: fbAuth } = await fb.initFirebase();
        
        if (!fbAuth) {
          return { success: false, error: 'Firebase not initialized' };
        }

        const result = await signInWithEmailAndPassword(fbAuth, email, password);
        const fbUser = result.user as { uid: string; displayName?: string; email?: string };
        const u: User = {
          uid: fbUser.uid,
          name: fbUser.displayName || '',
          email: fbUser.email || '',
          college: '',
          role: 'student',
          department: '',
          branch: '',
          createdAt: new Date().toISOString(),
          profileComplete: false,
        };
        setUser(u);
        return { success: true };
      } catch (err: unknown) {
        console.error('Firebase login error:', err);
        const message = mapAuthError(err);
        return { success: false, error: message };
      }
    }

    // Check if user exists in mock storage
    const users = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    const existingUser = users.find((u: User & { password: string }) => u.email === email);

    if (!existingUser) {
      return { success: false, error: 'User not found. Please sign up first.' };
    }

    if (existingUser.password !== password) {
      return { success: false, error: 'Invalid password.' };
    }

    const { password: _, ...userWithoutPassword } = existingUser;
    setUser(userWithoutPassword);
    localStorage.setItem('uniconnect_user', JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
    if (!validateCollegeEmail(email)) {
      return { success: false, error: 'Please use a valid college email (.edu, .edu.in, .ac.in)' };
    }
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      try {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const fb = await import('@/lib/firebase');
        const { auth: fbAuth } = await fb.initFirebase();
        
        if (!fbAuth) {
          return { success: false, error: 'Firebase not initialized' };
        }

        const result = await createUserWithEmailAndPassword(fbAuth, email, password);
        const fbUser = result.user as { uid: string; displayName?: string; email?: string };
        const u: User = {
          uid: fbUser.uid,
          name: fbUser.displayName || '',
          email: fbUser.email || '',
          college: '',
          role,
          department: '',
          branch: '',
          year: role === 'student' ? '' : undefined,
          createdAt: new Date().toISOString(),
          profileComplete: false,
        };

        // Create Firestore user doc so profile persists across devices
        try {
          const { setDoc, doc } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          if (db) {
            await setDoc(doc(db, 'users', fbUser.uid), { ...u, profileComplete: false });
          }
        } catch (err) {
          console.error('Failed to create user document in Firestore', err);
        }

        setUser(u);
        return { success: true };
      } catch (err: unknown) {
        console.error('Firebase signup error:', err);
        const message = mapAuthError(err);
        return { success: false, error: message };
      }
    }

    const users = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    const existingUser = users.find((u: User) => u.email === email);

    if (existingUser) {
      return { success: false, error: 'User already exists. Please login.' };
    }

    const newUser: User & { password: string } = {
      uid: crypto.randomUUID(),
      email,
      password,
      role,
      name: '',
      college: '',
      department: '',
      branch: '',
      year: role === 'student' ? '' : undefined,
      createdAt: new Date().toISOString(),
      profileComplete: false,
    };

    users.push(newUser);
    localStorage.setItem('uniconnect_users', JSON.stringify(users));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('uniconnect_user', JSON.stringify(userWithoutPassword));
      return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!validateCollegeEmail(email)) {
      return { success: false, error: 'Please use a valid college email (.edu, .edu.in, .ac.in)' };
    }

    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      try {
        const { sendPasswordResetEmail } = await import('firebase/auth');
        const fb = await import('@/lib/firebase');
        const { auth: fbAuth } = await fb.initFirebase();

        if (!fbAuth) {
          return { success: false, error: 'Firebase not initialized' };
        }

        await sendPasswordResetEmail(fbAuth, email);
        return { success: true };
      } catch (err: unknown) {
        console.error('Password reset error:', err);
        const message = mapAuthError(err);
        return { success: false, error: message };
      }
    }

    // Mock behavior for non-Firebase mode: set a temporary password and inform user
    const users = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    const existingUser = users.find((u: User & { password: string }) => u.email === email);

    if (!existingUser) {
      return { success: false, error: 'No account found with this email.' };
    }

    // Set a temporary password (development only) and persist
    existingUser.password = 'temp1234';
    localStorage.setItem('uniconnect_users', JSON.stringify(users));
    return { success: true };
  };

  const migrateLocalUsersToFirebase = async (options?: { removeLocal?: boolean }) : Promise<{ success: boolean; migrated?: number; results?: Array<{ email?: string; status: string; reason?: string; error?: string }>; error?: string; message?: string }> => {
    // Dev-only safeguard
    if (!import.meta.env.DEV) {
      return { success: false, error: 'Migration is allowed only in development mode.' };
    }

    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (!useFirebase) {
      return { success: false, error: 'Firebase is not enabled. Set VITE_USE_FIREBASE=true in your .env.' };
    }

    const users: Array<User & { password?: string }> = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    if (!users || users.length === 0) {
      return { success: false, message: 'No local users found to migrate.' };
    }

    // Default: remove local users after successful migration
    const removeLocal = options?.removeLocal ?? true;

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { auth: fbAuth } = await import('@/lib/firebase');
      if (!fbAuth) return { success: false, error: 'Firebase not initialized' };

      const results: Array<{ email?: string; status: string; reason?: string; error?: string }> = [];
      let migrated = 0;
      for (const u of users) {
        try {
          if (!u.email || !u.password) {
            results.push({ email: u.email, status: 'skipped', reason: 'missing email or password' });
            continue;
          }
          const res = await createUserWithEmailAndPassword(fbAuth, u.email, u.password);
          if (u.name) {
            try { await updateProfile(res.user, { displayName: u.name }); } catch (e) { console.error('Failed to set displayName during migration for', u.email, e); }
          }
          results.push({ email: u.email, status: 'ok' });
          migrated++;
        } catch (err: unknown) {
          console.error('Migration error for', u.email, err);
          const errMsg = mapAuthError(err) || (err as FirebaseLikeError)?.message || String(err);
          results.push({ email: u.email, status: 'error', error: errMsg });
        }
      }

      if (removeLocal && migrated > 0) {
        localStorage.removeItem('uniconnect_users');
        localStorage.removeItem('uniconnect_user');
      }

      return { success: true, migrated, results, message: `${migrated} users migrated` };
    } catch (err: unknown) {
      console.error('Migration failed', err);
      return { success: false, error: (err as FirebaseLikeError)?.message || 'Migration failed' };
    }
  };

  const logout = () => {
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      import('firebase/auth').then(({ signOut }) => {
        import('@/lib/firebase').then(async (fb) => {
          const { auth: fbAuth } = await fb.initFirebase();
          if (fbAuth) {
            signOut(fbAuth).catch(() => {});
          }
        });
      });
    }
    setUser(null);
    localStorage.removeItem('uniconnect_user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data, profileComplete: true };
    setUser(updatedUser);
    localStorage.setItem('uniconnect_user', JSON.stringify(updatedUser));

    // Persist to Firestore when enabled
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      try {
        const { setDoc, doc } = await import('firebase/firestore');
        const fb = await import('@/lib/firebase');
        const { db } = await fb.initFirebase();
        if (db) {
          await setDoc(doc(db, 'users', updatedUser.uid), { ...updatedUser });
        }
      } catch (err) {
        console.error('Failed to update profile in Firestore', err);
      }
    }

    // Update in users array (local mock)
    const users = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.uid === user.uid);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data, profileComplete: true };
      localStorage.setItem('uniconnect_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, resetPassword, migrateLocalUsersToFirebase, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
