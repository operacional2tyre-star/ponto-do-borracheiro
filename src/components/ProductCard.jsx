import { useState } from 'react';
import { Plus, Check, Camera } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

function getOptimizedUrl(url) {
  if (!url || !url.includes('mitiendanube')) return url;
  return url.includes('?') ? `${url}&width=300` : `${url}?width=300`;
}

export default function ProductCard({ product, onClick }) {
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

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

  const optimizedImage = getOptimizedUrl(product.image);

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer flex flex-col justify-between relative overflow-hidden group"
    >
      {product.isTop && (
        <div className="absolute top-0 left-0 z-10">
          <div className="bg-red-600 text-white font-black text-[10px] tracking-wider px-3.5 py-1 rounded-br-2xl shadow-sm">
            TOP
          </div>
        </div>
      )}

      <div className="w-full aspect-square bg-transparent rounded-2xl flex items-center justify-center overflow-hidden mb-2 relative">
        {product.image ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-100 animate-pulse rounded-2xl" />
            )}
            <img
              src={optimizedImage}
              alt={product.name}
              className={`w-full h-full object-contain p-1.5 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = product.image;
                setImgLoaded(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full bg-gray-100/90 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-1.5 p-3">
            <Camera size={26} strokeWidth={1.5} className="text-gray-400" />
            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">SEM IMAGEM</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <h3 className="text-[11px] font-bold text-gray-900 uppercase line-clamp-2 leading-tight tracking-tight min-h-[28px] mb-2">
          {product.name}
        </h3>

        <div className="flex items-end justify-between gap-1.5 mt-auto pt-1">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-extrabold text-gray-950 leading-none">
              R$ {formattedPrice}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10.5px] font-semibold text-red-600 leading-tight">
              <span>R$ {formattedPricePix} no Pix</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            aria-label="Adicionar ao carrinho"
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 flex-shrink-0 shadow-md ${
              justAdded ? 'bg-green-600 text-white scale-110' : 'bg-red-600 hover:bg-red-700 text-white'
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