import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Package, MapPin, Bell, Shield, HelpCircle,
  ChevronRight, LogOut, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, loginWithGoogle, logout } = useAuth();
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

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <Loader2 size={32} className="mx-auto text-red-600 animate-spin" />
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: 'Meus pedidos', path: '/orders' },
    { icon: MapPin, label: 'Endereços de entrega', path: '/addresses' },
    { icon: Bell, label: 'Notificações', path: '/notifications' },
    { icon: Shield, label: 'Privacidade e segurança', path: '/privacy' },
    { icon: HelpCircle, label: 'Falar com a loja', path: '/chat' },
  ];

  return (
    <div className="px-4 py-3 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Perfil
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          {user ? 'Gerencie seus dados e preferências' : 'Faça login para acessar sua conta'}
        </p>
      </div>

      {user ? (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-14 h-14 rounded-2xl object-cover shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-base text-gray-900 truncate">
                {user.displayName || 'Usuário'}
              </h2>
              <p className="text-xs text-gray-500 font-medium truncate">
                {user.email}
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                cliente desde {new Date(user.metadata?.creationTime).getFullYear() || '2024'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <User size={28} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-gray-900 text-base">Faça login</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Acesse sua conta para ver pedidos, chat e mais
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
        </div>
      )}

      {user && (
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all active:scale-[0.99] text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                <item.icon size={18} />
              </div>
              <span className="flex-1 text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                {item.label}
              </span>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      )}

      {user && (
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-3.5 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold text-sm active:scale-[0.98] transition-all"
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      )}
    </div>
  );
}