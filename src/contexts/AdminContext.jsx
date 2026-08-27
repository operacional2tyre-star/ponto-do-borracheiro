import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};

const firebaseConfig = {
  apiKey: "AIzaSyBldIRRDANsSRZPAlctf_UnW2J851IPXh8",
  authDomain: "ponto-do-borracheiro-app.firebaseapp.com",
  projectId: "ponto-do-borracheiro-app",
  storageBucket: "ponto-do-borracheiro-app.firebasestorage.app",
  messagingSenderId: "253736657828",
  appId: "1:253736657828:web:14f84ce69e5c1e742d1731",
};

let adminApp;
const existingApps = getApps();
const adminAppExists = existingApps.find(a => a.name === 'adminApp');

if (adminAppExists) {
  adminApp = adminAppExists;
} else {
  adminApp = initializeApp(firebaseConfig, 'adminApp');
}

const adminAuth = getAuth(adminApp);
const adminDb = getFirestore(adminApp);

// Aceita isAdmin ou Admin
const checkIsAdmin = (data) => {
  return data.isAdmin === true || data.Admin === true;
};

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginAdmin = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(adminAuth, email, password);
      console.log('Login OK, UID:', result.user.uid);

      const adminRef = doc(adminDb, 'admins', result.user.uid);
      const userDoc = await getDoc(adminRef);

      console.log('Documento existe?', userDoc.exists());
      if (userDoc.exists()) {
        console.log('Dados:', JSON.stringify(userDoc.data()));
        console.log('É admin?', checkIsAdmin(userDoc.data()));
      }

      if (userDoc.exists() && checkIsAdmin(userDoc.data())) {
        const data = userDoc.data();
        setAdmin({
          uid: result.user.uid,
          email: result.user.email,
          name: (data.name || data.Name || 'Atendente').trim(),
        });
        return true;
      } else {
        await signOut(adminAuth);
        throw new Error('Acesso não autorizado');
      }
    } catch (error) {
      console.error('Erro:', error.message);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    await signOut(adminAuth);
    setAdmin(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(adminAuth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(adminDb, 'admins', user.uid));
          if (userDoc.exists() && checkIsAdmin(userDoc.data())) {
            const data = userDoc.data();
            setAdmin({
              uid: user.uid,
              email: user.email,
              name: (data.name || data.Name || 'Atendente').trim(),
            });
          } else {
            setAdmin(null);
          }
        } catch {
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AdminContext.Provider value={{ admin, loading, loginAdmin, logoutAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}