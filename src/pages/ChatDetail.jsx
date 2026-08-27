import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, Smile } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

export default function ChatDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { messages, setActiveChat, sendMessage, markAsRead } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setActiveChat(id);
    markAsRead(id);
    return () => setActiveChat(null);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    await sendMessage(id, input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-gray-50/50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            PB
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-gray-900 truncate">
              Vendedor — Ponto do Borracheiro
            </h2>
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online agora</span>
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-xs font-medium">
              Inicie uma conversa com o vendedor
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;

          // =========================================================
          // MENSAGEM DE CARRINHO
          // =========================================================

          if (msg.type === 'cart' && msg.products) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[85%] bg-red-600 text-white rounded-3xl rounded-br-md shadow-md p-3.5">
                  <p className="text-[11px] font-bold text-white/80 mb-2.5">
                    Pedido do carrinho
                  </p>
                  <div className="space-y-2">
                    {msg.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex gap-3 items-center bg-red-700/40 rounded-2xl p-2.5"
                      >
                        <div className="w-11 h-11 bg-white/20 rounded-xl overflow-hidden flex-shrink-0">
                          {product.image && (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-white line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-white/80">
                            {product.quantity}x R${' '}
                            {Number(product.price)
                              .toFixed(2)
                              .replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-white/60 mt-2 text-right">
                    {msg.time}
                  </p>
                </div>
              </div>
            );
          }

          // =========================================================
          // MENSAGEM DE TEXTO
          // =========================================================

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[78%] px-4 py-2.5 ${
                  isMe
                    ? 'bg-red-600 text-white rounded-3xl rounded-br-md shadow-md'
                    : 'bg-white text-gray-800 rounded-3xl rounded-bl-md shadow-xs border border-gray-100'
                }`}
              >
                <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                <span
                  className={`text-[10px] mt-1 block text-right font-medium ${
                    isMe ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 safe-bottom shadow-sm">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-all">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-50 rounded-2xl px-4 py-2.5 text-xs font-medium border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          <button className="p-2 text-gray-400 hover:text-gray-600 active:scale-95 transition-all">
            <Smile size={20} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-2.5 rounded-2xl transition-all shadow-sm ${
              input.trim()
                ? 'bg-red-600 text-white active:scale-90 hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}