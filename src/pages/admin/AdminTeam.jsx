import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Loader2, Trash2, Shield, Mail, User, X, Eye, EyeOff
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';

export default function AdminTeam() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!admin) { navigate('/admin'); return; }

    const unsub = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [admin]);

  const handleCreate = async () => {
    if (!newMember.name || !newMember.email || !newMember.password) {
      setError('Preencha todos os campos');
      return;
    }

    if (newMember.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreating(true);
    setError('');

    try {
      // Criar usuário no Firebase Auth usando instância separada
      const firebaseConfig = {
        apiKey: "AIzaSyBldIRRDANsSRZPAlctf_UnW2J851IPXh8",
        authDomain: "ponto-do-borracheiro-app.firebaseapp.com",
        projectId: "ponto-do-borracheiro-app",
        storageBucket: "ponto-do-borracheiro-app.firebasestorage.app",
        messagingSenderId: "253736657828",
        appId: "1:253736657828:web:14f84ce69e5c1e742d1731",
      };

      let teamApp;
      const existing = getApps().find(a => a.name === 'teamApp');
      teamApp = existing || initializeApp(firebaseConfig, 'teamApp');
      const teamAuth = getAuth(teamApp);

      const result = await createUserWithEmailAndPassword(teamAuth, newMember.email, newMember.password);

      // Criar documento no Firestore
      await setDoc(doc(db, 'admins', result.user.uid), {
        isAdmin: true,
        name: newMember.name.trim(),
        email: newMember.email.trim(),
        createdAt: new Date(),
      });

      setNewMember({ name: '', email: '', password: '' });
      setShowModal(false);
    } catch (err) {
      console.error('Erro ao criar membro:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso');
      } else if (err.code === 'auth/invalid-email') {
        setError('E-mail inválido');
      } else if (err.code === 'auth/weak-password') {
        setError('Senha muito fraca');
      } else {
        setError('Erro ao criar usuário. Tente novamente.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (memberId) => {
    if (memberId === admin?.uid) {
      alert('Você não pode excluir sua própria conta');
      return;
    }
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await deleteDoc(doc(db, 'admins', memberId));
    } catch (error) {
      console.error('Erro ao remover membro:', error);
    }
  };

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
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Equipe</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {members.length} {members.length === 1 ? 'membro' : 'membros'} na equipe
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(''); setNewMember({ name: '', email: '', password: '' }); }}
          className="px-4 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} />
          Adicionar membro
        </button>
      </div>

      {/* Lista de membros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Membro</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Função</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-all">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">
                        {(member.name || 'V').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[12px] font-bold text-gray-900">{member.name || 'Sem nome'}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[12px] text-gray-600 font-medium">{member.email || ''}</span>
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                    Vendedor
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {member.id !== admin?.uid && (
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {member.id === admin?.uid && (
                    <span className="text-[10px] font-bold text-gray-400">Você</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de criar membro */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-gray-900">Adicionar membro</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Nome do vendedor"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="relative">
                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha (mínimo 6 caracteres)"
                  value={newMember.password}
                  onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                <p className="text-xs font-bold text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar conta'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}