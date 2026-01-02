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
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validateCollegeEmail = (email: string): boolean => {
  const validDomains = ['.edu', '.edu.in', '.ac.in'];
  return validDomains.some(domain => email.toLowerCase().endsWith(domain));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;

  useEffect(() => {
    if (useFirebase) {
      // Firebase enabled - initialize with dynamic import
      import('@/lib/firebase').then(({ auth: fbAuth }) => {
        if (fbAuth) {
          import('firebase/auth').then(({ onAuthStateChanged: onAuthChange }) => {
            const unsubscribe = onAuthChange(fbAuth, (fbUser) => {
              if (fbUser) {
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
              } else {
                setUser(null);
              }
              setIsLoading(false);
            });
            return () => unsubscribe();
          });
        } else {
          setIsLoading(false);
        }
      }).catch(() => {
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
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!validateCollegeEmail(email)) {
      return { success: false, error: 'Please use a valid college email (.edu, .edu.in, .ac.in)' };
    }
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const { auth: fbAuth } = await import('@/lib/firebase');
        
        if (!fbAuth) {
          return { success: false, error: 'Firebase not initialized' };
        }

        const result = await signInWithEmailAndPassword(fbAuth, email, password);
        const fbUser = result.user;
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
      } catch (err: any) {
        return { success: false, error: err?.message || 'Firebase login failed' };
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
        const { auth: fbAuth } = await import('@/lib/firebase');
        
        if (!fbAuth) {
          return { success: false, error: 'Firebase not initialized' };
        }

        const result = await createUserWithEmailAndPassword(fbAuth, email, password);
        const fbUser = result.user;
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
        setUser(u);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Firebase signup failed' };
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

  const logout = () => {
    const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true' && !!import.meta.env.VITE_FIREBASE_API_KEY;
    if (useFirebase) {
      import('firebase/auth').then(({ signOut }) => {
        import('@/lib/firebase').then(({ auth: fbAuth }) => {
          if (fbAuth) {
            signOut(fbAuth).catch(() => {});
          }
        });
      });
    }
    setUser(null);
    localStorage.removeItem('uniconnect_user');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...data, profileComplete: true };
    setUser(updatedUser);
    localStorage.setItem('uniconnect_user', JSON.stringify(updatedUser));

    // Update in users array
    const users = JSON.parse(localStorage.getItem('uniconnect_users') || '[]');
    const userIndex = users.findIndex((u: User) => u.uid === user.uid);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...data, profileComplete: true };
      localStorage.setItem('uniconnect_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
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
