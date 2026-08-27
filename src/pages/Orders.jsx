import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, MessageCircle, Package, X, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export default function Orders() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('andamento');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // =========================================================
  // CARREGAR PEDIDOS DO FIREBASE
  // =========================================================

  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('clientId', '==', user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      }));

      // Ordenar por data no cliente
      data.sort((a, b) => b.createdAt - a.createdAt);

      setOrders(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  // Recarregar quando a tela ganha foco
  useEffect(() => {
    const handleFocus = () => loadOrders();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // =========================================================
  // SEPARAR PEDIDOS ATIVOS E HISTÓRICO
  // =========================================================

  const activeOrders = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'shipping'
  );

  const pastOrders = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  );

  const hasOrders = orders.length > 0;

  // =========================================================
  // HELPERS
  // =========================================================

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
      pending: 'text-orange-600',
      preparing: 'text-red-600',
      shipping: 'text-blue-600',
      delivered: 'text-emerald-600',
      cancelled: 'text-gray-500',
    };
    return colors[status] || 'text-gray-600';
  };

  const getPaymentLabel = (method) => {
    const labels = {
      pix: 'Pix',
      cartao: 'Cartão de Crédito',
      boleto: 'Boleto',
    };
    return labels[method] || method;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleBuyAgain = (order) => {
    if (order.items) {
      order.items.forEach((item) => {
        addToCart(item, item.quantity || 1);
      });
      showToast('Itens adicionados ao carrinho!');
    }
  };

  const steps = [
    { num: 1, label: 'Pedido recebido' },
    { num: 2, label: 'Em preparação' },
    { num: 3, label: 'A caminho' },
    { num: 4, label: 'Entregue' },
  ];

  const getStepNumber = (status) => {
    const map = { pending: 1, preparing: 2, shipping: 3, delivered: 4 };
    return map[status] || 1;
  };

  // =========================================================
  // TELA DE LOADING
  // =========================================================

  if (authLoading || loading) {
    return (
      <div className="px-4 py-12 text-center">
        <Loader2 size={32} className="mx-auto text-red-600 animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">Carregando pedidos...</p>
      </div>
    );
  }

  // =========================================================
  // TELA DE LOGIN
  // =========================================================

  if (!user) {
    return (
      <div className="px-4 py-3 space-y-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
            Pedidos
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Acompanhe suas compras em um só lugar
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            Faça login para ver seus pedidos
          </h2>
          <p className="text-xs text-gray-500 font-medium mb-6 max-w-[240px]">
            Entre com sua conta para acompanhar seus pedidos
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-red-600/20"
          >
            Ir para o Perfil
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER PRINCIPAL
  // =========================================================

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Título */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Pedidos
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Acompanhe suas compras em um só lugar
        </p>
      </div>

      {/* Sem pedidos */}
      {!hasOrders ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            Nenhum pedido ainda
          </h2>
          <p className="text-xs text-gray-500 font-medium mb-6 max-w-[240px]">
            Quando você fizer uma compra, seus pedidos vão aparecer aqui
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-md shadow-red-600/20"
          >
            Ver produtos
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex bg-gray-100/90 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('andamento')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'andamento'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>Em andamento</span>
              {activeOrders.length > 0 && (
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeTab === 'andamento' ? 'bg-white text-red-600' : 'bg-red-100 text-red-600'
                }`}>
                  {activeOrders.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'historico'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Histórico
            </button>
          </div>

          {/* Pedidos em andamento */}
          {activeTab === 'andamento' && (
            <div className="space-y-4">
              {activeOrders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
                  <p className="text-gray-500 text-sm font-medium">
                    Nenhum pedido em andamento
                  </p>
                </div>
              ) : (
                activeOrders.map((order) => {
                  const currentStep = getStepNumber(order.status);
                  return (
                    <div key={order.id} className="bg-gradient-to-br from-red-50/40 via-white to-gray-50/30 rounded-3xl p-4 border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
                          Pedido #{order.id.slice(-6).toUpperCase()}
                        </h2>
                        <p className={`text-xs font-extrabold mt-0.5 ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </p>
                        <p className="text-[11.5px] font-medium text-gray-500 mt-0.5">
                          {formatDate(order.createdAt)} às {formatTime(order.createdAt)}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                          Pagamento: {getPaymentLabel(order.paymentMethod)}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="pt-2 pb-1">
                        <div className="flex items-center justify-between relative px-2">
                          <div className="absolute left-6 right-6 top-[13px] h-[2.5px] bg-gray-200 -z-0" />
                          <div
                            className="absolute left-6 top-[13px] h-[2.5px] bg-red-600 -z-0 transition-all"
                            style={{ width: `${((currentStep - 1) / 3) * 100}%`, maxWidth: 'calc(100% - 48px)' }}
                          />
                          {steps.map((step) => {
                            const isCompleted = step.num < currentStep;
                            const isCurrent = step.num === currentStep;
                            return (
                              <div key={step.num} className="flex flex-col items-center z-10">
                                {isCompleted ? (
                                  <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                                    <Check size={14} strokeWidth={3} />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-7 h-7 rounded-full bg-white border-[3px] border-red-600 flex items-center justify-center shadow-sm">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center" />
                                )}
                                <span className={`text-[10px] mt-1.5 text-center leading-tight max-w-[55px] ${
                                  isCurrent ? 'font-bold text-gray-900' : isCompleted ? 'font-semibold text-gray-700' : 'font-medium text-gray-400'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Itens e total */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-12 h-12 rounded-2xl bg-white border border-gray-100 p-1 shadow-xs flex items-center justify-center flex-shrink-0">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl" />
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-bold text-gray-800 ml-1">
                            {(order.items || []).length} {(order.items || []).length === 1 ? 'item' : 'itens'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-medium text-gray-500 block">Total do pedido</span>
                          <span className="text-base font-black text-gray-950 block leading-tight">
                            R$ {(order.total || 0).toFixed(2).replace('.', ',')}
                          </span>
                          {order.paymentMethod === 'pix' && (
                            <span className="text-[10.5px] font-bold text-red-600 block">
                              R$ {(order.totalPix || 0).toFixed(2).replace('.', ',')} no Pix
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botões */}
                      <div className="flex items-center gap-2.5 pt-1">
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs py-3 rounded-2xl shadow-md transition-all text-center"
                        >
                          Ver detalhes
                        </button>
                        <button
                          onClick={() => navigate('/chat')}
                          className="flex-1 bg-white border border-red-600 text-red-600 hover:bg-red-50 active:scale-95 font-bold text-xs py-3 rounded-2xl transition-all text-center"
                        >
                          Falar com a loja
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Histórico */}
          {activeTab === 'historico' && (
            <div className="space-y-3">
              {pastOrders.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
                  <p className="text-gray-500 text-sm font-medium">
                    Nenhum pedido no histórico
                  </p>
                </div>
              ) : (
                pastOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-3xl p-3.5 border border-gray-100 shadow-xs flex items-center justify-between gap-2.5 hover:shadow-md transition-all">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {(order.items || []).slice(0, 2).map((item, idx) => (
                        <div key={idx} className="w-11 h-11 rounded-2xl bg-gray-50/80 border border-gray-100 p-1 flex items-center justify-center shadow-2xs">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded-xl" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0 pl-1">
                      <h3 className="font-extrabold text-xs text-gray-900 leading-tight">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </h3>
                      <p className={`text-[11px] font-bold mt-0.5 ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </p>
                      <p className="text-[10px] font-medium text-gray-400">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className="text-xs font-black text-gray-900">
                        R$ {(order.total || 0).toFixed(2).replace('.', ',')}
                      </span>
                      <button
                        onClick={() => handleBuyAgain(order)}
                        className="border border-red-600 text-red-600 hover:bg-red-50 active:scale-95 font-bold text-[11px] py-1 px-3 rounded-full transition-all whitespace-nowrap shadow-2xs"
                      >
                        Comprar novamente
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Card de ajuda */}
      <div className="bg-gradient-to-r from-red-50/90 via-rose-50/60 to-white border border-red-100 rounded-3xl p-3.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md relative flex-shrink-0">
            <MessageCircle size={20} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-xs text-gray-900 leading-tight">Precisa de ajuda?</h3>
            <p className="text-[10.5px] font-medium text-gray-500 mt-0.5 leading-snug">
              Nossa equipe está pronta para atender você
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/chat')}
          className="border border-red-600 text-red-600 bg-white hover:bg-red-50 active:scale-95 font-bold text-[11px] py-1.5 px-3 rounded-full transition-all whitespace-nowrap shadow-xs flex-shrink-0"
        >
          Falar com a loja
        </button>
      </div>

      {/* Modal de detalhes */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Pedido #{selectedOrderDetails.id.slice(-6).toUpperCase()}
                </h3>
                <p className={`text-xs font-bold ${getStatusColor(selectedOrderDetails.status)}`}>
                  {getStatusLabel(selectedOrderDetails.status)}
                </p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1 rounded-full text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            {/* Endereço */}
            {selectedOrderDetails.address && (
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                <p className="text-[11px] font-bold text-gray-700 mb-1">Endereço de entrega</p>
                <p className="text-xs text-gray-600">
                  {selectedOrderDetails.address.street}, {selectedOrderDetails.address.number}
                  {selectedOrderDetails.address.complement ? ` - ${selectedOrderDetails.address.complement}` : ''}
                </p>
                <p className="text-xs text-gray-600">
                  {selectedOrderDetails.address.neighborhood} - {selectedOrderDetails.address.city}/{selectedOrderDetails.address.state}
                </p>
                <p className="text-xs text-gray-600">CEP: {selectedOrderDetails.address.cep}</p>
              </div>
            )}

            {/* Pagamento */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-700 mb-1">Forma de pagamento</p>
              <p className="text-xs text-gray-600 font-medium">
                {getPaymentLabel(selectedOrderDetails.paymentMethod)}
              </p>
            </div>

            {/* Itens */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide">Itens do pedido</h4>
              {(selectedOrderDetails.items || []).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 border border-gray-100" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 max-w-[180px]">{item.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">Qtd: {item.quantity}x</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900">
                    R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="bg-red-50/60 p-3.5 rounded-2xl border border-red-100 space-y-1">
              <div className="flex justify-between text-xs font-semibold text-gray-600">
                <span>Total:</span>
                <span>R$ {(selectedOrderDetails.total || 0).toFixed(2).replace('.', ',')}</span>
              </div>
              {selectedOrderDetails.paymentMethod === 'pix' && (
                <div className="flex justify-between text-xs font-bold text-red-600">
                  <span>Total no Pix:</span>
                  <span>R$ {(selectedOrderDetails.totalPix || 0).toFixed(2).replace('.', ',')}</span>
                </div>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { handleBuyAgain(selectedOrderDetails); setSelectedOrderDetails(null); }}
                className="flex-1 bg-red-600 text-white font-bold text-xs py-3 rounded-2xl shadow-md hover:bg-red-700 active:scale-95"
              >
                Comprar novamente
              </button>
              <button
                onClick={() => { setSelectedOrderDetails(null); navigate('/chat'); }}
                className="flex-1 border border-red-600 text-red-600 font-bold text-xs py-3 rounded-2xl hover:bg-red-50 active:scale-95"
              >
                Falar com a loja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}