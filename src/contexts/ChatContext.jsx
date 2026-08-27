import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};

const ATENDENTE_ID = 'atendente-ponto-borracheiro';
const ATENDENTE_NAME = 'Vendedor — Ponto do Borracheiro';
const ATENDENTE_AVATAR = 'PB';

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  // =========================================================
  // LISTENERS DE CONVERSA DO CLIENTE
  // =========================================================

  useEffect(() => {
    if (!user) {
      setConversations([]);
      return;
    }

    const convRef = doc(db, 'conversations', user.uid);

    const unsubscribe = onSnapshot(convRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConversations([{
          id: user.uid,
          name: ATENDENTE_NAME,
          avatar: ATENDENTE_AVATAR,
          online: true,
          lastMessage: data.lastMessage || '',
          lastTime: data.lastTime || '',
          unread: data.unreadForClient || 0,
        }]);
      } else {
        setConversations([{
          id: user.uid,
          name: ATENDENTE_NAME,
          avatar: ATENDENTE_AVATAR,
          online: true,
          lastMessage: 'Clique para iniciar uma conversa',
          lastTime: '',
          unread: 0,
        }]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // =========================================================
  // LISTENER DE MENSAGENS DO CHAT ATIVO
  // =========================================================

  useEffect(() => {
    if (!user || !activeChat) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'conversations', activeChat, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          text: data.text || '',
          senderId: data.senderId,
          senderName: data.senderName || '',
          type: data.type || 'text',
          products: data.products || null,
          time: formatTime(data.timestamp),
        };
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, activeChat]);

  // =========================================================
  // ENVIAR MENSAGEM DE TEXTO
  // =========================================================

  const sendMessage = async (chatId, text, type = 'text', products = null) => {
    if (!user) return;

    const convRef = doc(db, 'conversations', chatId);
    const convSnap = await getDoc(convRef);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (!convSnap.exists()) {
      await setDoc(convRef, {
        clientId: user.uid,
        clientName: user.displayName || 'Cliente',
        clientEmail: user.email || '',
        clientPhoto: user.photoURL || '',
        atendenteId: ATENDENTE_ID,
        lastMessage: text,
        lastTime: timeStr,
        unreadForClient: 0,
        unreadForAtendente: 1,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(convRef, {
        lastMessage: text,
        lastTime: timeStr,
        unreadForAtendente: (convSnap.data().unreadForAtendente || 0) + 1,
      });
    }

    const messagesRef = collection(db, 'conversations', chatId, 'messages');
    await addDoc(messagesRef, {
      text,
      senderId: user.uid,
      senderName: user.displayName || 'Cliente',
      type,
      products: products || null,
      timestamp: serverTimestamp(),
    });
  };

  // =========================================================
  // ENVIAR CARRINHO PARA O VENDEDOR
  // =========================================================

  const sendCartToVendedor = async (cartItems, totalPrice) => {
    if (!user || !cartItems.length) return;

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartText = `Pedido do carrinho (${itemCount} ${itemCount === 1 ? 'item' : 'itens'}) - Total: R$ ${totalPrice.toFixed(2).replace('.', ',')}`;

    const products = cartItems.map((item) => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    await sendMessage(user.uid, cartText, 'cart', products);
  };

  // =========================================================
  // MARCAR COMO LIDO
  // =========================================================

  const markAsRead = async (chatId) => {
    if (!user) return;
    const convRef = doc(db, 'conversations', chatId);
    await updateDoc(convRef, { unreadForClient: 0 }).catch(() => {});
  };

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unread || 0), 0);

  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      activeChat,
      setActiveChat,
      sendMessage,
      sendCartToVendedor,
      markAsRead,
      totalUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
}