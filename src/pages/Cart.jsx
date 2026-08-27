import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, MessageCircle, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, clearCart, totalPrice, totalPricePix } = useCart();
  const { user, loginWithGoogle } = useAuth();
  const { sendCartToVendedor } = useChat();
  const [sending, setSending] = useState(false);

  const handleFinalizarPedido = () => {
    navigate('/checkout');
  };

  const handleFecharComVendedor = async () => {
    setSending(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await loginWithGoogle();
      }
      if (currentUser) {
        await sendCartToVendedor(items, totalPricePix);
        navigate(`/chat/${currentUser.uid}`);
      }
    } catch (error) {
      console.error('Erro ao enviar carrinho:', error);
    } finally {
      setSending(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Carrinho vazio</h2>
        <p className="text-gray-500 text-sm mb-6">Adicione produtos para continuar</p>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-white px-6 py-3 rounded-xl font-medium"
        >
          Ver produtos
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Meu Carrinho ({items.length})</h1>
        <button onClick={clearCart} className="text-sm text-red-500 font-medium">
          Limpar
        </button>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-6">
        {items.map(item => (
          <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-xl object-cover bg-gray-100"
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                {item.name}
              </h3>
              <p className="text-base font-bold text-gray-900">
                R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
              </p>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 bg-white rounded-md flex items-center justify-center active:scale-90"
                  >
                    {item.quantity === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 bg-white rounded-md flex items-center justify-center active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 active:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Desconto Pix (3%)</span>
          <span className="font-medium text-green-600">
            - R$ {(totalPrice - totalPricePix).toFixed(2).replace('.', ',')}
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between">
          <span className="font-bold text-gray-900">Total</span>
          <span className="font-bold text-lg text-primary">
            R$ {totalPricePix.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {/* Finalizar Pedido — abre tela de Checkout */}
        <button
          onClick={handleFinalizarPedido}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base mt-3 active:scale-[0.98] transition-all shadow-lg shadow-primary/30"
        >
          Finalizar Pedido
        </button>

        {/* Fechar com vendedor — envia pelo chat */}
        <button
          onClick={handleFecharComVendedor}
          disabled={sending}
          className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-60"
        >
          {sending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <MessageCircle size={18} />
              Fechar com vendedor
            </>
          )}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium text-sm"
        >
          Continuar comprando
        </button>
      </div>
    </div>
  );
}