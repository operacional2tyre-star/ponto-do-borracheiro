import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, Package, Users, Clock, LogOut,
  ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdmin();
  const [conversations, setConversations] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chats');

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
      return;
    }

    const unsubConversations = loadConversations();
    const unsubOrders = loadOrders();

    return () => {
      if (unsubConversations) unsubConversations();
      if (unsubOrders) unsubOrders();
    };
  }, [admin]);

  const loadConversations = () => {
    const convRef = collection(db, 'conversations');
    const q = query(convRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setConversations(data);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao carregar conversas:', error);
      setLoading(false);
    });
  };

  const loadOrders = () => {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));
      setOrders(data);
    }, (error) => {
      console.error('Erro ao carregar pedidos:', error);
    });
  };

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin');
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Aguardando pagamento',
      preparing: 'Em preparação',
      shipping: 'A caminho',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-orange-600 bg-orange-50',
      preparing: 'text-red-600 bg-red-50',
      shipping: 'text-blue-600 bg-blue-50',
      delivered: 'text-emerald-600 bg-emerald-50',
      cancelled: 'text-gray-500 bg-gray-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={32} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg shadow-red-600/20">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-sm">Painel do Atendente</h1>
              <p className="text-[11px] text-white/80 font-medium">
                {admin?.name || admin?.email || 'Atendente'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs text-center">
            <p className="text-xl font-black text-red-600">{conversations.length}</p>
            <p className="text-[10px] font-bold text-gray-500 mt-0.5">Conversas</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs text-center">
            <p className="text-xl font-black text-orange-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-0.5">Pendentes</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-xs text-center">
            <p className="text-xl font-black text-emerald-600">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-[10px] font-bold text-gray-500 mt-0.5">Entregues</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100/90 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chats'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <MessageCircle size={14} />
            Conversas
            {conversations.length > 0 && (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                activeTab === 'chats' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
              }`}>
                {conversations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Package size={14} />
            Pedidos
            {orders.length > 0 && (
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                activeTab === 'orders' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* Conversations */}
        {activeTab === 'chats' && (
          <div className="space-y-2.5">
            {conversations.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
                <MessageCircle size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/admin/chat/${conv.id}`)}
                  className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-md hover:border-red-100 transition-all active:scale-[0.99] text-left group"
                >
                  <div className="relative flex-shrink-0">
                    {conv.clientPhoto ? (
                      <img
                        src={conv.clientPhoto}
                        alt={conv.clientName}
                        className="w-12 h-12 rounded-2xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm">
                        {conv.clientName?.charAt(0) || 'C'}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-sm text-gray-900 truncate group-hover:text-red-600 transition-colors">
                        {conv.clientName || 'Cliente'}
                      </h3>
                      <span className="text-[10.5px] text-gray-400 font-medium flex-shrink-0">
                        {conv.lastTime || ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate font-medium">
                      {conv.lastMessage || 'Sem mensagens'}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 truncate">
                      {conv.clientEmail || ''}
                    </p>
                  </div>

                  {conv.unreadForAtendente > 0 && (
                    <span className="bg-red-600 text-white text-[11px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5 shadow-xs flex-shrink-0">
                      {conv.unreadForAtendente}
                    </span>
                  )}

                  <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                </button>
              ))
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-2.5">
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
                <Package size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm font-medium">Nenhum pedido ainda</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-extrabold text-gray-900">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-600 font-medium">
                        {order.clientName || 'Cliente'}
                      </span>
                    </div>
                    <span className="text-sm font-black text-gray-900">
                      R$ {(order.total || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-medium">
                      {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'itens'} • {order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cartao' ? 'Cartão' : 'Boleto'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}