import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Building2, User, Phone, MapPin, Radio, 
  Printer, QrCode, ExternalLink, Trash2, Edit3, CheckCircle2, 
  Clock, DollarSign, Sparkles, Filter, AlertCircle, Share2, Layers,
  Zap, Package, Eye, Star, MessageSquare, Instagram, Globe, Box, Tag, CreditCard
} from 'lucide-react';
import { PlaquinhaRecord, TipoPlaquinhaId, getTipoPlaquinhaInfo, TIPOS_PLAQUINHAS_CATALOGO } from '../types';
import { NfcWriterModal } from './NfcWriterModal';
import { PlaquinhaCardModal } from './PlaquinhaCardModal';
import { DynamicDestinoModal } from './DynamicDestinoModal';
import { BatchStockModal } from './BatchStockModal';
import { ActivateStockPlaquinhaModal } from './ActivateStockPlaquinhaModal';
import { EditPlaquinhaModal } from './EditPlaquinhaModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { TipoPlaquinhaSelector } from './TipoPlaquinhaSelector';
import { DomainSettingsModal } from './DomainSettingsModal';

export const PlaquinhasManagerTab: React.FC = () => {
  const [plaquinhas, setPlaquinhas] = useState<PlaquinhaRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedPlaquinhaNfc, setSelectedPlaquinhaNfc] = useState<PlaquinhaRecord | null>(null);
  const [selectedPlaquinhaPrint, setSelectedPlaquinhaPrint] = useState<PlaquinhaRecord | null>(null);
  const [selectedPlaquinhaDestino, setSelectedPlaquinhaDestino] = useState<PlaquinhaRecord | null>(null);
  const [selectedPlaquinhaActivate, setSelectedPlaquinhaActivate] = useState<PlaquinhaRecord | null>(null);
  const [selectedPlaquinhaEdit, setSelectedPlaquinhaEdit] = useState<PlaquinhaRecord | null>(null);
  const [plaquinhaToDelete, setPlaquinhaToDelete] = useState<PlaquinhaRecord | null>(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showBatchStockModal, setShowBatchStockModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalTab, setAddModalTab] = useState<'cliente' | 'modelo' | 'modulos' | 'venda'>('cliente');
  const [nextId, setNextId] = useState<number>(1000);

  // Form State for New / Edit Plaquinha
  const [formData, setFormData] = useState({
    empresa: '',
    responsavel: '',
    telefone: '',
    email: '',
    cidade: '',
    estado: 'SP',
    endereco: '',
    tipoPlaquinha: 'placa_10x15_madeira' as TipoPlaquinhaId,
    statusVenda: 'visitado' as const,
    modoDestino: 'google_review' as const,
    valorCobrado: 189.90,
    googlePlaceId: '',
    googleReviewUrl: '',
    modGoogleReview: true,
    modPix: true,
    modWhatsapp: true,
    modInstagram: true,
    modWifi: false,
    modVcard: false,
    // Modulo Pix
    pixChave: '',
    pixTipo: 'telefone' as const,
    pixBeneficiario: '',
    pixCidade: '',
    pixValor: 0,
    // Modulo WhatsApp
    waNumero: '',
    waMensagem: 'Olá! Gostaria de mais informações.',
    // Modulo Instagram
    instaUsuario: '',
    // Modulo Wi-Fi
    wifiSsid: '',
    wifiSenha: '',
  });

  const [searchGmpQuery, setSearchGmpQuery] = useState('');
  const [searchingGmp, setSearchingGmp] = useState(false);
  const [gmpSearchResults, setGmpSearchResults] = useState<any[]>([]);

  const fetchPlaquinhas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plaquinhas');
      if (res.ok) {
        const data = await res.json();
        setPlaquinhas(data.plaquinhas || []);
        setNextId(data.nextId || 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaquinhas();
  }, []);

  // Search Google Meu Negócio directly inside form to auto-fill placeId and details
  const handleSearchGoogleBusiness = async () => {
    if (!searchGmpQuery.trim()) return;
    setSearchingGmp(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchGmpQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setGmpSearchResults(data.places || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingGmp(false);
    }
  };

  const selectGmpPlace = (place: any) => {
    setFormData((prev) => ({
      ...prev,
      empresa: place.name || prev.empresa,
      endereco: place.address || prev.endereco,
      googlePlaceId: place.id,
      googleReviewUrl: place.links?.directReviewUrl || `https://search.google.com/local/writereview?placeid=${place.id}`,
      telefone: place.phone || prev.telefone,
      pixBeneficiario: place.name || prev.pixBeneficiario,
    }));
    setGmpSearchResults([]);
    setSearchGmpQuery('');
  };

  const handleSavePlaquinha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.empresa || !formData.responsavel) {
      alert('Nome da empresa e responsável são obrigatórios.');
      return;
    }

    const payload = {
      empresa: formData.empresa,
      responsavel: formData.responsavel,
      telefone: formData.telefone,
      email: formData.email,
      cidade: formData.cidade,
      estado: formData.estado,
      endereco: formData.endereco,
      tipoPlaquinha: formData.tipoPlaquinha,
      statusVenda: formData.statusVenda,
      modoDestino: formData.modoDestino,
      valorCobrado: Number(formData.valorCobrado),
      googlePlaceId: formData.googlePlaceId,
      googleReviewUrl: formData.googleReviewUrl,
      modulosAtivos: {
        googleReview: formData.modGoogleReview,
        pix: formData.modPix,
        whatsapp: formData.modWhatsapp,
        instagram: formData.modInstagram,
        wifi: formData.modWifi,
        vcard: formData.modVcard,
        customUrl: false,
      },
      dadosModulos: {
        pix: formData.modPix
          ? {
              chave: formData.pixChave,
              tipo: formData.pixTipo,
              beneficiario: formData.pixBeneficiario || formData.empresa,
              cidade: formData.pixCidade || formData.cidade || 'SAO PAULO',
              valor: formData.pixValor > 0 ? Number(formData.pixValor) : undefined,
            }
          : undefined,
        whatsapp: formData.modWhatsapp
          ? {
              numero: formData.waNumero || formData.telefone,
              mensagem: formData.waMensagem,
            }
          : undefined,
        instagram: formData.modInstagram
          ? {
              usuario: formData.instaUsuario,
              url: `https://instagram.com/${formData.instaUsuario.replace('@', '')}`,
            }
          : undefined,
        wifi: formData.modWifi
          ? {
              ssid: formData.wifiSsid,
              senha: formData.wifiSenha,
              seguranca: 'WPA' as const,
            }
          : undefined,
      },
    };

    try {
      const res = await fetch('/api/plaquinhas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar plaquinha');
      }

      await fetchPlaquinhas();
      setShowAddModal(false);
      // Reset form
      setFormData({
        empresa: '',
        responsavel: '',
        telefone: '',
        email: '',
        cidade: '',
        estado: 'SP',
        endereco: '',
        tipoPlaquinha: 'acrilico',
        statusVenda: 'visitado',
        modoDestino: 'google_review',
        valorCobrado: 149.90,
        googlePlaceId: '',
        googleReviewUrl: '',
        modGoogleReview: true,
        modPix: true,
        modWhatsapp: true,
        modInstagram: true,
        modWifi: false,
        modVcard: false,
        pixChave: '',
        pixTipo: 'telefone',
        pixBeneficiario: '',
        pixCidade: '',
        pixValor: 0,
        waNumero: '',
        waMensagem: 'Olá! Gostaria de agendar um horário.',
        instaUsuario: '',
        wifiSsid: '',
        wifiSenha: '',
      });
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar');
    }
  };

  const handleDeletePlaquinha = async (id: number) => {
    if (!confirm(`Tem certeza que deseja excluir a plaquinha #${id}?`)) return;
    try {
      const res = await fetch(`/api/plaquinhas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPlaquinhas();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Troca instantânea e automática de destino em 1 clique (sem precisar abrir modal)
  const handleQuickSwitchDestino = async (item: PlaquinhaRecord, novoModo: PlaquinhaRecord['modoDestino']) => {
    try {
      // Atualização otimista imediata na UI
      setPlaquinhas((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, modoDestino: novoModo } : p))
      );

      const res = await fetch(`/api/plaquinhas/${item.id}/destino`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modoDestino: novoModo }),
      });

      if (!res.ok) {
        fetchPlaquinhas();
        throw new Error('Falha ao atualizar destino');
      }
    } catch (e: any) {
      alert(e.message || 'Erro ao alterar destino');
      fetchPlaquinhas();
    }
  };

  // Filter list
  const filtered = plaquinhas.filter((p) => {
    const matchesSearch =
      p.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(p.id).includes(searchTerm);

    const matchesStatus = filterStatus === 'todos' || p.statusVenda === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalVendidas = plaquinhas.filter((p) => p.statusVenda === 'pago' || p.statusVenda === 'instalado').length;
  const faturamentoTotal = plaquinhas
    .filter((p) => p.statusVenda === 'pago' || p.statusVenda === 'instalado')
    .reduce((acc, curr) => acc + (curr.valorCobrado || 0), 0);
  const totalNfcGravados = plaquinhas.filter((p) => p.nfcConfig?.gravado).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Clientes Cadastrados</span>
            <p className="text-2xl font-bold text-white mt-0.5">{plaquinhas.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Chips NFC Gravados</span>
            <p className="text-2xl font-bold text-white mt-0.5">{totalNfcGravados}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Vendas Realizadas</span>
            <p className="text-2xl font-bold text-white mt-0.5">
              R$ {faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Próxima Plaquinha</span>
            <p className="text-2xl font-bold text-indigo-300 font-mono mt-0.5">#{nextId}</p>
          </div>
        </div>
      </div>

      {/* Action and Filter Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Banco de Clientes & Plaquinhas Inteligentes</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Gerencie seus clientes de visita, numeração automática a partir de #1000, gravação de chip NFC e gabaritos de QR Code.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDomainModal(true)}
              className="flex items-center justify-center space-x-1.5 px-4 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
              title="Configurar domínio oficial do site para produção e entender o funcionamento dos QR Codes"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Domínio do Site &amp; Produção</span>
            </button>

            <button
              onClick={() => setShowBatchStockModal(true)}
              className="flex items-center justify-center space-x-1.5 px-4 py-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <Package className="w-4 h-4" />
              <span>Gerar Lote de Placas em Estoque</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Cliente (# {nextId})</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID (#1000), nome da empresa, responsável ou cidade..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
            {(['todos', 'disponivel', 'visitado', 'negociando', 'pago', 'instalado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {st === 'disponivel' ? '📦 Em Estoque' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic QR System Guarantee Notice */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white text-xs">
                QR Codes Dinâmicos &bull; Cada Plaquinha tem seu QR Único e Permanente
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                O desenho do QR Code gravado fisicamente em cada plaquinha (#1000, #1001, etc.) aponta para a rota permanente <code className="text-amber-300 font-mono">/r/NUMERO</code>. Ao editar o cliente e inserir o link de avaliação ou WhatsApp, <strong>o desenho físico da plaquinha NUNCA muda</strong> — o servidor atualiza apenas o destino online instantaneamente!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Plaquinhas / Clients */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Nenhum cliente ou plaquinha encontrado</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cadastre seu primeiro cliente ou gere um lote em estoque para começar a vender.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setShowBatchStockModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              📦 Gerar Lote em Branco
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Cadastrar Plaquinha #{nextId}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-3xl p-5 flex flex-col justify-between transition-all shadow-lg hover:shadow-indigo-500/5 group ${
                item.statusVenda === 'disponivel'
                  ? 'border-amber-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Card: Unique QR Thumbnail, ID and Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2.5">
                    {/* Unique QR Preview */}
                    <div
                      onClick={() => setSelectedPlaquinhaPrint(item)}
                      className="w-10 h-10 bg-white p-0.5 rounded-lg border border-slate-700 shadow-sm flex items-center justify-center flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      title={`QR Code Físico Único da Plaquinha #${item.id} (/r/${item.id}) - Clique para ver o gabarito de impressão`}
                    >
                      {item.mainQrDataUrl ? (
                        <img src={item.mainQrDataUrl} alt={`QR #${item.id}`} className="w-9 h-9 object-contain" />
                      ) : (
                        <QrCode className="w-5 h-5 text-slate-800" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm">
                          #{item.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.codigo}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400/90 font-mono block mt-0.5">
                        /r/{item.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        item.statusVenda === 'disponivel'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : item.statusVenda === 'instalado'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : item.statusVenda === 'pago'
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : item.statusVenda === 'negociando'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {item.statusVenda === 'disponivel' ? '📦 Em Estoque' : item.statusVenda}
                    </span>

                    <button
                      onClick={() => setSelectedPlaquinhaEdit(item)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Editar todas as informações do cliente e da plaquinha"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  </div>
                </div>

                {/* Company Name & Rep */}
                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                  {item.empresa}
                </h3>
                <p className="text-xs text-slate-400 flex items-center mt-1">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
                  <span>{item.responsavel}</span>
                </p>

                {/* Location and Phone */}
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <div className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
                    <span>{item.telefone || 'Sem telefone cadastrado'}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
                    <span>{item.cidade || 'Local não definido'} - {item.estado || 'SP'}</span>
                  </div>
                </div>

                {/* Model & Price Badge */}
                {(() => {
                  const modelInfo = getTipoPlaquinhaInfo(item.tipoPlaquinha);
                  return (
                    <div className="mt-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1.5 truncate">
                        <Layers className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate">{modelInfo.nome}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({modelInfo.dimensoes})</span>
                      </div>
                      <span className="text-xs font-bold font-mono text-emerald-400 flex-shrink-0 ml-2">
                        R$ {(item.valorCobrado || modelInfo.precoSugerido).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  );
                })()}

                {/* In-Stock Fast Action Banner */}
                {item.statusVenda === 'disponivel' ? (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
                    <span className="text-[11px] text-amber-300 font-medium block">
                      ⚡ Placa em branco pronta para vender!
                    </span>
                    <button
                      onClick={() => setSelectedPlaquinhaActivate(item)}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                      <span>Ativar para Cliente no Balcão</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Modules Badges */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-1.5">
                      {item.modulosAtivos?.googleReview && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25">
                          ⭐ Google
                        </span>
                      )}
                      {item.modulosAtivos?.pix && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          💳 PIX
                        </span>
                      )}
                      {item.modulosAtivos?.whatsapp && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-green-500/15 text-green-300 border border-green-500/25">
                          💬 Whats
                        </span>
                      )}
                      {item.modulosAtivos?.instagram && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-pink-500/15 text-pink-300 border border-pink-500/25">
                          📸 Insta
                        </span>
                      )}
                      {item.modulosAtivos?.wifi && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-lg bg-blue-500/15 text-blue-300 border border-blue-500/25">
                          📶 Wi-Fi
                        </span>
                      )}
                    </div>
                  </>
                )}

                {/* Dynamic Destination Badge & Direct 1-Click Fast Changer */}
                <div className="mt-3 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                      <span className="text-slate-400 font-medium">Destino do QR / NFC:</span>
                    </div>

                    {/* Quick Native Select for instant change with zero clicks into modals */}
                    <select
                      value={item.modoDestino || 'google_review'}
                      onChange={(e) => handleQuickSwitchDestino(item, e.target.value as any)}
                      className="bg-slate-900 border border-slate-750 text-white font-semibold text-[11px] rounded-lg px-2 py-1 cursor-pointer focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      title="Mudar o destino do QR Code instantaneamente sem abrir modal"
                    >
                      <option value="google_review">⭐ Google 5★ Direto</option>
                      <option value="hub">📱 Hub Completo</option>
                      <option value="whatsapp">💬 WhatsApp Direto</option>
                      <option value="instagram">📸 Instagram Direto</option>
                      <option value="custom_url">🌐 Link Custom</option>
                    </select>
                  </div>

                  {/* 1-Click Instant Action Buttons */}
                  <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-850">
                    <button
                      type="button"
                      onClick={() => handleQuickSwitchDestino(item, 'google_review')}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                        item.modoDestino === 'google_review'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                      title="Levar direto para as 5 Estrelas do Google"
                    >
                      ⭐ 5★ Google
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchDestino(item, 'hub')}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                        item.modoDestino === 'hub'
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                      title="Abrir Hub com todos os módulos da loja"
                    >
                      📱 Hub Loja
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchDestino(item, 'whatsapp')}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                        item.modoDestino === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                      title="Abrir WhatsApp direto"
                    >
                      💬 Whats
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickSwitchDestino(item, 'instagram')}
                      className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer truncate ${
                        item.modoDestino === 'instagram'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                      title="Abrir Instagram oficial"
                    >
                      📸 Insta
                    </button>
                  </div>
                </div>

                {/* NFC status & Scans counter */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Radio className="w-3 h-3 text-indigo-400" />
                      <span>NFC:</span>
                    </span>
                    <span className={item.nfcConfig?.gravado ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                      {item.nfcConfig?.gravado ? 'Gravado ✓' : 'Pendente'}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800/60 flex items-center justify-between">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Scans:</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {item.scansTotal || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setSelectedPlaquinhaEdit(item)}
                    className="flex items-center justify-center space-x-1 py-2 px-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-all cursor-pointer"
                    title="Editar informações do cliente, módulos e dados da placa"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => setSelectedPlaquinhaNfc(item)}
                    className="flex items-center justify-center space-x-1 py-2 px-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>NFC</span>
                  </button>

                  <button
                    onClick={() => setSelectedPlaquinhaPrint(item)}
                    className="flex items-center justify-center space-x-1 py-2 px-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-all border border-slate-700 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Placa QR</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`/r/${item.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1 hover:underline"
                    title="Abre a rota dinâmica permanente que é lida pelo QR Code físico"
                  >
                    <Zap className="w-3 h-3 fill-amber-400" />
                    <span>Testar QR (/r/{item.id})</span>
                  </a>

                  <div className="flex items-center space-x-2">
                    <a
                      href={`/p/${item.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center space-x-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Hub #{item.id}</span>
                    </a>

                    <button
                      onClick={() => setPlaquinhaToDelete(item)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-rose-500/10"
                      title="Excluir Plaquinha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Cadastrar Novo Cliente & Plaquinha */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Nova Plaquinha #{nextId}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Cadastro de Cliente &amp; Plaquinha</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setAddModalTab('cliente')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  addModalTab === 'cliente'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>1. Informações do Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setAddModalTab('modelo')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  addModalTab === 'modelo'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>2. Tipo de Plaquinha &amp; Preço</span>
              </button>

              <button
                type="button"
                onClick={() => setAddModalTab('modulos')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  addModalTab === 'modulos'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>3. Módulos &amp; Recursos</span>
              </button>

              <button
                type="button"
                onClick={() => setAddModalTab('venda')}
                className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  addModalTab === 'venda'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>4. Venda &amp; Destino QR</span>
              </button>
            </div>

            <form onSubmit={handleSavePlaquinha} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* TAB 1: CLIENTE */}
              {addModalTab === 'cliente' && (
                <div className="space-y-4">
                  {/* Optional: Auto-search in Google Meu Negócio to fill fields */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-blue-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Puxar dados direto do Google Meu Negócio (Opcional):</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchGmpQuery}
                    onChange={(e) => setSearchGmpQuery(e.target.value)}
                    placeholder="Digite o nome da empresa para buscar..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleSearchGoogleBusiness}
                    disabled={searchingGmp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl"
                  >
                    {searchingGmp ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {gmpSearchResults.length > 0 && (
                  <div className="mt-2 space-y-1 bg-slate-900 p-2 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                    {gmpSearchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => selectGmpPlace(p)}
                        className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-sm">{p.address}</p>
                        </div>
                        <span className="text-[10px] text-blue-400 font-semibold">Preencher Dados &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dados Básicos */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  1. Informações do Estabelecimento & Responsável
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa / Comércio *</label>
                    <input
                      type="text"
                      required
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      placeholder="Ex: Mega Natural Hair"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Nome do Responsável / Contato *</label>
                    <input
                      type="text"
                      required
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      placeholder="Ex: Dra. Juliana Santos"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="Ex: (11) 98765-4321"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">E-mail (Opcional)</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com.br"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="São Paulo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                      placeholder="SP"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold text-xs block mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    placeholder="Rua, número, bairro..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAddModalTab('modelo')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    <span>Avançar para Modelo &amp; Preço</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          )}

            {/* TAB 2: MODELO DA PLAQUINHA & VALOR */}
            {addModalTab === 'modelo' && (
              <div className="space-y-4">
                <TipoPlaquinhaSelector
                  selectedTipo={formData.tipoPlaquinha}
                  valorCobrado={formData.valorCobrado}
                  onSelectTipo={(novoTipo, preco) => {
                    setFormData(prev => ({
                      ...prev,
                      tipoPlaquinha: novoTipo,
                      valorCobrado: preco,
                    }));
                  }}
                  onChangeValorCobrado={(novoValor) => {
                    setFormData(prev => ({
                      ...prev,
                      valorCobrado: novoValor,
                    }));
                  }}
                />

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setAddModalTab('cliente')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    &larr; Voltar para Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddModalTab('modulos')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    <span>Avançar para Módulos</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: MÓDULOS ATIVOS */}
            {addModalTab === 'modulos' && (
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
                  3. Módulos &amp; QR Codes Ativos na Plaquinha
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.modGoogleReview}
                      onChange={(e) => setFormData({ ...formData, modGoogleReview: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-semibold text-amber-300">⭐ Google Avaliação</span>
                  </label>

                  <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.modPix}
                      onChange={(e) => setFormData({ ...formData, modPix: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-semibold text-emerald-400">💳 Pagamento PIX</span>
                  </label>

                  <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.modWhatsapp}
                      onChange={(e) => setFormData({ ...formData, modWhatsapp: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-semibold text-green-400">💬 WhatsApp</span>
                  </label>

                  <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.modInstagram}
                      onChange={(e) => setFormData({ ...formData, modInstagram: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-semibold text-pink-400">📸 Instagram</span>
                  </label>

                  <label className="flex items-center space-x-2 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={formData.modWifi}
                      onChange={(e) => setFormData({ ...formData, modWifi: e.target.checked })}
                      className="rounded"
                    />
                    <span className="font-semibold text-blue-400">📶 Wi-Fi Conexão</span>
                  </label>
                </div>

                {/* Sub-form PIX */}
                {formData.modPix && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <span className="font-bold text-emerald-400">Dados do PIX:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Chave PIX *</label>
                        <input
                          type="text"
                          value={formData.pixChave}
                          onChange={(e) => setFormData({ ...formData, pixChave: e.target.value })}
                          placeholder="CNPJ, Celular, E-mail..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Nome do Beneficiário</label>
                        <input
                          type="text"
                          value={formData.pixBeneficiario}
                          onChange={(e) => setFormData({ ...formData, pixBeneficiario: e.target.value })}
                          placeholder="Nome da Loja / Titular"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Valor Pré-definido (Opcional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.pixValor || ''}
                          onChange={(e) => setFormData({ ...formData, pixValor: parseFloat(e.target.value) || 0 })}
                          placeholder="Ex: 0 para valor livre"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form Instagram */}
                {formData.modInstagram && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                    <label className="font-bold text-pink-400 block mb-1">Usuário do Instagram (@)</label>
                    <input
                      type="text"
                      value={formData.instaUsuario}
                      onChange={(e) => setFormData({ ...formData, instaUsuario: e.target.value })}
                      placeholder="Ex: meganaturalhair (sem @)"
                      className="w-full sm:w-72 bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                )}

                {/* Sub-form Wi-Fi */}
                {formData.modWifi && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-xs">
                    <span className="font-bold text-blue-400">Dados do Wi-Fi para Clientes:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Nome da Rede (SSID)</label>
                        <input
                          type="text"
                          value={formData.wifiSsid}
                          onChange={(e) => setFormData({ ...formData, wifiSsid: e.target.value })}
                          placeholder="Ex: Loja_Clientes"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Senha do Wi-Fi</label>
                        <input
                          type="text"
                          value={formData.wifiSenha}
                          onChange={(e) => setFormData({ ...formData, wifiSenha: e.target.value })}
                          placeholder="Senha da rede"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setAddModalTab('modelo')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    &larr; Voltar para Modelo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddModalTab('venda')}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-600/30"
                  >
                    <span>Avançar para Venda &amp; Destino</span>
                    <span>&rarr;</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: VENDA & DESTINO QR */}
            {addModalTab === 'venda' && (
              <div className="space-y-4">
                {/* Selected model summary badge */}
                {(() => {
                  const selInfo = getTipoPlaquinhaInfo(formData.tipoPlaquinha);
                  return (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Modelo Escolhido</span>
                          <span className="text-sm font-bold text-white">{selInfo.nome}</span>
                          <span className="text-xs text-slate-400 ml-2 font-mono">({selInfo.dimensoes})</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <button
                          type="button"
                          onClick={() => setAddModalTab('modelo')}
                          className="text-[11px] text-blue-400 hover:underline font-semibold block cursor-pointer"
                        >
                          Trocar modelo &rarr;
                        </button>
                        <span className="text-sm font-bold font-mono text-emerald-400">
                          R$ {formData.valorCobrado.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Status Inicial da Venda</label>
                    <select
                      value={formData.statusVenda}
                      onChange={(e) => setFormData({ ...formData, statusVenda: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="visitado">Visitado (Primeiro Contato)</option>
                      <option value="negociando">Em Negociação</option>
                      <option value="pago">Pago (Aguardando Produção)</option>
                      <option value="instalado">Instalado / Entregue</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Destino Inicial do QR Code</label>
                    <select
                      value={formData.modoDestino}
                      onChange={(e) => setFormData({ ...formData, modoDestino: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                    >
                      <option value="google_review">⭐ Google 5 Estrelas (Direto)</option>
                      <option value="hub">📱 Hub de Links da Loja</option>
                      <option value="whatsapp">💬 WhatsApp Direto</option>
                      <option value="instagram">📸 Instagram Direto</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Valor Cobrado (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valorCobrado}
                      onChange={(e) => setFormData({ ...formData, valorCobrado: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-blue-950/20 border border-blue-800/30 rounded-2xl text-xs text-blue-300 flex items-start space-x-2">
                  <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    O link dinâmico permanente <strong>/r/{nextId}</strong> é gerado automaticamente. Você pode alternar o destino a qualquer momento com apenas 1 clique direto no painel!
                  </span>
                </div>

                <div className="pt-3 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setAddModalTab('modulos')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    &larr; Voltar para Módulos
                  </button>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer flex items-center space-x-2"
              >
                <span>Salvar Plaquinha #{nextId}</span>
              </button>
            </div>

          </form>

          </div>
        </div>
      )}

      {/* NFC Writer Modal */}
      {selectedPlaquinhaNfc && (
        <NfcWriterModal
          plaquinha={selectedPlaquinhaNfc}
          onClose={() => setSelectedPlaquinhaNfc(null)}
          onSuccess={() => {
            fetchPlaquinhas();
          }}
        />
      )}

      {/* Plaquinha Physical Print / QR Modal */}
      {selectedPlaquinhaPrint && (
        <PlaquinhaCardModal
          plaquinha={selectedPlaquinhaPrint}
          onClose={() => setSelectedPlaquinhaPrint(null)}
          onUpdatePlaquinha={fetchPlaquinhas}
        />
      )}

      {/* Dynamic Destino Modal */}
      {selectedPlaquinhaDestino && (
        <DynamicDestinoModal
          plaquinha={selectedPlaquinhaDestino}
          onClose={() => setSelectedPlaquinhaDestino(null)}
          onUpdated={fetchPlaquinhas}
        />
      )}

      {/* Batch Stock Modal */}
      {showBatchStockModal && (
        <BatchStockModal
          nextId={nextId}
          onClose={() => setShowBatchStockModal(false)}
          onCreated={fetchPlaquinhas}
        />
      )}

      {/* Activate Stock Plaquinha Modal */}
      {selectedPlaquinhaActivate && (
        <ActivateStockPlaquinhaModal
          plaquinha={selectedPlaquinhaActivate}
          onClose={() => setSelectedPlaquinhaActivate(null)}
          onActivated={fetchPlaquinhas}
        />
      )}

      {/* Edit Plaquinha Modal */}
      {selectedPlaquinhaEdit && (
        <EditPlaquinhaModal
          plaquinha={selectedPlaquinhaEdit}
          onClose={() => setSelectedPlaquinhaEdit(null)}
          onSaved={fetchPlaquinhas}
        />
      )}

      {/* Delete Confirmation Modal */}
      {plaquinhaToDelete && (
        <DeleteConfirmModal
          plaquinha={plaquinhaToDelete}
          onClose={() => setPlaquinhaToDelete(null)}
          onDeleted={fetchPlaquinhas}
        />
      )}

      {/* Domain & Production Settings Modal */}
      <DomainSettingsModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        onSaved={fetchPlaquinhas}
      />

    </div>
  );
};
