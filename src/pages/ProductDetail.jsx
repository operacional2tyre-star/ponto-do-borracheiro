import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Share2, Minus, Plus, Truck, Camera, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { fetchProductById } from '../services/nuvemshop';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    const data = await fetchProductById(id);
    setProduct(data);
    setSelectedImage(0);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Confira ${product?.name} no Ponto do Borracheiro`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="aspect-square bg-gray-200 rounded-3xl" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          <div className="h-10 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="px-4 py-12 text-center space-y-3">
        <p className="text-gray-500 font-medium">Produto não encontrado 😕</p>
        <button
          onClick={() => navigate('/')}
          className="bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md hover:bg-red-700"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const currentImg = imagesList[selectedImage] || product.image;

  return (
    <div className="animate-fade-in pb-8">
      {/* Top Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1 text-red-600 hover:bg-red-50 rounded-full active:scale-90 transition-all"
            aria-label="Voltar"
          >
            <ArrowLeft size={24} strokeWidth={2.2} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-full transition-all active:scale-90 ${
                isFavorite ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-label="Favoritar"
            >
              <Heart size={20} className={isFavorite ? 'fill-red-600' : ''} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full active:scale-90 transition-all"
              aria-label="Compartilhar"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="bg-gray-50/80 p-4 flex flex-col items-center justify-center relative">
        <div className="w-full aspect-square max-w-[320px] flex items-center justify-center relative overflow-hidden rounded-3xl bg-white p-4 shadow-xs border border-gray-100">
          {currentImg ? (
            <img
              src={currentImg}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
              <Camera size={36} strokeWidth={1.5} />
              <span className="text-xs font-bold uppercase tracking-wider">Sem Imagem</span>
            </div>
          )}
        </div>

        {/* Image Gallery Thumbnails */}
        {imagesList.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar py-1">
            {imagesList.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`w-14 h-14 rounded-2xl bg-white p-1 border-2 transition-all flex-shrink-0 ${
                  selectedImage === idx
                    ? 'border-red-600 shadow-md scale-105'
                    : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" className="w-full h-full object-contain rounded-xl" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="px-4 py-5 bg-white rounded-t-3xl -mt-4 relative shadow-lg space-y-4">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />

        {/* Category & Stock */}
        <div className="flex items-center justify-between">
          <span className="inline-block bg-red-50 text-red-600 border border-red-100 text-xs font-bold px-3 py-1 rounded-full">
            {product.category}
          </span>
          <span className="text-xs font-semibold text-gray-500">
            {product.stock > 0 ? `Estoque: ${product.stock} un` : 'Sob consulta'}
          </span>
        </div>

        {/* Product Title */}
        <h1 className="text-lg font-extrabold text-gray-900 leading-snug">
          {product.name}
        </h1>

        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-400 font-medium">SKU: {product.sku}</p>
        )}

        {/* Pricing */}
        <div className="bg-red-50/40 p-3.5 rounded-2xl border border-red-100">
          <div className="text-2xl font-black text-gray-950">
            R$ {Number(product.price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-red-600">
            <span>
              R$ {Number(product.pricePix ?? product.price * 0.97).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} no Pix
            </span>
            <span className="text-teal-600">💠</span>
          </div>
        </div>

        {/* Shipping badge */}
        {product.freeShipping && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-2.5 rounded-2xl border border-emerald-100">
            <Truck size={18} className="flex-shrink-0" />
            <span className="text-xs font-bold">Frete grátis para Maringá e região</span>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="space-y-1 pt-1">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Descrição do produto
            </h3>
            <div
              className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {/* Quantity and Add to Cart Section */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">Quantidade</span>
            <div className="flex items-center gap-3 bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs active:scale-95 transition-all text-gray-700"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-extrabold w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs active:scale-95 transition-all text-gray-700"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-2xl text-white font-extrabold text-sm transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
              added
                ? 'bg-emerald-600 shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
            }`}
          >
            {added ? (
              <>
                <Check size={18} strokeWidth={3} />
                <span>Adicionado ao carrinho!</span>
              </>
            ) : (
              <span>Adicionar ao Carrinho</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
