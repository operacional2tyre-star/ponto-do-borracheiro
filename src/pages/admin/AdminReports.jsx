import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Calendar,
  Loader2, ArrowUp, ArrowDown, Package, XCircle, CheckCircle, BarChart3, Clock
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminReports() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!admin) {
      navigate('/admin');
      return;
    }

    const unsub = onSnapshot(
      query(collection(db, 'orders'), orderBy('createdAt', 'desc')),
      (snap) => {
        const data = snap.docs.map(d => {
          const raw = d.data();
          return {
            id: d.id,
            ...raw,
            createdAt: raw.createdAt?.toDate?.() || new Date(),
          };
        });
        setOrders(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar pedidos:', error);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [admin]);

  const now = new Date();

  const filterByPeriod = (order) => {
    const d = order.createdAt;
    if (!d) return false;
    if (period === 'today') {
      return d.toDateString() === now.toDateString();
    }
    if (period === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (period === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (period === 'year') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filtered = orders.filter(filterByPeriod);
  const wonOrders = filtered.filter(o => o.status === 'delivered');
  const lostOrders = filtered.filter(o => o.status === 'cancelled');
  const pendingOrders = filtered.filter(o =>
    o.status === 'pending' || o.status === 'preparing' || o.status === 'shipping'
  );

  const totalRevenue = wonOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lostRevenue = lostOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const winRate = filtered.length > 0
    ? ((wonOrders.length / filtered.length) * 100).toFixed(1)
    : '0.0';
  const avgTicket = wonOrders.length > 0 ? (totalRevenue / wonOrders.length) : 0;

  const pixOrders = wonOrders.filter(o => o.paymentMethod === 'pix');
  const cartaoOrders = wonOrders.filter(o => o.paymentMethod === 'cartao');
  const boletoOrders = wonOrders.filter(o => o.paymentMethod === 'boleto');

  const pixTotal = pixOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const cartaoTotal = cartaoOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const boletoTotal = boletoOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Vendas por dia (últimos 7 dias)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
    const dayOrders = orders.filter(o => {
      const od = o.createdAt;
      return od && od.toDateString() === d.toDateString() && o.status !== 'cancelled';
    });
    const dayTotal = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    last7Days.push({ label: dayStr, total: dayTotal, count: dayOrders.length });
  }

  const maxDayTotal = Math.max(...last7Days.map(d => d.total), 1);

  const periodLabels = {
    today: 'Hoje',
    week: 'Esta semana',
    month: 'Este mês',
    year: 'Este ano',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={28} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Relatórios</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Análise de vendas — {periodLabels[period] || period}
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'today', label: 'Hoje' },
            { value: 'week', label: 'Semana' },
            { value: 'month', label: 'Mês' },
            { value: 'year', label: 'Ano' },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p.value
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <DollarSign size={20} className="text-emerald-600" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ArrowUp size={12} /> +12%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] font-bold text-gray-500 mt-1">Faturamento</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} className="text-blue-600" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
              {wonOrders.length} vendas
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">{filtered.length}</p>
          <p className="text-[11px] font-bold text-gray-500 mt-1">Total de pedidos</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
            <span className={`flex items-center gap-1 text-[11px] font-bold ${
              parseFloat(winRate) >= 50 ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {parseFloat(winRate) >= 50 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {winRate}%
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">
            R$ {avgTicket.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] font-bold text-gray-500 mt-1">Ticket médio</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <XCircle size={20} className="text-red-600" />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600">
              -R$ {lostRevenue.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <p className="text-2xl font-black text-gray-900">{lostOrders.length}</p>
          <p className="text-[11px] font-bold text-gray-500 mt-1">Vendas perdidas</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Gráfico de vendas por dia */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-extrabold text-sm text-gray-900 mb-4">
            Vendas por dia (últimos 7 dias)
          </h3>
          <div className="flex items-end gap-3 h-48">
            {last7Days.map((day, idx) => {
              const height = maxDayTotal > 0 ? (day.total / maxDayTotal) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500">
                    {day.total > 0 ? `R$ ${day.total.toFixed(0)}` : '-'}
                  </span>
                  <div className="w-full flex items-end justify-center" style={{ height: '160px' }}>
                    <div
                      className="w-full max-w-[40px] bg-red-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500">{day.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Formas de pagamento */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-extrabold text-sm text-gray-900 mb-4">Formas de pagamento</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Pix</span>
                <span className="text-xs font-black text-gray-900">
                  R$ {pixTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${wonOrders.length > 0 ? (pixOrders.length / wonOrders.length) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">{pixOrders.length} pedidos</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Cartão</span>
                <span className="text-xs font-black text-gray-900">
                  R$ {cartaoTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${wonOrders.length > 0 ? (cartaoOrders.length / wonOrders.length) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">{cartaoOrders.length} pedidos</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-gray-700">Boleto</span>
                <span className="text-xs font-black text-gray-900">
                  R$ {boletoTotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${wonOrders.length > 0 ? (boletoOrders.length / wonOrders.length) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 font-medium mt-1">{boletoOrders.length} pedidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Taxa de conversão e resumo */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-extrabold text-sm text-gray-900 mb-4">Taxa de conversão</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle size={18} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-800">Vendas ganhas</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-emerald-700">{wonOrders.length}</p>
                <p className="text-[10px] font-bold text-emerald-600">{winRate}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <XCircle size={18} className="text-red-600" />
                <span className="text-xs font-bold text-red-800">Vendas perdidas</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-red-700">{lostOrders.length}</p>
                <p className="text-[10px] font-bold text-red-600">
                  {filtered.length > 0
                    ? ((lostOrders.length / filtered.length) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-orange-600" />
                <span className="text-xs font-bold text-orange-800">Em andamento</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-orange-700">{pendingOrders.length}</p>
                <p className="text-[10px] font-bold text-orange-600">
                  {filtered.length > 0
                    ? ((pendingOrders.length / filtered.length) * 100).toFixed(1)
                    : '0.0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-extrabold text-sm text-gray-900 mb-4">Resumo do período</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Total de pedidos</span>
              <span className="text-xs font-black text-gray-900">{filtered.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Pedidos entregues</span>
              <span className="text-xs font-black text-emerald-600">{wonOrders.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Pedidos cancelados</span>
              <span className="text-xs font-black text-red-600">{lostOrders.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Faturamento bruto</span>
              <span className="text-xs font-black text-gray-900">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-500">Perdas</span>
              <span className="text-xs font-black text-red-600">
                -R$ {lostRevenue.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-bold text-gray-700">Ticket médio</span>
              <span className="text-sm font-black text-gray-900">
                R$ {avgTicket.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}