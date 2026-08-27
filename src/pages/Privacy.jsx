import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Lock, Smartphone,
  Trash2, ChevronRight, AlertTriangle, Loader2, Check, Eye
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { deleteUser } from 'firebase/auth';

export default function Privacy() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (user) {
        await deleteUser(user);
        await logout();
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      alert('Erro ao deletar conta. Faça login novamente e tente.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const sections = [
    {
      title: 'Conta',
      items: [
        {
          icon: Lock,
          label: 'Alterar senha',
          description: 'Altere a senha da sua conta Google',
          action: () => window.open('https://myaccount.google.com/security', '_blank'),
        },
        {
          icon: Smartphone,
          label: 'Verificação em duas etapas',
          description: 'Adicione uma camada extra de segurança',
          action: () => window.open('https://myaccount.google.com/signinoptions/two-step-verification', '_blank'),
        },
      ],
    },
    {
      title: 'Privacidade',
      items: [
        {
          icon: Eye,
          label: 'Dados da conta',
          description: 'Veja e gerencie seus dados no Google',
          action: () => window.open('https://myaccount.google.com/data-and-privacy', '_blank'),
        },
        {
          icon: Shield,
          label: 'Permissões do app',
          description: 'Veja as permissões que o app possui',
          action: () => {},
        },
      ],
    },
  ];

  return (
    <div className="px-4 py-3 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 text-red-600">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
            Privacidade e Segurança
          </h1>
          <p className="text-xs text-gray-500 font-medium">
            Gerencie sua conta e dados
          </p>
        </div>
      </div>

      {user && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900">Conta verificada</p>
              <p className="text-[11px] text-gray-500 font-medium">{user.email}</p>
            </div>
            <div className="ml-auto">
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                <Check size={10} strokeWidth={3} />
                Segura
              </span>
            </div>
          </div>
        </div>
      )}

      {sections.map((section, sIdx) => (
        <div key={sIdx}>
          <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider px-0.5 mb-2.5">
            {section.title}
          </h2>
          <div className="space-y-2">
            {section.items.map((item, iIdx) => (
              <button
                key={iIdx}
                onClick={item.action}
                className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all active:scale-[0.99] text-left group"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
                  <item.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-[10.5px] text-gray-400 font-medium mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider px-0.5 mb-2.5">
          Zona de perigo
        </h2>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center gap-3.5 p-3.5 bg-red-50 rounded-2xl border border-red-100 shadow-xs hover:shadow-md transition-all active:scale-[0.99] text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-500">
              <Trash2 size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-600">Excluir conta</p>
              <p className="text-[10.5px] text-red-400 font-medium mt-0.5">
                Esta ação é irreversível
              </p>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </button>
        ) : (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-extrabold text-red-800">Tem certeza?</p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  Sua conta será excluída permanentemente. Todos os seus dados, pedidos e conversas serão perdidos.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-white text-gray-700 py-2.5 rounded-xl font-bold text-xs border border-gray-200 active:scale-95 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-bold text-xs active:scale-95 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  'Sim, excluir'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center pt-4 pb-2">
        <p className="text-[10px] text-gray-300 font-medium">
          Ponto do Borracheiro v1.0.0
        </p>
      </div>
    </div>
  );
}