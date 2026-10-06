import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  type User, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logOutTrader, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  watchlist: string[];
  isWatchlisted: (assetId: string) => boolean;
  toggleWatchlist: (assetId: string, symbol: string, category: string) => Promise<void>;
  saveTradeSetup: (setup: {
    symbol: string;
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    lotSize: number;
    dollarRisk: number;
    riskRewardRatio: number;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Listen to Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore Watchlist when user is logged in
  useEffect(() => {
    if (!user) {
      setWatchlist([]);
      return;
    }

    const path = `users/${user.uid}/watchlist`;
    const watchlistCol = collection(db, path);
    const unsubscribe = onSnapshot(
      watchlistCol,
      (snapshot) => {
        const ids = snapshot.docs.map((d) => d.id);
        setWatchlist(ids);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in with Google:', error);
    }
  };

  const signOut = async () => {
    try {
      await logOutTrader();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const isWatchlisted = (assetId: string) => watchlist.includes(assetId);

  const toggleWatchlist = async (assetId: string, symbol: string, category: string) => {
    if (!user) {
      // Local fallback for guest
      setWatchlist((prev) =>
        prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
      );
      return;
    }

    const docPath = `users/${user.uid}/watchlist/${assetId}`;
    const docRef = doc(db, 'users', user.uid, 'watchlist', assetId);

    if (watchlist.includes(assetId)) {
      try {
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      try {
        await setDoc(docRef, {
          assetId,
          symbol,
          category,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      }
    }
  };

  const saveTradeSetup = async (setup: {
    symbol: string;
    entryPrice: number;
    stopLossPrice: number;
    takeProfitPrice: number;
    lotSize: number;
    dollarRisk: number;
    riskRewardRatio: number;
  }) => {
    if (!user) return;
    const setupId = `setup_${Date.now()}`;
    const docPath = `users/${user.uid}/tradeSetups/${setupId}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'tradeSetups', setupId), {
        ...setup,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, docPath);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        watchlist,
        isWatchlisted,
        toggleWatchlist,
        saveTradeSetup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
