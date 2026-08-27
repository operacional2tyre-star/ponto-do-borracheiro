import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Loader2, Save, Eye, Layout, Palette, FileText, Check
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { admin } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) return JSON.parse(savedSettings);
    return {
      reportView: 'cards',
      showCharts: true,
      showVendorStats: true,
      showPaymentBreakdown: true,
      defaultPeriod: 'month',
      storeName: 'Ponto do Borracheiro',
      storePhone: '',
      storeAddress: 'Maringá, PR',
      autoReply: true,
      autoReplyMessage: 'Olá! Recebemos sua mensagem. Em breve um vendedor irá atendê-lo.',
      notifications: true,
    };
  });

  React.useEffect(() => {
    if (!admin) navigate('/admin');
  }, [admin]);

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Preferências</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Configure a aparência e comportamento do painel
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-sm ${
            saved
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {saving ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check size={14} />
              Salvo!
            </>
          ) : (
            <>
              <Save size={14} />
              Salvar alterações
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Visualização dos relatórios */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <FileText size={18} className="text-red-600" />
            <h3 className="font-extrabold text-sm text-gray-900">Relatórios</h3>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Modelo de visualização
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'cards', label: 'Cards' },
                { value: 'table', label: 'Tabela' },
                { value: 'charts', label: 'Gráficos' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSetting('reportView', opt.value)}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all border ${
                    settings.reportView === opt.value
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Período padrão
            </label>
            <select
              value={settings.defaultPeriod}
              onChange={(e) => updateSetting('defaultPeriod', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mês</option>
              <option value="year">Este ano</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { key: 'showCharts', label: 'Mostrar gráficos' },
              { key: 'showVendorStats', label: 'Mostrar vendas por vendedor' },
              { key: 'showPaymentBreakdown', label: 'Mostrar formas de pagamento' },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{toggle.label}</span>
                <button
                  onClick={() => updateSetting(toggle.key, !settings[toggle.key])}
                  className={`w-10 h-5.5 rounded-full transition-all relative ${
                    settings[toggle.key] ? 'bg-red-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${
                    settings[toggle.key] ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Configurações da loja */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Settings size={18} className="text-red-600" />
            <h3 className="font-extrabold text-sm text-gray-900">Loja</h3>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Nome da loja
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => updateSetting('storeName', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={settings.storePhone}
              onChange={(e) => updateSetting('storePhone', e.target.value)}
              placeholder="(44) 99999-9999"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={settings.storeAddress}
              onChange={(e) => updateSetting('storeAddress', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        {/* Chat automático */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Eye size={18} className="text-red-600" />
            <h3 className="font-extrabold text-sm text-gray-900">Chat</h3>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Resposta automática</span>
            <button
              onClick={() => updateSetting('autoReply', !settings.autoReply)}
              className={`w-10 h-5.5 rounded-full transition-all relative ${
                settings.autoReply ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${
                settings.autoReply ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {settings.autoReply && (
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Mensagem automática
              </label>
              <textarea
                value={settings.autoReplyMessage}
                onChange={(e) => updateSetting('autoReplyMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Notificações de novas mensagens</span>
            <button
              onClick={() => updateSetting('notifications', !settings.notifications)}
              className={`w-10 h-5.5 rounded-full transition-all relative ${
                settings.notifications ? 'bg-red-600' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-all ${
                settings.notifications ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Aparência */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <Palette size={18} className="text-red-600" />
            <h3 className="font-extrabold text-sm text-gray-900">Aparência</h3>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Cor principal
            </label>
            <div className="flex gap-2">
              {['#DC2626', '#2563EB', '#059669', '#D97706', '#7C3AED', '#DB2777'].map((color) => (
                <button
                  key={color}
                  onClick={() => updateSetting('primaryColor', color)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    settings.primaryColor === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Preview</p>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: settings.primaryColor || '#DC2626' }}
                >
                  <Layout size={14} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{settings.storeName || 'Ponto do Borracheiro'}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{settings.storeAddress || 'Maringá, PR'}</p>
                </div>
              </div>
              <div
                className="py-2 px-3 rounded-lg text-white text-[11px] font-bold text-center"
                style={{ backgroundColor: settings.primaryColor || '#DC2626' }}
              >
                Botão de exemplo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}