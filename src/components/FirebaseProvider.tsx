import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: "admin" | "user";
  photoURL?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, error: null });

export const useAuth = () => useContext(AuthContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Listen to user document in Firestore in real-time
          const userDocRef = doc(db, "users", firebaseUser.uid);
          
          unsubscribeDoc = onSnapshot(userDocRef, async (userDoc) => {
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                role: userData.role || "user",
                photoURL: firebaseUser.photoURL,
              });
              setLoading(false);
            } else {
              const isAdmin = firebaseUser.email === "admin@guruai.internal";
              
              if (isAdmin) {
                const newUser: AppUser = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  displayName: "ADMIN",
                  role: "admin",
                  photoURL: firebaseUser.photoURL,
                };
  
                await setDoc(userDocRef, {
                  uid: newUser.uid,
                  email: newUser.email,
                  displayName: newUser.displayName,
                  role: newUser.role,
                  createdAt: serverTimestamp(),
                });
  
                setUser(newUser);
                setLoading(false);
              } else {
                 // Account was deleted by admin from Firestore.
                 await auth.signOut();
                 setUser(null);
                 setError("Akun Anda telah dihapus oleh Administrator.");
                 setLoading(false);
              }
            }
          }, (err) => {
            console.error("Firestore listen error (possibly deleted/no permission):", err);
            // If permission denied, it's likely they are not logged in or deleted
            auth.signOut();
            setUser(null);
            setLoading(false);
          });
          
        } else {
          setUser(null);
          if (unsubscribeDoc) unsubscribeDoc();
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setError("Gagal memuat data pengguna.");
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}
