import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchProductsFromAPI, categories } from '../services/nuvemshop';

export default function Search() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await fetchProductsFromAPI();
    setAllProducts(data);
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });
      setResults(filtered);
      setHasSearched(true);
    } else {
      setResults([]);
      setHasSearched(false);
    }
  }, [searchTerm, selectedCategory, allProducts]);

  const handleProductClick = (product) => {
    navigate(`/product/${product.id}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="px-4 py-4">
      {/* Search Bar */}
      <div className="relative mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          autoFocus
        />
        {searchTerm && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X size={18} className="text-gray-400" />
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Results */}
      {hasSearched && (
        <p className="text-sm text-gray-500 mb-3">
          {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </p>
      )}

      {hasSearched && results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {results.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Nenhum produto encontrado 😕</p>
          <p className="text-gray-400 text-xs mt-1">Tente buscar com outros termos</p>
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-12">
          <SearchIcon size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-sm">Digite para buscar produtos</p>

          {/* Popular Searches */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Buscas populares</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Pneus', 'Mangueiras', 'Kits', 'Remendos', 'Engates', 'Colas'].map(term => (
                <button
                  key={term}
                  onClick={() => setSearchTerm(term)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-gray-50"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

