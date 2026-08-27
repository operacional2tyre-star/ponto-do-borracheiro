import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Search, Loader2, Package, Tag, Layers, ExternalLink
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { getProducts } from '../../services/nuvemshop';

export default function AdminProducts() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    if (!admin) { navigate('/admin'); return; }
    loadProducts();
  }, [admin]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (search) {
      const s = search.toLowerCase();
      return p.name.toLowerCase().includes(s) ||
             (p.sku || '').toLowerCase().includes(s) ||
             (p.category || '').toLowerCase().includes(s);
    }
    return true;
  });

  const inStock = products.filter(p => (p.stock ?? p.stock_quantity ?? 0) > 0);
  const outOfStock = products.filter(p => (p.stock ?? p.stock_quantity ?? 0) <= 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 size={28} className="text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Produtos</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {products.length} produtos • {inStock.length} em estoque • {outOfStock.length} sem estoque
          </p>
        </div>
        <button
          onClick={loadProducts}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Loader2 size={14} />
          Atualizar
        </button>
      </div>

      {/* Busca e filtros */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por nome, SKU ou categoria..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'Todas categorias' : cat}</option>
          ))}
        </select>
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-6 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-6 text-center py-10 bg-white rounded-xl border border-gray-200">
            <Package size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400 font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          filtered.map((product) => {
            const stock = product.stock ?? product.stock_quantity ?? 0;
            const price = parseFloat(product.price) || 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] font-bold text-gray-900 line-clamp-2 min-h-[24px]">
                    {product.name}
                  </p>
                  {product.category && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 rounded text-[8px] font-bold text-gray-500">
                      {product.category}
                    </span>
                  )}
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[12px] font-black text-gray-900">
                      R$ {price.toFixed(2).replace('.', ',')}
                    </p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      stock > 0
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {stock > 0 ? `${stock} un.` : 'Esgotado'}
                    </span>
                  </div>
                  {product.sku && (
                    <p className="text-[8px] text-gray-400 font-medium mt-1">SKU: {product.sku}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}