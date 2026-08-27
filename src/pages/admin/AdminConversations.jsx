import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MessageCircle, Loader2, Send, User, MapPin, Smartphone, Star, Clock, CheckCheck
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import {
  collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, serverTimestamp, getDoc
} from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminConversations() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!admin) { navigate('/admin'); return; }

    const unsub = onSnapshot(
      query(collection(db, 'conversations'), orderBy('createdAt', 'desc')),
      (snap) => {
        setConversations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [admin]);

  useEffect(() => {
    if (!selectedConv) return;
    const messagesRef = collection(db, 'conversations', selectedConv.id, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          time: data.timestamp?.toDate?.()
            ? data.timestamp.toDate().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : '',
        };
      });
      setMessages(msgs);
    });

    // Marcar como lida
    updateDoc(doc(db, 'conversations', selectedConv.id), { unreadForAtendente: 0 }).catch(() => {});

    return () => unsub();
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConv || !admin) return;
    setSending(true);
    try {
      const messagesRef = collection(db, 'conversations', selectedConv.id, 'messages');
      await addDoc(messagesRef, {
        text: input.trim(),
        senderId: 'atendente',
        senderName: admin.name || 'Vendedor',
        type: 'text',
        timestamp: serverTimestamp(),
      });

      const now = new Date();
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      await updateDoc(doc(db, 'conversations', selectedConv.id), {
        lastMessage: input.trim(),
        lastTime: timeStr,
        unreadForClient: (selectedConv.unreadForClient || 0) + 1,
      });
      setInput('');
    } catch (error) {
      console.error('Erro ao enviar:', error);
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

  const handleSelectConv = async (conv) => {
    setSelectedConv(conv);
    try {
      const convSnap = await getDoc(doc(db, 'conversations', conv.id));
      if (convSnap.exists()) {
        setSelectedConv({ id: convSnap.id, ...convSnap.data() });
      }
    } catch {}
  };

  const quickReplies = [
    'Frete grátis para sua região!',
    'Produto disponível em estoque.',
    'Pagamento em até 6x sem juros.',
    '3% de desconto no Pix.',
  ];

  const filteredConversations = conversations.filter(c => {
    if (search) {
      const s = search.toLowerCase();
      return (c.clientName || '').toLowerCase().includes(s) ||
             (c.clientEmail || '').toLowerCase().includes(s);
    }
    return true;
  });

  const openCount = conversations.filter(c => (c.unreadForAtendente || 0) > 0).length;
  const waitingCount = conversations.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={28} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Coluna 1 — Lista de conversas */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-extrabold text-base text-gray-900 mb-3">Conversas</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          {/* Filtros */}
          <div className="flex gap-1.5 mt-3">
            {['todas', 'abertas', 'aguardando'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all capitalize ${
                  filter === f
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center">
              <MessageCircle size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400 font-medium">Nenhuma conversa</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const hasUnread = (conv.unreadForAtendente || 0) > 0;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-gray-50 ${
                    isSelected ? 'bg-red-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {conv.clientPhoto ? (
                      <img src={conv.clientPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-red-600">
                          {(conv.clientName || 'C').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                    )}
                    {hasUnread && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-[13px] truncate ${hasUnread ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {conv.clientName || 'Cliente'}
                      </p>
                      <span className="text-[10px] text-gray-400 font-medium ml-2 flex-shrink-0">
                        {conv.lastTime || ''}
                      </span>
                    </div>
                    <p className={`text-[11px] truncate ${hasUnread ? 'font-semibold text-gray-700' : 'font-medium text-gray-400'}`}>
                      {conv.lastMessage || 'Sem mensagens'}
                    </p>
                  </div>
                  {hasUnread && (
                    <span className="bg-red-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unreadForAtendente}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna 2 — Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {!selectedConv ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-medium">Selecione uma conversa</p>
              <p className="text-gray-300 text-xs font-medium mt-1">Escolha uma conversa na lista ao lado</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header do chat */}
            <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                {selectedConv.clientPhoto ? (
                  <img src={selectedConv.clientPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">
                      {(selectedConv.clientName || 'C').charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-[13px] text-gray-900">{selectedConv.clientName || 'Cliente'}</h3>
                  <p className="text-[10px] text-gray-400 font-medium">{selectedConv.clientEmail || ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-600">Online</span>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === 'atendente';

                if (msg.type === 'cart' && msg.products) {
                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5">
                        <p className="text-[11px] font-bold text-red-600 mb-2">Pedido do carrinho</p>
                        <div className="space-y-1.5">
                          {msg.products.map((p, i) => (
                            <div key={i} className="flex gap-2 items-center bg-gray-50 rounded-lg p-2">
                              <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-gray-900 line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-gray-500">{p.quantity}x R$ {Number(p.price).toFixed(2).replace('.', ',')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-right">{msg.time}</p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm px-3.5 py-2.5 ${
                      isMe
                        ? 'bg-red-600 text-white rounded-2xl rounded-br-sm shadow-sm'
                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100'
                    }`}>
                      {!isMe && msg.senderName && (
                        <p className="text-[10px] font-bold text-red-500 mb-0.5">{msg.senderName}</p>
                      )}
                      <p className="text-[12px] font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{msg.time}</span>
                        {isMe && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Respostas rápidas */}
            <div className="bg-white border-t border-gray-100 px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
              {quickReplies.map((text, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(text)}
                  className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold whitespace-nowrap border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex-shrink-0"
                >
                  {text}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-5 py-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua resposta..."
                  className="flex-1 bg-gray-50 rounded-lg px-4 py-2.5 text-[12px] font-medium border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                  className={`px-4 py-2.5 rounded-lg font-bold text-[12px] transition-all flex items-center gap-1.5 ${
                    input.trim()
                      ? 'bg-red-600 text-white active:scale-95 hover:bg-red-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Enviar
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Coluna 3 — Dados do cliente */}
      <div className="w-[280px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 overflow-y-auto">
        {selectedConv ? (
          <>
            {/* Avatar e nome */}
            <div className="p-5 border-b border-gray-100 text-center">
              {selectedConv.clientPhoto ? (
                <img src={selectedConv.clientPhoto} alt="" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 shadow-sm" />
              ) : (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-red-600">
                    {(selectedConv.clientName || 'C').charAt(0)}
                  </span>
                </div>
              )}
              <h3 className="font-extrabold text-[14px] text-gray-900">{selectedConv.clientName || 'Cliente'}</h3>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">{selectedConv.clientEmail || ''}</p>
            </div>

            {/* Contato */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Contato</p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <User size={14} className="text-gray-400" />
                  <span className="text-[12px] font-medium text-gray-700">{selectedConv.clientName || 'Cliente'}</span>
                </div>
                {selectedConv.clientCep && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-[12px] font-medium text-gray-700">CEP {selectedConv.clientCep}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <Smartphone size={14} className="text-gray-400" />
                  <span className="text-[12px] font-medium text-gray-700">App — Mobile</span>
                </div>
              </div>
            </div>

            {/* Produto em interesse */}
            {selectedConv.lastProduct && (
              <div className="p-4 border-b border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Produto em interesse</p>
                <div className="bg-gray-50 rounded-xl p-3 flex gap-3 items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedConv.lastProduct.image && (
                      <img src={selectedConv.lastProduct.image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900 line-clamp-2">{selectedConv.lastProduct.name}</p>
                    <p className="text-[12px] font-black text-red-600 mt-0.5">
                      R$ {Number(selectedConv.lastProduct.price || 0).toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold">em estoque</p>
                  </div>
                </div>
              </div>
            )}

            {/* Respostas rápidas */}
            <div className="p-4 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Respostas rápidas</p>
              <div className="space-y-2">
                {quickReplies.map((text, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(text)}
                    className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all border border-gray-100"
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>

            {/* Estatísticas */}
            <div className="p-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Hoje</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-600">Conversas abertas</span>
                  </div>
                  <span className="text-[13px] font-black text-gray-900">{openCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCheck size={14} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-600">Respondidas</span>
                  </div>
                  <span className="text-[13px] font-black text-gray-900">{conversations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-[11px] font-medium text-gray-600">Tempo médio</span>
                  </div>
                  <span className="text-[13px] font-black text-gray-900">3 min</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <User size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400 font-medium">Selecione uma conversa</p>
              <p className="text-[10px] text-gray-300 font-medium mt-1">para ver os dados do cliente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}