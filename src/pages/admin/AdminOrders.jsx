import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Search, Loader2, ShoppingBag
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!admin) { navigate('/admin'); return; }

    const unsub = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snap) => {
        setOrders(snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          createdAt: d.data().createdAt?.toDate?.() || new Date(),
        })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [admin]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
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
      pending: 'text-orange-600 bg-orange-50 border-orange-100',
      preparing: 'text-blue-600 bg-blue-50 border-blue-100',
      shipping: 'text-purple-600 bg-purple-50 border-purple-100',
      delivered: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      cancelled: 'text-gray-500 bg-gray-50 border-gray-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-100';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (o.clientName || '').toLowerCase().includes(s) ||
             o.id.toLowerCase().includes(s) ||
             (o.clientEmail || '').toLowerCase().includes(s);
    }
    return true;
  });

  const statusButtons = [
    { value: 'all', label: 'Todos', count: orders.length },
    { value: 'pending', label: 'Pendentes', count: orders.filter(o => o.status === 'pending').length },
    { value: 'preparing', label: 'Preparando', count: orders.filter(o => o.status === 'preparing').length },
    { value: 'shipping', label: 'A caminho', count: orders.filter(o => o.status === 'shipping').length },
    { value: 'delivered', label: 'Entregues', count: orders.filter(o => o.status === 'delivered').length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={28} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">Pedidos</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          Gerencie os pedidos dos clientes
        </p>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        {statusButtons.map((btn) => (
          <button
            key={btn.value}
            onClick={() => setFilter(btn.value)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              filter === btn.value
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {btn.label}
            {btn.count > 0 && (
              <span className={`ml-1.5 ${filter === btn.value ? 'text-white/80' : 'text-gray-400'}`}>
                ({btn.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Buscar por cliente ou número do pedido..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Itens</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pagamento</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-5 py-10 text-center">
                  <Package size={28} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400 font-medium">Nenhum pedido encontrado</p>
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-bold text-gray-900">{order.clientName || 'Cliente'}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{order.clientEmail || ''}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] text-gray-700 font-medium">
                      {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'itens'}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[12px] font-black text-gray-900">
                      R$ {(order.total || 0).toFixed(2).replace('.', ',')}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-[11px] font-bold text-gray-700 capitalize">
                      {order.paymentMethod === 'pix' ? 'Pix' : order.paymentMethod === 'cartao' ? 'Cartão' : 'Boleto'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-[11px] font-bold bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
                    >
                      <option value="pending">Pendente</option>
                      <option value="preparing">Preparando</option>
                      <option value="shipping">A caminho</option>
                      <option value="delivered">Entregue</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}