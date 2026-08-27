import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle, Package, BarChart3, ShoppingBag, Users, Settings, LogOut, ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logoutAdmin } = useAdmin();

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin');
  };

  const mainMenu = [
    { icon: MessageCircle, label: 'Conversas', path: '/admin/conversations', badge: 4 },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
    { icon: Package, label: 'Pedidos', path: '/admin/orders' },
    { icon: ShoppingBag, label: 'Produtos', path: '/admin/products' },
  ];

  const configMenu = [
    { icon: Users, label: 'Equipe', path: '/admin/team' },
    { icon: Settings, label: 'Preferências', path: '/admin/settings' },
  ];

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-[220px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center">
              <MessageCircle size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-[13px] text-gray-900 leading-tight">Ponto do</h1>
              <h1 className="font-extrabold text-[13px] text-gray-900 leading-tight">Borracheiro</h1>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-2 ml-0.5">Painel do vendedor</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-2">Principal</p>
          {mainMenu.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  active
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mt-5 mb-2">Configurações</p>
          {configMenu.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                  active
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={17} strokeWidth={active ? 2.5 : 2} />
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
              {(admin?.name || 'V').charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-gray-900 truncate">{admin?.name || 'Vendedor'}</p>
              <p className="text-[10px] text-gray-400 font-medium">Vendedor</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-red-600"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-[220px]">
        <Outlet />
      </div>
    </div>
  );
}