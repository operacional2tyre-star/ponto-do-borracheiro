import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

export default function Chat() {
  const navigate = useNavigate();
  const { conversations } = useChat();
  const { user, loading, loginWithGoogle } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleChatClick = (id) => {
    navigate(`/chat/${id}`);
  };

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <Loader2 size={32} className="mx-auto text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-4">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Suporte e Atendimento
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Fale com nossa equipe técnica e tire suas dúvidas
        </p>
      </div>

      {/* Horário da Loja — largura total */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Clock size={24} className="text-red-600" />
        </div>
        <div>
          <span className="text-sm font-extrabold text-gray-900 block">Horário da Loja</span>
          <span className="text-xs text-gray-500 font-medium">Segunda a Sexta: 8h às 18h</span>
        </div>
      </div>

      {/* Se NÃO estiver logado — mostra botão de login */}
      {!user ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle size={28} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Chat com o vendedor</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Faça login para conversar diretamente com nosso time de vendas
            </p>
          </div>
          <button
            onClick={handleLogin}
            disabled={loggingIn}
            className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-red-600/20 disabled:opacity-60"
          >
            {loggingIn ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Entrando...
              </>
            ) : (
              'Entrar com Google'
            )}
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="text-xs font-bold text-gray-500 hover:text-red-600 transition-colors"
          >
            Ir para o Perfil
          </button>
        </div>
      ) : (
        <>
          {/* Se ESTIVER logado — mostra conversas direto */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar conversa ou assunto..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
            />
          </div>

          <div className="space-y-2.5">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider px-0.5">
              Canais de Atendimento
            </h2>

            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleChatClick(conv.id)}
                className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md hover:border-red-100 transition-all active:scale-[0.99] text-left group"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm">
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-sm text-gray-900 truncate group-hover:text-red-600 transition-colors">
                      {conv.name}
                    </h3>
                    <span className="text-[10.5px] text-gray-400 font-medium flex-shrink-0">
                      {conv.lastTime}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate font-medium">
                    {conv.lastMessage}
                  </p>
                </div>

                {conv.unread > 0 && (
                  <span className="bg-red-600 text-white text-[11px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-xs flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}