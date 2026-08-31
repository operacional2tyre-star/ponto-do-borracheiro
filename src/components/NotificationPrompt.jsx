import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, isNotificationSupported } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationPrompt() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (!user) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;
    if (sessionStorage.getItem('notif_dismissed')) return;

    const timer = setTimeout(() => {
      setShow(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [user]);

  async function handleAllow() {
    setLoading(true);
    try {
      await requestNotificationPermission(user?.uid);
      setShow(false);
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setShow(false);
    sessionStorage.setItem('notif_dismissed', 'true');
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50" style={{ animation: 'slideUp 0.3s ease forwards' }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
        <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
          <Bell size={20} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-gray-900">Ativar notificações</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Receba alertas sobre pedidos, promoções e mensagens do atendente
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleAllow}
              disabled={loading}
              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ativando...' : 'Ativar'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-xs text-gray-400 font-medium px-3 py-2 hover:text-gray-600 transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="p-1 text-gray-300 hover:text-gray-500 shrink-0">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}