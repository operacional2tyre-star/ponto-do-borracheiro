import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CART_MESSAGES = [
  { title: 'Ei, volta aqui!', text: 'Seu carrinho tá te esperando... vai me deixar na mão? 😢' },
  { title: 'Psst... não esqueceu nada?', text: 'Aqueles produtos no carrinho estão com saudade de você! 🛒' },
  { title: 'Falta pouco!', text: 'Seu pedido tá quase pronto, só falta finalizar! 🏁' },
  { title: 'Saudades de você!', text: 'Seus produtos estão abandonados no carrinho... coitadinhos 😅' },
  { title: 'Hora H!', text: 'Não deixa o frete grátis escapar! Finaliza logo esse pedido! 🚀' },
  { title: 'Último aviso!', text: 'Os produtos no seu carrinho podem acabar... garante o seu! ⚡' },
  { title: 'Tá pensando ainda?', text: 'Enquanto você pensa, alguém pode comprar na sua frente! 👀' },
  { title: 'Volta pro carrinho!', text: 'Tá devendo uma finalização pro seu carrinho! 💪' },
];

export default function Notifications() {
  const navigate = useNavigate();
  const { items } = useCart();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    generateNotifications();
  }, [items]);

  const generateNotifications = () => {
    const notifs = [];

    // Notificação de carrinho abandonado
    if (items.length > 0) {
      const randomMsg = CART_MESSAGES[Math.floor(Math.random() * CART_MESSAGES.length)];
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

      notifs.push({
        id: 'cart-reminder',
        type: 'cart',
        title: randomMsg.title,
        text: `${randomMsg.text}\n${itemCount} ${itemCount === 1 ? 'item' : 'itens'} — R$ ${total.toFixed(2).replace('.', ',')}`,
        time: 'Agora',
        action: () => navigate('/cart'),
        actionLabel: 'Ir para o carrinho',
        color: 'bg-red-50 border-red-100',
        iconColor: 'text-red-600',
      });
    }

    // Notificação de Pix (promoção)
    notifs.push({
      id: 'pix-discount',
      type: 'promo',
      title: 'Economize 3% com Pix!',
      text: 'Pague com Pix e ganhe desconto automático em qualquer compra! 💰',
      time: 'Hoje',
      action: () => navigate('/'),
      actionLabel: 'Ver produtos',
      color: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
    });

    // Notificação de chat
    notifs.push({
      id: 'chat-available',
      type: 'info',
      title: 'Precisa de ajuda?',
      text: 'Nosso vendedor está online e pronto para te atender! Fala com a gente 💬',
      time: 'Hoje',
      action: () => navigate('/chat'),
      actionLabel: 'Abrir chat',
      color: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
    });

    setNotifications(notifs);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-red-600">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
            Notificações
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Fique por dentro das novidades
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Bell size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            Nenhuma notificação
          </h2>
          <p className="text-xs text-gray-500 font-medium">
            Quando tiver novidades, elas aparecem aqui
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`${notif.color} rounded-2xl p-4 border shadow-xs relative`}
            >
              <button
                onClick={() => dismissNotification(notif.id)}
                className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 pr-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.iconColor}`}>
                  {notif.type === 'cart' ? (
                    <ShoppingBag size={18} />
                  ) : notif.type === 'promo' ? (
                    <span className="text-lg">💰</span>
                  ) : (
                    <Bell size={18} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-extrabold text-gray-900 mb-0.5">
                    {notif.title}
                  </h3>
                  <p className="text-xs text-gray-600 font-medium whitespace-pre-line leading-relaxed">
                    {notif.text}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                    {notif.action && (
                      <button
                        onClick={notif.action}
                        className="text-[11px] font-bold text-red-600 hover:underline active:opacity-80"
                      >
                        {notif.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}