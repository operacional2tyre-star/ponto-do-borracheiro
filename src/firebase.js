import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBldIRRDANsSRZPAlctf_UnW2J851IPXh8",
  authDomain: "ponto-do-borracheiro-app.firebaseapp.com",
  projectId: "ponto-do-borracheiro-app",
  storageBucket: "ponto-do-borracheiro-app.firebasestorage.app",
  messagingSenderId: "253736657828",
  appId: "1:253736657828:web:14f84ce69e5c1e742d1731",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging (notificações) — só inicializa se suportado
export let messaging = null;

isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.log('[Firebase] Messaging não suportado neste dispositivo');
  }
}).catch(() => {
  console.log('[Firebase] Erro ao verificar suporte a messaging');
});

export default app;