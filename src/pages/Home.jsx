import React, { useState, useEffect, useRef } from 'react';
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

  const dragStartRef = useRef(0);
  const isDraggingRef = useRef(false);
  const autoSlideRef = useRef(null);
  const bannerRef = useRef(null);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    const validProducts = (data || []).filter((p) => {
      const price = parseFloat(p.price) || 0;
      const stock = p.stock ?? p.stock_quantity ?? 0;
      return price > 0 && stock > 0;
    });
    setProducts(validProducts);
    setLoading(false);
  };

  const categoriesList = [
    { id: 'Pneus', name: 'Pneus', bg: '#FFF1F1', img: '/categorias/categoria-pneus.png' },
    { id: 'Câmaras de Ar', name: 'Câmaras', bg: '#F0F4FF', img: '/categorias/categoria-camara-de-ar.png' },
    { id: 'Mangueiras', name: 'Mangueiras', bg: '#F0F0F0', img: '/categorias/categoria-mangueiras.png' },
    { id: 'Kits', name: 'Kits', bg: '#FFF1F1', img: '/categorias/categoria-kits.png' },
    { id: 'Colas e Remendos', name: 'Remendos', bg: '#FFFBF0', img: '/categorias/cola-e-remendo.png' },
    { id: 'Ferramentas', name: 'Ferramentas', bg: '#F5F5F5', img: '/categorias/categoria-abracadeiras.png' },
    { id: 'Bicos e Válvulas', name: 'Bicos', bg: '#F0F6FF', img: '/categorias/categoria-conexoes.png' },
    { id: 'Acessórios para Borracharia', name: 'Acessórios', bg: '#FFFBF0', img: '/categorias/categoria-acessorios.png' },
  ];

  const bannerOffers = [
    { title: 'Ofertas da semana', subtitle: 'Peças e acessórios para sua oficina', buttonText: 'Ver ofertas', productImg: '/banners/banner-ofertas-da-semana.png', category: 'Todos' },
    { title: 'Pneus em Destaque', subtitle: 'Pneus industriais de alta resistência', buttonText: 'Ver Pneus', productImg: '/banners/banner-pneus.png', category: 'Pneus' },
    { title: 'Kits & Remendos', subtitle: 'Kits vulcanizantes e colas profissionais', buttonText: 'Ver Kits', productImg: '/banners/banner-kits.png', category: 'Kits' },
  ];

  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerOffers.length);
    }, 4500);
    return () => clearInterval(autoSlideRef.current);
  }, []);

  const resetAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % bannerOffers.length);
    }, 4500);
  };

  const goToSlide = (direction) => {
    if (direction === 'next') {
      setActiveSlide((prev) => (prev + 1) % bannerOffers.length);
    } else {
      setActiveSlide((prev) => (prev - 1 + bannerOffers.length) % bannerOffers.length);
    }
    resetAutoSlide();
  };

  // Touch events
  const handleTouchStart = (e) => {
    dragStartRef.current = e.touches[0].clientX;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const endX = e.changedTouches[0].clientX;
    const diff = dragStartRef.current - endX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? 'next' : 'prev');
    }
  };

  // Mouse events (para emulador/desktop)
  const handleMouseDown = (e) => {
    dragStartRef.current = e.clientX;
    isDraggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = dragStartRef.current - e.clientX;
    if (Math.abs(diff) > 50) {
      goToSlide(diff > 0 ? 'next' : 'prev');
    }
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Banner - Arrastável com touch E mouse */}
      <div className="relative">
        <div
          ref={bannerRef}
          className="overflow-hidden rounded-3xl shadow-lg shadow-red-900/15 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {bannerOffers.map((offer, idx) => (
              <div key={idx} className="w-full flex-shrink-0">
                <button
                  onClick={() => setSelectedCategory(offer.category)}
                  className="block w-full"
                >
                  <img
                    src={offer.productImg}
                    alt={offer.title}
                    className="w-full h-[220px] object-cover"
                    draggable="false"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Setas de navegação */}
        <button
          onClick={() => goToSlide('prev')}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => goToSlide('next')}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white active:scale-90 transition-all"
        >
          <ChevronRight size={18} />
        </button>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {bannerOffers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveSlide(idx); resetAutoSlide(); }}
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
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
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