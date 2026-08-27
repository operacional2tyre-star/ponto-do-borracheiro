import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, ChevronRight, LayoutGrid, X, ChevronLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/nuvemshop';

const ITEMS_PER_PAGE = 30;

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    // Filtra produtos sem preço ou sem estoque
    const validProducts = (data || []).filter((p) => {
      const price = parseFloat(p.price) || 0;
      const stock = p.stock ?? p.stock_quantity ?? 0;
      return price > 0 && stock > 0;
    });
    setProducts(validProducts);
    setLoading(false);
  };

  const categoriesList = [
    {
      id: 'Pneus',
      name: 'Pneus',
      bg: '#FFF1F1',
      img: '/categorias/categoria-pneus.png',
    },
    {
      id: 'Câmaras de Ar',
      name: 'Câmaras',
      bg: '#F0F4FF',
      img: '/categorias/categoria-camara-de-ar.png',
    },
    {
      id: 'Mangueiras',
      name: 'Mangueiras',
      bg: '#F0F0F0',
      img: '/categorias/categoria-mangueiras.png',
    },
    {
      id: 'Kits',
      name: 'Kits',
      bg: '#FFF1F1',
      img: '/categorias/categoria-kits.png',
    },
    {
      id: 'Colas e Remendos',
      name: 'Remendos',
      bg: '#FFFBF0',
      img: '/categorias/categoria-conexoes.png',
    },
    {
      id: 'Ferramentas',
      name: 'Ferramentas',
      bg: '#F5F5F5',
      img: '/categorias/categoria-abracadeiras.png',
    },
    {
      id: 'Bicos e Válvulas',
      name: 'Bicos',
      bg: '#F0F6FF',
      img: '/categorias/categoria-conexoes.png',
    },
    {
      id: 'Acessórios para Borracharia',
      name: 'Acessórios',
      bg: '#FFFBF0',
      img: '/categorias/categoria-acessorios.png',
    },
  ];

  const bannerOffers = [
  { title: 'Ofertas da semana', subtitle: 'Peças e acessórios para sua oficina', buttonText: 'Ver ofertas', productImg: '/banners/banner-ofertas-da-semana.png', category: 'Todos' },
  { title: 'Pneus em Destaque', subtitle: 'Pneus industriais de alta resistência', buttonText: 'Ver Pneus', productImg: '/banners/banner-pneus.png', category: 'Pneus' },
  { title: 'Kits & Remendos', subtitle: 'Kits vulcanizantes e colas profissionais', buttonText: 'Ver Kits', productImg: '/banners/banner-kits.png', category: 'Kits' },
];

  useEffect(() => {
    const interval = setInterval(() => setActiveSlide((prev) => (prev + 1) % bannerOffers.length), 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [selectedCategory, searchTerm]);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleProductClick = (product) => navigate(`/product/${product.id}`);
  const handleCategorySelect = (catId) => setSelectedCategory(selectedCategory === catId ? 'Todos' : catId);
  const currentOffer = bannerOffers[activeSlide];

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-red-900/15">
        <button
          onClick={() => setSelectedCategory(currentOffer.category)}
          className="block w-full"
        >
          <img
            src={currentOffer.productImg}
            alt={currentOffer.title}
            className="w-full h-[180px] object-cover rounded-3xl"
          />
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
          {bannerOffers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeSlide === idx ? 'w-5 bg-red-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-0.5">
          <LayoutGrid size={18} className="text-red-600" />
          <h2 className="font-bold text-gray-900 text-[15px]">Encontre por categoria</h2>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl transition-all duration-200 text-center active:scale-95 ${
                  isSelected
                    ? 'bg-red-50 border-2 border-red-500 shadow-sm'
                    : 'bg-white border border-gray-100 shadow-xs'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden shadow-inner mb-1.5 flex items-center justify-center"
                  style={{ backgroundColor: cat.bg }}
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <span className={`text-xs font-semibold ${isSelected ? 'text-red-600' : 'text-gray-800'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white rounded-2xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-0.5">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => navigate('/search')}
          className="w-11 h-11 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-red-600 active:scale-95 transition-all shadow-xs flex-shrink-0"
        >
          <SlidersHorizontal size={19} />
        </button>
      </div>

      {/* Produtos */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h2 className="font-extrabold text-gray-900 text-base tracking-tight">
            {selectedCategory === 'Todos' ? 'Mais vendidos' : selectedCategory}
            {filteredProducts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-400">({filteredProducts.length})</span>
            )}
          </h2>
          {(selectedCategory !== 'Todos' || searchTerm) && (
            <button
              onClick={() => { setSelectedCategory('Todos'); setSearchTerm(''); }}
              className="text-xs font-bold text-red-600 flex items-center gap-0.5"
            >
              <X size={13} /> Limpar
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse space-y-3">
                <div className="aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm font-medium">Nenhum produto encontrado</p>
            <button
              onClick={() => { setSelectedCategory('Todos'); setSearchTerm(''); }}
              className="mt-3 text-xs font-bold text-red-600 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5">
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={handleProductClick} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 pb-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 active:scale-95 transition-all shadow-xs"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`dots-${idx}`} className="text-gray-400 text-sm px-1">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-95 shadow-xs ${
                          currentPage === item
                            ? 'bg-red-600 text-white border border-red-600'
                            : 'bg-white text-gray-700 border border-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 active:scale-95 transition-all shadow-xs"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-2 pb-2">
              Página {currentPage} de {totalPages} — {filteredProducts.length} produtos
            </p>
          </>
        )}
      </div>
    </div>
  );
}