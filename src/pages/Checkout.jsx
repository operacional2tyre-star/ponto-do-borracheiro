import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Copy, Check, CreditCard, QrCode, FileText,
  MapPin, User, Phone, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const PIX_KEY = '32.631.547/0001-81';
const STORE_NAME = 'A.Ayala Ramalho Comércio de Auto Peças';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, totalPricePix, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1); // 1: entrega, 2: pagamento, 3: confirmação
  const [paymentMethod, setPaymentMethod] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    name: user?.displayName || '',
    phone: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Maringá',
    state: 'PR',
    cep: '',
  });

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = form.name && form.phone && form.address && form.number && form.neighborhood && form.cep;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleFinishOrder = async () => {
    setLoading(true);
      // Validação server-side antes de salvar
    try {
      const verifyResponse = await fetch('/api/verify-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          total: paymentMethod === 'pix' ? totalPricePix : totalPrice,
          paymentMethod,
          customer: {
            name: form.name,
            phone: form.phone,
          },
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        alert(verifyResult.details?.join('\n') || 'Erro ao validar pedido. Tente novamente.');
        setLoading(false);
        return;
      }
    } catch (verifyError) {
      console.error('Erro na verificação:', verifyError);
      alert('Erro ao validar pedido. Tente novamente.');
      setLoading(false);
      return;
    }
  };

  // =========================================================
  // STEP 3 — CONFIRMAÇÃO
  // =========================================================

  if (step === 3) {
    return (
      <div className="px-4 py-3 space-y-5">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-5">
            <Check size={40} className="text-emerald-600" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            Pedido realizado!
          </h2>
          <p className="text-xs text-gray-500 font-medium mb-1">
            Pedido #{orderId?.slice(-6).toUpperCase()}
          </p>
          <p className="text-xs text-gray-500 font-medium mb-6 max-w-[260px]">
            {paymentMethod === 'pix'
              ? 'Realize o pagamento via Pix para confirmar seu pedido'
              : paymentMethod === 'cartao'
              ? 'Você será redirecionado para o Mercado Pago'
              : 'Aguardando confirmação do pagamento'}
          </p>

          {paymentMethod === 'pix' && (
            <div className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-4 space-y-3">
              <p className="text-xs font-bold text-gray-700">Chave Pix (CNPJ):</p>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <span className="text-sm font-bold text-gray-900 flex-1 break-all">
                  {PIX_KEY}
                </span>
                <button
                  onClick={handleCopyPix}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    pixCopied
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">
                {STORE_NAME}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-md"
            >
              Acompanhar pedido
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-medium text-sm"
            >
              Voltar para a loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // STEP 1 — DADOS DE ENTREGA
  // =========================================================

  // =========================================================
  // STEP 2 — PAGAMENTO
  // =========================================================

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 1 ? navigate(-1) : setStep(1)}
          className="p-1 text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
            {step === 1 ? 'Dados de Entrega' : 'Pagamento'}
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Passo {step} de 2
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-red-600" />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-red-600' : 'bg-gray-200'}`} />
      </div>

      {step === 1 ? (
        <>
          {/* Formulário de entrega */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-red-600" />
                <span className="text-xs font-bold text-gray-700">Dados pessoais</span>
              </div>

              <input
                type="text"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />

              <input
                type="tel"
                placeholder="Telefone com DDD"
                value={form.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={16} className="text-red-600" />
                <span className="text-xs font-bold text-gray-700">Endereço de entrega</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="CEP"
                  value={form.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  className="col-span-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <input
                  type="text"
                  placeholder="Número"
                  value={form.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  className="col-span-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <input
                type="text"
                placeholder="Rua / Avenida"
                value={form.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />

              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={form.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />

              <input
                type="text"
                placeholder="Bairro"
                value={form.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Cidade"
                  value={form.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <input
                  type="text"
                  placeholder="Estado"
                  value={form.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-gray-700 mb-2">Resumo do pedido</h3>
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-600 flex-1 line-clamp-1 mr-2">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-xs font-bold text-gray-900 whitespace-nowrap">
                  R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-sm font-black text-red-600">
                R$ {totalPricePix.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-all shadow-lg shadow-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar para pagamento
          </button>
        </>
      ) : (
        <>
          {/* Métodos de pagamento */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 px-0.5">Escolha a forma de pagamento</h3>

            {/* Pix */}
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                paymentMethod === 'pix'
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                paymentMethod === 'pix' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <QrCode size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-extrabold text-gray-900">Pix</p>
                <p className="text-[11px] text-gray-500 font-medium">Aprovação instantânea</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-600">
                  R$ {totalPricePix.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-[10px] font-bold text-emerald-500">3% de desconto</p>
              </div>
            </button>

            {/* Cartão de Crédito */}
            <button
              onClick={() => setPaymentMethod('cartao')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                paymentMethod === 'cartao'
                  ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                paymentMethod === 'cartao' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <CreditCard size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-extrabold text-gray-900">Cartão de Crédito</p>
                <p className="text-[11px] text-gray-500 font-medium">Via Mercado Pago</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </button>

            {/* Boleto */}
            <button
              onClick={() => setPaymentMethod('boleto')}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all active:scale-[0.99] ${
                paymentMethod === 'boleto'
                  ? 'border-orange-500 bg-orange-50/50 shadow-sm'
                  : 'border-gray-100 bg-white'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                paymentMethod === 'boleto' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <FileText size={22} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-extrabold text-gray-900">Boleto Bancário</p>
                <p className="text-[11px] text-gray-500 font-medium">Vencimento em 3 dias úteis</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-gray-900">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </button>
          </div>

          {/* Info do Pix quando selecionado */}
          {paymentMethod === 'pix' && (
            <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 space-y-3">
              <p className="text-xs font-bold text-emerald-800">Chave Pix (CNPJ):</p>
              <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                <span className="text-sm font-bold text-gray-900 flex-1 break-all">
                  {PIX_KEY}
                </span>
                <button
                  onClick={handleCopyPix}
                  className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                    pixCopied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium">
                {STORE_NAME}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">
                Após o pagamento, envie o comprovante pelo chat para agilizar a separação do pedido.
              </p>
            </div>
          )}

          {/* Info do Cartão quando selecionado */}
          {paymentMethod === 'cartao' && (
            <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-blue-800 font-medium">
                Ao confirmar, você será redirecionado para o Mercado Pago para inserir os dados do cartão com segurança.
              </p>
            </div>
          )}

          {/* Info do Boleto quando selecionado */}
          {paymentMethod === 'boleto' && (
            <div className="bg-orange-50/60 rounded-2xl p-4 border border-orange-100">
              <p className="text-xs text-orange-800 font-medium">
                O boleto será gerado após a confirmação. Prazo de vencimento de 3 dias úteis.
              </p>
            </div>
          )}

          {/* Resumo */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
              <span className="font-medium">R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
            </div>
            {paymentMethod === 'pix' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Desconto Pix</span>
                <span className="font-medium text-emerald-600">
                  - R$ {(totalPrice - totalPricePix).toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
            <div className="border-t border-gray-100 pt-2 flex justify-between">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-black text-lg text-red-600">
                R$ {(paymentMethod === 'pix' ? totalPricePix : totalPrice).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <button
            onClick={handleFinishOrder}
            disabled={!paymentMethod || loading}
            className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-all shadow-lg shadow-red-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processando...
              </>
            ) : (
              'Confirmar pedido'
            )}
          </button>
        </>
      )}
    </div>
  );
}