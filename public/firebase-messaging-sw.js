importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBldIRRDANsSRZPAlctf_UnW2J851IPXh8",
  authDomain: "ponto-do-borracheiro-app.firebaseapp.com",
  projectId: "ponto-do-borracheiro-app",
  storageBucket: "ponto-do-borracheiro-app.firebasestorage.app",
  messagingSenderId: "253736657828",
  appId: "1:253736657828:web:14f84ce69e5c1e742d1731"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon, image } = payload.notification || {};
  const data = payload.data || {};

  self.registration.showNotification(title || 'Ponto do Borracheiro', {
    body: body || '',
    icon: icon || '/icone.png',
    image: image || undefined,
    badge: '/icone.png',
    tag: data.tag || 'default',
    data: data,
    vibrate: [200, 100, 200],
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});