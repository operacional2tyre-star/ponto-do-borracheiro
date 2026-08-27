import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Image, Package, Loader2, User, Phone
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
      return;
    }

    loadConversation();
    const unsub = loadMessages();

    return () => {
      if (unsub) unsub();
    };
  }, [id, admin]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const convRef = doc(db, 'conversations', id);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        setConversation({ id: convSnap.id, ...convSnap.data() });
        await updateDoc(convRef, { unreadForAtendente: 0 });
      }
    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
    }
  };

  const loadMessages = () => {
    const messagesRef = collection(db, 'conversations', id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          time: data.timestamp?.toDate?.()
            ? data.timestamp.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : '',
        };
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar mensagens:', error);
      setLoading(false);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || !admin) return;

    setSending(true);
    try {
      const messagesRef = collection(db, 'conversations', id, 'messages');
      await addDoc(messagesRef, {
        text: input.trim(),
        senderId: 'atendente',
        senderName: admin.name || 'Vendedor',
        type: 'text',
        timestamp: serverTimestamp(),
      });

      const convRef = doc(db, 'conversations', id);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await updateDoc(convRef, {
        lastMessage: input.trim(),
        lastTime: timeStr,
        unreadForClient: (conversation?.unreadForClient || 0) + 1,
      });

      setInput('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSendProduct = async (product) => {
    if (!admin) return;

    try {
      const messagesRef = collection(db, 'conversations', id, 'messages');
      await addDoc(messagesRef, {
        text: `Produto: ${product.name}`,
        senderId: 'atendente',
        senderName: admin.name || 'Vendedor',
        type: 'product',
        product: {
          name: product.name,
          price: product.price,
          image: product.image,
        },
        timestamp: serverTimestamp(),
      });

      const convRef = doc(db, 'conversations', id);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await updateDoc(convRef, {
        lastMessage: `Produto: ${product.name}`,
        lastTime: timeStr,
      });
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-lg shadow-red-600/20 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-1 hover:bg-white/20 rounded-full active:scale-90 transition-all"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          {conversation?.clientPhoto ? (
            <img
              src={conversation.clientPhoto}
              alt=""
              className="w-10 h-10 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <User size={18} />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm truncate">
              {conversation?.clientName || 'Cliente'}
            </h2>
            <p className="text-[11px] text-white/80 font-medium truncate">
              {conversation?.clientEmail || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-xs font-medium">
              Nenhuma mensagem ainda
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === 'atendente';

          // Produto compartilhado
          if (msg.type === 'product' && msg.product) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[82%] bg-red-600 text-white rounded-3xl rounded-br-md shadow-md p-3.5">
                  <p className="text-[11px] font-bold text-white/80 mb-2">
                    Produto compartilhado
                  </p>
                  <div className="flex gap-3 items-center">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex-shrink-0 overflow-hidden">
                      {msg.product.image && (
                        <img src={msg.product.image} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white line-clamp-2">
                        {msg.product.name}
                      </p>
                      <p className="text-sm font-black mt-1">
                        R$ {Number(msg.product.price || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/60 mt-2 text-right">{msg.time}</p>
                </div>
              </div>
            );
          }

          // Carrinho do cliente
          if (msg.type === 'cart' && msg.products) {
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[85%] bg-white rounded-3xl rounded-bl-md shadow-xs border border-gray-100 p-3.5">
                  <p className="text-[11px] font-bold text-red-600 mb-2">
                    Pedido do carrinho
                  </p>
                  <div className="space-y-2">
                    {msg.products.map((product, idx) => (
                      <div key={idx} className="flex gap-3 items-center bg-gray-50 rounded-2xl p-2.5">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                          {product.image && (
                            <img src={product.image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {product.quantity}x R$ {Number(product.price).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-right">{msg.time}</p>
                </div>
              </div>
            );
          }

          // Texto
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[78%] px-4 py-2.5 ${
                isMe
                  ? 'bg-red-600 text-white rounded-3xl rounded-br-md shadow-md'
                  : 'bg-white text-gray-800 rounded-3xl rounded-bl-md shadow-xs border border-gray-100'
              }`}>
                {!isMe && msg.senderName && (
                  <p className="text-[10px] font-bold text-red-600 mb-1">{msg.senderName}</p>
                )}
                <p className="text-xs font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                <span className={`text-[10px] mt-1 block text-right font-medium ${
                  isMe ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 sticky bottom-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua resposta..."
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-xs font-medium border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={`p-2.5 rounded-2xl transition-all shadow-sm ${
              input.trim()
                ? 'bg-red-600 text-white active:scale-90 hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}