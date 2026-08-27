import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, Package, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: LayoutGrid, label: 'Categorias', path: '/categories' },
    { icon: ShoppingCart, label: 'Carrinho', path: '/cart', badge: totalItems },
    { icon: Package, label: 'Pedidos', path: '/orders' },
    { icon: User, label: 'Perfil', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1.5 z-50 shadow-lg shadow-black/5">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => handleNavigate(tab.path)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 relative active:scale-90 transition-all"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-red-600' : 'text-gray-400'}
                />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-red-600' : 'text-gray-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}