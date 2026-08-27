import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, MapPin, Trash2, Edit3, Check, X, Loader2, Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  collection, query, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export default function Addresses() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    label: '',
    name: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: 'Maringá',
    state: 'PR',
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const ref = collection(db, 'users', user.uid, 'addresses');
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAddresses(data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.street || !form.number || !form.neighborhood || !form.cep) return;

    setSaving(true);
    try {
      const ref = collection(db, 'users', user.uid, 'addresses');

      if (editingId) {
        await updateDoc(doc(db, 'users', user.uid, 'addresses', editingId), {
          ...form,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(ref, {
          ...form,
          createdAt: serverTimestamp(),
        });
      }

      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setForm({
      label: address.label || '',
      name: address.name || '',
      phone: address.phone || '',
      cep: address.cep || '',
      street: address.street || '',
      number: address.number || '',
      complement: address.complement || '',
      neighborhood: address.neighborhood || '',
      city: address.city || 'Maringá',
      state: address.state || 'PR',
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
      await loadAddresses();
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
    }
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  if (!user) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1 text-red-600">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-xl font-black text-gray-900">Endereços</h1>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm font-medium">Faça login para gerenciar endereços</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 text-red-600">
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight leading-tight">
              Endereços
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              Gerencie seus endereços de entrega
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white p-2.5 rounded-xl active:scale-95 transition-all shadow-sm"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-extrabold text-gray-900">
              {editingId ? 'Editar endereço' : 'Novo endereço'}
            </h3>
            <button onClick={handleCancel} className="p-1 text-gray-400">
              <X size={18} />
            </button>
          </div>

          <input
            type="text"
            placeholder="Apelido (ex: Casa, Trabalho)"
            value={form.label}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <input
            type="text"
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <input
            type="tel"
            placeholder="Telefone com DDD"
            value={form.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="CEP"
              value={form.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              className="col-span-1 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Número"
              value={form.number}
              onChange={(e) => handleInputChange('number', e.target.value)}
              className="col-span-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <input
            type="text"
            placeholder="Rua / Avenida"
            value={form.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <input
            type="text"
            placeholder="Complemento (opcional)"
            value={form.complement}
            onChange={(e) => handleInputChange('complement', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <input
            type="text"
            placeholder="Bairro"
            value={form.neighborhood}
            onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Cidade"
              value={form.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <input
              type="text"
              placeholder="Estado"
              value={form.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving || !form.name || !form.street || !form.number || !form.neighborhood || !form.cep}
            className="w-full bg-red-600 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={16} />
                {editingId ? 'Atualizar endereço' : 'Salvar endereço'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="text-center py-10">
          <Loader2 size={24} className="mx-auto text-red-600 animate-spin" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <MapPin size={36} className="text-gray-300" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-2">
            Nenhum endereço salvo
          </h2>
          <p className="text-xs text-gray-500 font-medium mb-6">
            Adicione um endereço para agilizar suas compras
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-red-600 text-white px-6 py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-md"
          >
            Adicionar endereço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                    {addr.label?.toLowerCase().includes('trabalho') ? (
                      <MapPin size={16} className="text-red-600" />
                    ) : (
                      <Home size={16} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">
                      {addr.label || 'Meu endereço'}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-medium">{addr.name}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-2 text-gray-400 hover:text-blue-600 active:scale-90 transition-all"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-2 text-gray-400 hover:text-red-600 active:scale-90 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {addr.street}, {addr.number}
                {addr.complement ? ` - ${addr.complement}` : ''}
              </p>
              <p className="text-xs text-gray-600">
                {addr.neighborhood} - {addr.city}/{addr.state}
              </p>
              <p className="text-xs text-gray-500 mt-1">CEP: {addr.cep}</p>
              {addr.phone && (
                <p className="text-[10px] text-gray-400 mt-1">Tel: {addr.phone}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}