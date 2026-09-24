import React, { useState } from 'react';
import { 
  X, Save, Building2, User, Phone, Mail, MapPin, 
  DollarSign, Check, Sparkles, Star, Radio, MessageSquare, 
  Instagram, Wifi, Globe, QrCode, Search, Palette, Layers, Box
} from 'lucide-react';
import { PlaquinhaRecord, TipoPlaquinhaId, getTipoPlaquinhaInfo } from '../types';
import { TipoPlaquinhaSelector } from './TipoPlaquinhaSelector';

interface EditPlaquinhaModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onSaved: () => void;
}

export const EditPlaquinhaModal: React.FC<EditPlaquinhaModalProps> = ({
  plaquinha,
  onClose,
  onSaved,
}) => {
  // Tab state inside modal for clean organization
  const [activeTab, setActiveTab] = useState<'cliente' | 'modelo' | 'modulos' | 'venda' | 'design'>('cliente');

  // 1. Dados do Cliente
  const [empresa, setEmpresa] = useState(plaquinha.empresa || '');
  const [responsavel, setResponsavel] = useState(plaquinha.responsavel || '');
  const [telefone, setTelefone] = useState(plaquinha.telefone || '');
  const [email, setEmail] = useState(plaquinha.email || '');
  const [cidade, setCidade] = useState(plaquinha.cidade || '');
  const [estado, setEstado] = useState(plaquinha.estado || 'SP');
  const [endereco, setEndereco] = useState(plaquinha.endereco || '');

  // 2. Dados da Venda e Plaquinha
  const [statusVenda, setStatusVenda] = useState<PlaquinhaRecord['statusVenda']>(
    plaquinha.statusVenda || 'visitado'
  );
  const [tipoPlaquinha, setTipoPlaquinha] = useState<TipoPlaquinhaId>(
    plaquinha.tipoPlaquinha || 'placa_10x15_base_virada'
  );
  const [valorCobrado, setValorCobrado] = useState<number>(plaquinha.valorCobrado || 149.90);
  const [modoDestino, setModoDestino] = useState<PlaquinhaRecord['modoDestino']>(
    plaquinha.modoDestino || 'google_review'
  );

  // 3. Google Meu Negócio
  const [googlePlaceId, setGooglePlaceId] = useState(plaquinha.googlePlaceId || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(plaquinha.googleReviewUrl || '');
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  const [searchingPlace, setSearchingPlace] = useState(false);
  const [placeResults, setPlaceResults] = useState<any[]>([]);

  // 4. Módulos Ativos
  const [modGoogleReview, setModGoogleReview] = useState(plaquinha.modulosAtivos?.googleReview ?? true);
  const [modPix, setModPix] = useState(plaquinha.modulosAtivos?.pix ?? false);
  const [modWhatsapp, setModWhatsapp] = useState(plaquinha.modulosAtivos?.whatsapp ?? false);
  const [modInstagram, setModInstagram] = useState(plaquinha.modulosAtivos?.instagram ?? false);
  const [modWifi, setModWifi] = useState(plaquinha.modulosAtivos?.wifi ?? false);
  const [modCustomUrl, setModCustomUrl] = useState(plaquinha.modulosAtivos?.customUrl ?? false);

  // 5. Dados dos Módulos
  // PIX
  const [pixChave, setPixChave] = useState(plaquinha.dadosModulos?.pix?.chave || '');
  const [pixTipo, setPixTipo] = useState<'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria'>(
    plaquinha.dadosModulos?.pix?.tipo || 'telefone'
  );
  const [pixBeneficiario, setPixBeneficiario] = useState(
    plaquinha.dadosModulos?.pix?.beneficiario || plaquinha.empresa || ''
  );
  const [pixCidade, setPixCidade] = useState(
    plaquinha.dadosModulos?.pix?.cidade || plaquinha.cidade || 'SAO PAULO'
  );
  const [pixValor, setPixValor] = useState<number | undefined>(
    plaquinha.dadosModulos?.pix?.valor
  );

  // WhatsApp
  const [waNumero, setWaNumero] = useState(
    plaquinha.dadosModulos?.whatsapp?.numero || plaquinha.telefone || ''
  );
  const [waMensagem, setWaMensagem] = useState(
    plaquinha.dadosModulos?.whatsapp?.mensagem || 'Olá! Vim pela plaquinha do balcão.'
  );

  // Instagram
  const [instaUsuario, setInstaUsuario] = useState(
    plaquinha.dadosModulos?.instagram?.usuario || ''
  );

  // Wi-Fi
  const [wifiSsid, setWifiSsid] = useState(plaquinha.dadosModulos?.wifi?.ssid || '');
  const [wifiSenha, setWifiSenha] = useState(plaquinha.dadosModulos?.wifi?.senha || '');
  const [wifiSeguranca, setWifiSeguranca] = useState<'WPA' | 'WEP' | 'nopass'>(
    plaquinha.dadosModulos?.wifi?.seguranca || 'WPA'
  );

  // Custom URL
  const [customTitulo, setCustomTitulo] = useState(
    plaquinha.dadosModulos?.customUrl?.titulo || 'Cardápio / Catálogo'
  );
  const [customUrl, setCustomUrl] = useState(
    plaquinha.dadosModulos?.customUrl?.url || ''
  );

  // 6. Design QR
  const [corFrente, setCorFrente] = useState(plaquinha.designQr?.corFrente || '#0f172a');
  const [corFundo, setCorFundo] = useState(plaquinha.designQr?.corFundo || '#ffffff');
  const [logoCentro, setLogoCentro] = useState(plaquinha.designQr?.logoCentro || 'google');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Search Place on Google
  const handleSearchGoogle = async () => {
    if (!searchPlaceQuery.trim()) return;
    setSearchingPlace(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchPlaceQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setPlaceResults(data.places || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingPlace(false);
    }
  };

  const selectPlace = (p: any) => {
    if (!empresa || empresa === 'Disponível em Estoque') setEmpresa(p.name);
    if (!endereco) setEndereco(p.address || '');
    setGooglePlaceId(p.id);
    setGoogleReviewUrl(
      p.links?.directReviewUrl || `https://search.google.com/local/writereview?placeid=${p.id}`
    );
    if (p.phone && !telefone) setTelefone(p.phone);
    setPlaceResults([]);
    setSearchPlaceQuery('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa.trim()) {
      alert('Nome da empresa é obrigatório.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        empresa,
        responsavel,
        telefone,
        email,
        cidade,
        estado,
        endereco,
        statusVenda,
        tipoPlaquinha,
        valorCobrado: Number(valorCobrado),
        modoDestino,
        googlePlaceId,
        googleReviewUrl,
        modulosAtivos: {
          googleReview: modGoogleReview,
          pix: modPix,
          whatsapp: modWhatsapp,
          instagram: modInstagram,
          wifi: modWifi,
          vcard: false,
          customUrl: modCustomUrl,
        },
        dadosModulos: {
          ...(modPix && pixChave ? {
            pix: {
              chave: pixChave,
              tipo: pixTipo,
              beneficiario: pixBeneficiario || empresa,
              cidade: pixCidade || cidade || 'SAO PAULO',
              valor: pixValor ? Number(pixValor) : undefined,
            }
          } : {}),
          ...(modWhatsapp && waNumero ? {
            whatsapp: {
              numero: waNumero.replace(/\D/g, ''),
              mensagem: waMensagem,
            }
          } : {}),
          ...(modInstagram && instaUsuario ? {
            instagram: {
              usuario: instaUsuario.replace('@', '').trim(),
              url: `https://instagram.com/${instaUsuario.replace('@', '').trim()}`,
            }
          } : {}),
          ...(modWifi && wifiSsid ? {
            wifi: {
              ssid: wifiSsid,
              senha: wifiSenha,
              seguranca: wifiSeguranca,
            }
          } : {}),
          ...(modCustomUrl && customUrl ? {
            customUrl: {
              titulo: customTitulo,
              url: customUrl,
            }
          } : {}),
        },
        designQr: {
          corFrente,
          corFundo,
          logoCentro,
        },
      };

      const res = await fetch(`/api/plaquinhas/${plaquinha.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar plaquinha');
      }

      setSuccess(true);
      onSaved();
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Plaquinha #{plaquinha.id} &bull; {plaquinha.codigo}
              </span>
              <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>Edição Completa</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Editar Dados do Cliente &amp; Configurações da Plaquinha
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Altere qualquer informação cadastral, módulos, chaves PIX, Wi-Fi ou redes sociais.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 sm:px-6 overflow-x-auto gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('cliente')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'cliente'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Cliente &amp; Empresa</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modelo')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'modelo'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>2. Tipo de Placa &amp; Preço</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('modulos')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'modulos'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Módulos (PIX, Whats, Insta, Wi-Fi)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('venda')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'venda'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>4. Venda &amp; Destino QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center space-x-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'design'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>5. Cores &amp; Visual</span>
          </button>
        </div>

        {/* Banner de Garantia do QR Code Dinâmico Gravado */}
        <div className="mx-5 sm:mx-6 mt-3 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-700 flex-shrink-0 flex items-center justify-center">
              {plaquinha.mainQrDataUrl ? (
                <img src={plaquinha.mainQrDataUrl} alt="QR Gravado" className="w-10 h-10 object-contain" />
              ) : (
                <QrCode className="w-7 h-7 text-slate-800" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs">QR Code Gravado no Acrílico (Fixo)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  /r/{plaquinha.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                🛡️ <strong>O desenho físico deste QR Code gravado é permanente e NUNCA muda</strong>. Ao editar qualquer link ou dado do cliente, o sistema altera apenas para onde o QR Code redireciona na internet!
              </p>
            </div>
          </div>
          <a
            href={`/r/${plaquinha.id}`}
            target="_blank"
            rel="noreferrer"
            className="ml-3 hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold whitespace-nowrap"
            title="Testar leitura online do QR Code desta plaquinha"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Leitura</span>
          </a>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: CLIENTE & EMPRESA */}
          {activeTab === 'cliente' && (
            <div className="space-y-4">
              
              {/* Google Search Auto-fill */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-blue-400 flex items-center space-x-1.5">
                  <Search className="w-3.5 h-3.5" />
                  <span>Atualizar via Google Meu Negócio (opcional):</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchPlaceQuery}
                    onChange={(e) => setSearchPlaceQuery(e.target.value)}
                    placeholder="Digite o nome da empresa para buscar dados novos..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchGoogle();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchGoogle}
                    disabled={searchingPlace}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
                  >
                    {searchingPlace ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>

                {placeResults.length > 0 && (
                  <div className="mt-2 space-y-1 bg-slate-900 p-2 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                    {placeResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => selectPlace(p)}
                        className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-white">{p.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-sm">{p.address}</p>
                        </div>
                        <span className="text-[10px] text-blue-400 font-semibold">Usar Estes Dados &rarr;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa / Comércio *</label>
                  <input
                    type="text"
                    required
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Nome do Responsável / Proprietário *</label>
                  <input
                    type="text"
                    required
                    value={responsavel}
                    onChange={(e) => setResponsavel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: São Paulo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="SP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-semibold block mb-1">Endereço Completo</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Número, Bairro"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Google Review Direct Link */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-300 flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Link Direto de Avaliação Google 5 Estrelas:</span>
                  </span>
                  {googlePlaceId && (
                    <span className="text-[10px] text-slate-400 font-mono">Place ID: {googlePlaceId}</span>
                  )}
                </div>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-amber-300 font-mono text-xs"
                />
              </div>

            </div>
          )}

          {/* TAB 2: MODELO DA PLAQUINHA & VALOR */}
          {activeTab === 'modelo' && (
            <div className="space-y-4">
              <TipoPlaquinhaSelector
                selectedTipo={tipoPlaquinha}
                valorCobrado={valorCobrado}
                onSelectTipo={(novoTipo, preco) => {
                  setTipoPlaquinha(novoTipo);
                  setValorCobrado(preco);
                }}
                onChangeValorCobrado={(novoValor) => setValorCobrado(novoValor)}
              />
            </div>
          )}

          {/* TAB 3: MÓDULOS E SERVIÇOS ATIVOS */}
          {activeTab === 'modulos' && (
            <div className="space-y-5 text-xs">
              
              {/* PIX Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modPix}
                      onChange={(e) => setModPix(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">💳 Módulo de Pagamento PIX Instantâneo</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Gera QR Code Copia e Cola automático</span>
                </div>

                {modPix && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-850">
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Tipo de Chave</label>
                      <select
                        value={pixTipo}
                        onChange={(e) => setPixTipo(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      >
                        <option value="telefone">Celular / Telefone</option>
                        <option value="cpf">CPF</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="email">E-mail</option>
                        <option value="aleatoria">Chave Aleatória (EVP)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-slate-400 font-medium block mb-1">Chave PIX</label>
                      <input
                        type="text"
                        value={pixChave}
                        onChange={(e) => setPixChave(e.target.value)}
                        placeholder="Ex: 11987654321 ou loja@email.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Nome do Beneficiário</label>
                      <input
                        type="text"
                        value={pixBeneficiario}
                        onChange={(e) => setPixBeneficiario(e.target.value)}
                        placeholder={empresa || "Nome Completo ou Razão"}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Cidade do Titular</label>
                      <input
                        type="text"
                        value={pixCidade}
                        onChange={(e) => setPixCidade(e.target.value)}
                        placeholder={cidade || "SAO PAULO"}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Valor Fixo Sugerido (opcional)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={pixValor || ''}
                        onChange={(e) => setPixValor(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Em branco = cliente digita"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modWhatsapp}
                      onChange={(e) => setModWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">💬 Módulo WhatsApp Oficial</span>
                  </label>
                </div>

                {modWhatsapp && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Número com DDD</label>
                      <input
                        type="text"
                        value={waNumero}
                        onChange={(e) => setWaNumero(e.target.value)}
                        placeholder="Ex: 5511987654321"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Mensagem Padrão Inicial</label>
                      <input
                        type="text"
                        value={waMensagem}
                        onChange={(e) => setWaMensagem(e.target.value)}
                        placeholder="Ex: Olá! Vim pela plaquinha do balcão."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modInstagram}
                      onChange={(e) => setModInstagram(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">📸 Módulo Instagram</span>
                  </label>
                </div>

                {modInstagram && (
                  <div className="pt-2 border-t border-slate-850">
                    <label className="text-slate-400 font-medium block mb-1">Usuário do Instagram (@)</label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 bg-slate-900 border border-r-0 border-slate-700 rounded-l-xl text-slate-500 font-mono">
                        @
                      </span>
                      <input
                        type="text"
                        value={instaUsuario.replace('@', '')}
                        onChange={(e) => setInstaUsuario(e.target.value)}
                        placeholder="nomedaloja"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-r-xl p-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Wi-Fi Configuration */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modWifi}
                      onChange={(e) => setModWifi(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">📶 Módulo Wi-Fi para Clientes</span>
                  </label>
                </div>

                {modWifi && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-850">
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Nome da Rede (SSID)</label>
                      <input
                        type="text"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                        placeholder="Ex: Wi-Fi Clientes"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Senha da Rede</label>
                      <input
                        type="text"
                        value={wifiSenha}
                        onChange={(e) => setWifiSenha(e.target.value)}
                        placeholder="Senha do Wi-Fi"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Segurança</label>
                      <select
                        value={wifiSeguranca}
                        onChange={(e) => setWifiSeguranca(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Padrão)</option>
                        <option value="WEP">WEP (Antiga)</option>
                        <option value="nopass">Aberta (Sem Senha)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Custom URL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modCustomUrl}
                      onChange={(e) => setModCustomUrl(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                    />
                    <span className="font-bold text-white text-sm">🌐 Link Personalizado / Cardápio Digital</span>
                  </label>
                </div>

                {modCustomUrl && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-850">
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">Título do Link</label>
                      <input
                        type="text"
                        value={customTitulo}
                        onChange={(e) => setCustomTitulo(e.target.value)}
                        placeholder="Ex: Cardápio Digital / Catálogo"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-medium block mb-1">URL Completa</label>
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://meucardapio.com.br"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: VENDA & DESTINO QR */}
          {activeTab === 'venda' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Status da Venda</label>
                  <select
                    value={statusVenda}
                    onChange={(e) => setStatusVenda(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="disponivel">📦 Disponível em Estoque</option>
                    <option value="visitado">Visitado (Primeiro Contato)</option>
                    <option value="negociando">Negociando Proposta</option>
                    <option value="pago">Pago (Aguardando Entrega)</option>
                    <option value="instalado">Instalado no Balcão ✓</option>
                    <option value="entregue">Entregue ao Cliente</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold block">Tipo de Placa / Modelo</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('modelo')}
                      className="text-[10px] text-blue-400 hover:underline font-bold"
                    >
                      Ver Catálogo Visual &rarr;
                    </button>
                  </div>
                  <select
                    value={tipoPlaquinha}
                    onChange={(e) => {
                      const newId = e.target.value as any;
                      setTipoPlaquinha(newId);
                      const info = getTipoPlaquinhaInfo(newId);
                      if (info) setValorCobrado(info.precoSugerido);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="placa_10x15_madeira">⭐ Plaquinha 10x15 com Base de Madeira (R$ 189,90)</option>
                    <option value="placa_10x15_base_virada">📐 Plaquinha 10x15 Base Virada (R$ 149,90)</option>
                    <option value="placa_10x10_cola">🪟 Plaquinha 10x10 com Cola (R$ 99,90)</option>
                    <option value="cartao_vcard">💳 Cartão vCard / Cartão de Visita (R$ 79,90)</option>
                    <option value="tags_5x5_pequenas">🏷️ Tags 5x5 Pequenas (R$ 49,90)</option>
                    <option value="tags_redondas">🔘 Tags Redondas (R$ 39,90)</option>
                    <option value="acrilico">Acrílico Cristal com Base</option>
                    <option value="madeira">Base de Madeira Nobre</option>
                    <option value="pvc">PVC Expandido com Adesivo</option>
                    <option value="metal">Aço Escovado / Metal</option>
                    <option value="adesivo">Adesivo Vinil Impermeável</option>
                    <option value="chaveiro">Chaveiro Inteligente NFC</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorCobrado}
                    onChange={(e) => setValorCobrado(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Dynamic Mode Selector */}
              <div className="pt-3">
                <label className="text-slate-300 font-semibold block mb-2">
                  Destino do QR Code Dinâmico Permanente (/r/{plaquinha.id}):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setModoDestino('google_review')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      modoDestino === 'google_review'
                        ? 'bg-amber-500/15 border-amber-500/50 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Google 5 Estrelas (Direto)</span>
                  </div>

                  <div
                    onClick={() => setModoDestino('hub')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      modoDestino === 'hub'
                        ? 'bg-indigo-500/15 border-indigo-500/50 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Radio className="w-4 h-4 text-indigo-400" />
                    <span>Hub Multi-Ações (Google + Pix + Whats)</span>
                  </div>

                  <div
                    onClick={() => setModoDestino('whatsapp')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      modoDestino === 'whatsapp'
                        ? 'bg-green-500/15 border-green-500/50 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4 text-green-400" />
                    <span>Conversa Direta no WhatsApp</span>
                  </div>

                  <div
                    onClick={() => setModoDestino('instagram')}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center space-x-2.5 ${
                      modoDestino === 'instagram'
                        ? 'bg-pink-500/15 border-pink-500/50 text-white font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>Perfil Oficial do Instagram</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CORES E DESIGN DO QR CODE */}
          {activeTab === 'design' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <span className="font-semibold text-white block">Aparência do QR Code Impresso</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-slate-400 block mb-1">Cor do QR Code (Frente)</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={corFrente}
                        onChange={(e) => setCorFrente(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={corFrente}
                        onChange={(e) => setCorFrente(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Cor de Fundo</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={corFundo}
                        onChange={(e) => setCorFundo(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={corFundo}
                        onChange={(e) => setCorFundo(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Ícone Central do QR</label>
                    <select
                      value={logoCentro}
                      onChange={(e) => setLogoCentro(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white"
                    >
                      <option value="google">Logo Google Meu Negócio</option>
                      <option value="star">Estrela Dourada 5★</option>
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="pix">PIX</option>
                      <option value="wifi">Wi-Fi</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Todas as informações da plaquinha #{plaquinha.id} foram salvas com sucesso!</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
            <span className="text-slate-500 text-[11px]">
              ID Sequencial: <strong className="text-slate-400">PLQ-{plaquinha.id}</strong> (permanente)
            </span>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando Alterações...' : 'Salvar Todas as Informações'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
