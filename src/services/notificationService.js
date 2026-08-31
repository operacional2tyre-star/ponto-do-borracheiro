import { getToken, onMessage } from 'firebase/messaging';
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db, messaging } from '../firebase';

export function isNotificationSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

export async function requestNotificationPermission(userId) {
  try {
    if (!isNotificationSupported()) {
      console.log('[Notificações] Não suportado neste dispositivo');
      return false;
    }

    if (Notification.permission === 'granted') {
      const token = await saveToken(userId);
      return !!token;
    }

    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('[Notificações] Permissão concedida');
      const token = await saveToken(userId);
      return !!token;
    }

    console.log('[Notificações] Permissão negada');
    return false;
  } catch (error) {
    console.error('[Notificações] Erro ao solicitar permissão:', error);
    return false;
  }
}

async function saveToken(userId) {
  try {
    // Aguarda o messaging estar disponível
    let attempts = 0;
    while (!messaging && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }

    if (!messaging) {
      console.warn('[Notificações] Messaging não disponível');
      return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      console.warn('[Notificações] VAPID key não configurada');
      return null;
    }

    const swRegistration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.log('[Notificações] Token não gerado');
      return null;
    }

    console.log('[Notificações] Token gerado com sucesso');

    const tokenRef = doc(db, 'notificationTokens', token);
    await setDoc(tokenRef, {
      token,
      userId: userId || 'anonymous',
      platform: getPlatform(),
      browser: getBrowser(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      active: true,
    }, { merge: true });

    return token;
  } catch (error) {
    console.error('[Notificações] Erro ao salvar token:', error);
    return null;
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log('[Notificações] Mensagem recebida em foreground');

    const { title, body, icon } = payload.notification || {};
    const data = payload.data || {};

    if (Notification.permission === 'granted') {
      const notification = new Notification(title || 'Ponto do Borracheiro', {
        body: body || '',
        icon: icon || '/icone.png',
        tag: data.tag || 'foreground',
        data: data,
        vibrate: [200, 100, 200],
      });

      notification.onclick = () => {
        window.focus();
        if (data.url) {
          window.location.href = data.url;
        }
        notification.close();
      };
    }

    if (callback) callback(payload);
  });
}

export async function saveNotificationHistory(userId, notification) {
  try {
    await setDoc(doc(collection(db, 'userNotifications')), {
      userId,
      title: notification.title,
      body: notification.body,
      url: notification.url || '/',
      tag: notification.tag || 'info',
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[Notificações] Erro ao salvar histórico:', error);
  }
}

function getPlatform() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Win/.test(ua)) return 'windows';
  if (/Mac/.test(ua)) return 'macos';
  return 'other';
}

function getBrowser() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg')) return 'edge';
  return 'other';
}