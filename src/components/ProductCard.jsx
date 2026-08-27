import React, { useState } from 'react';
import { Camera, Plus, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function ProductCard({ product, onClick }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const formattedPrice = Number(product.price || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedPricePix = Number(product.pricePix ?? product.price * 0.97).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Top Ribbon Badge */}
      {product.isTop && (
        <div className="absolute top-0 left-0 z-10">
          <div className="bg-red-600 text-white font-black text-[10px] tracking-wider px-3.5 py-1 rounded-br-2xl shadow-sm">
            TOP
          </div>
        </div>
      )}

      {/* Image Container */}
      <div className="w-full aspect-square bg-transparent rounded-2xl flex items-center justify-center overflow-hidden mb-2 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-100/90 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-1.5 p-3">
            <Camera size={26} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              SEM IMAGEM
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-[11px] font-bold text-gray-900 uppercase line-clamp-2 leading-tight tracking-tight min-h-[28px] mb-2">
          {product.name}
        </h3>

        {/* Pricing & Add Button Footer */}
        <div className="flex items-end justify-between gap-1.5 mt-auto pt-1">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-extrabold text-gray-950 leading-none">
              R$ {formattedPrice}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10.5px] font-semibold text-red-600 leading-tight">
              <span>R$ {formattedPricePix} no Pix</span>
              <span className="text-[10px] text-teal-600 inline-block font-bold">💠</span>
            </div>
          </div>

          {/* Plus Add Button */}
          <button
            type="button"
            onClick={handleAdd}
            aria-label="Adicionar ao carrinho"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 shadow-md ${
              justAdded
                ? 'bg-green-600 text-white scale-110'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {justAdded ? (
              <Check size={16} strokeWidth={3} className="animate-pulse" />
            ) : (
              <Plus size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

