import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  X,
} from 'lucide-react';

import { getProducts } from '../services/nuvemshop';
import ProductCard from '../components/ProductCard';

const ITEMS_PER_PAGE = 30;

export default function Categories() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // =========================================================
  // CARREGAR PRODUTOS
  // =========================================================

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getProducts();
        // Filtra produtos sem preço ou sem estoque
        const validProducts = (Array.isArray(data) ? data : []).filter((p) => {
          const price = parseFloat(p.price) || 0;
          const stock = p.stock ?? p.stock_quantity ?? 0;
          return price > 0 && stock > 0;
        });
        setProducts(validProducts);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Resetar contagem ao trocar de categoria
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory]);

  // =========================================================
  // CONTAGEM DE PRODUTOS POR CATEGORIA
  // =========================================================

  const getCount = (catId) => {
    if (!products.length) return '';
    const count = products.filter(
      (product) => product.category?.toLowerCase() === catId.toLowerCase()
    ).length;
    return `${count} produto${count !== 1 ? 's' : ''}`;
  };

  // =========================================================
  // CATEGORIAS
  // =========================================================

  const categoryList = [
    {
      id: 'Pneus',
      name: 'Pneus',
      bg: '#FFF1F1',
      img: '/categorias/categoria-pneus.png',
    },
    {
      id: 'Câmaras de Ar',
      name: 'Câmaras de Ar',
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
      name: 'Colas e Remendos',
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
      id: 'Acessórios para Borracharia',
      name: 'Acessórios',
      bg: '#FFFBF0',
      img: '/categorias/categoria-acessorios.png',
    },
    {
      id: 'Bicos e Válvulas',
      name: 'Bicos e Válvulas',
      bg: '#F0F6FF',
      img: '/categorias/categoria-conexoes.png',
    },
  ];

  // =========================================================
  // FILTRAR CATEGORIAS PELA BUSCA
  // =========================================================

  const filteredCategoryList = categoryList.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // =========================================================
  // PRODUTOS DA CATEGORIA SELECIONADA
  // =========================================================

  const categoryProducts = selectedCategory
    ? products.filter(
        (product) =>
          product.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : [];

  const visibleProducts = categoryProducts.slice(0, visibleCount);
  const hasMore = visibleCount < categoryProducts.length;
  const remaining = categoryProducts.length - visibleCount;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="px-4 py-3 space-y-5">

      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
          Encontre o que precisa
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-1">
          Explore produtos para sua oficina
        </p>
      </div>

      {/* BUSCA DE CATEGORIA */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          type="text"
          placeholder="Buscar categoria..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white rounded-2xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-0.5"
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* CATEGORIA SELECIONADA */}
      {selectedCategory ? (
        <div className="space-y-4">

          {/* CABEÇALHO DA CATEGORIA */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-gray-100 shadow-xs">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-600 active:scale-95 transition-all"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
              <span>Todas as categorias</span>
            </button>
            <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              {selectedCategory} ({categoryProducts.length})
            </span>
          </div>

          {/* FILTRO RÁPIDO DAS CATEGORIAS */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm animate-pulse space-y-3"
                >
                  <div className="aspect-square bg-gray-200 rounded-2xl" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                  <div className="h-5 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : categoryProducts.length > 0 ? (
            <>
              {/* PRODUTOS */}
              <div className="grid grid-cols-2 gap-3.5">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={(p) => navigate(`/product/${p.id}`)}
                  />
                ))}
              </div>

              {/* BOTÃO VER MAIS */}
              {hasMore && (
                <div className="flex flex-col items-center gap-2 pt-2 pb-1">
                  <p className="text-xs text-gray-400 font-medium">
                    Mostrando {visibleCount} de {categoryProducts.length} produtos
                  </p>
                  <button
                    onClick={handleLoadMore}
                    className="w-full py-3 bg-white border-2 border-red-500 text-red-600 font-bold text-sm rounded-2xl active:scale-[0.98] transition-all shadow-xs hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    Ver mais {remaining > ITEMS_PER_PAGE ? ITEMS_PER_PAGE : remaining} produtos
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </div>
              )}

              {/* CONTADOR QUANDO TODOS CARREGADOS */}
              {!hasMore && categoryProducts.length > ITEMS_PER_PAGE && (
                <p className="text-center text-xs text-gray-400 pt-1 pb-1">
                  Todos os {categoryProducts.length} produtos foram carregados
                </p>
              )}
            </>
          ) : (
            /* NENHUM PRODUTO */
            <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
              <p className="text-gray-500 text-sm font-medium">
                Nenhum produto nesta categoria.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="mt-3 text-xs font-bold text-red-600 hover:underline"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* TODAS AS CATEGORIAS */}
          <div>
            <h2 className="font-extrabold text-gray-900 text-base mb-3 px-0.5">
              Todas as categorias
            </h2>
            <div className="flex flex-col gap-3">
              {filteredCategoryList.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{ backgroundColor: cat.bg }}
                  className="rounded-3xl p-3 border border-gray-100 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-4 active:scale-[0.98] group"
                >
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-sm bg-gray-100 group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error(`Imagem não encontrada: ${cat.img}`);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-base text-gray-900 leading-tight group-hover:text-red-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">
                      {getCount(cat.id)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center group-hover:bg-red-600 transition-colors mr-1">
                    <ChevronRight
                      size={15}
                      strokeWidth={3}
                      className="text-red-600 group-hover:text-white transition-colors"
                    />
                  </div>
                </div>
              ))}

              {filteredCategoryList.length === 0 && (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100 p-6">
                  <p className="text-gray-500 text-sm font-medium">
                    Nenhuma categoria encontrada.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-3 text-xs font-bold text-red-600 hover:underline"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BANNER DE OFERTAS */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#990000] via-[#c41515] to-[#700000] text-white p-4 shadow-md">
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="relative z-10 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-white leading-tight">
                  Ofertas para sua oficina
                </h3>
                <p className="text-xs text-white/85 font-medium mt-0.5">
                  Veja as melhores oportunidades
                </p>
              </div>
              <button
                onClick={() => setSelectedCategory('Acessórios para Borracharia')}
                className="inline-flex items-center gap-1 bg-white text-red-600 font-bold text-xs px-3.5 py-2 rounded-full shadow hover:bg-gray-50 active:scale-95 transition-all flex-shrink-0"
              >
                <span>Ver ofertas</span>
                <ArrowRight size={13} strokeWidth={3} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}