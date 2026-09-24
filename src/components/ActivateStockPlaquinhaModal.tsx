import React, { useState } from 'react';
import { 
  X, Zap, Search, Building2, User, Phone, MapPin, 
  Check, Sparkles, Star, Radio, MessageSquare, Instagram, Globe 
} from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface ActivateStockPlaquinhaModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onActivated: () => void;
}

export const ActivateStockPlaquinhaModal: React.FC<ActivateStockPlaquinhaModalProps> = ({
  plaquinha,
  onClose,
  onActivated,
}) => {
  const [empresa, setEmpresa] = useState(
    plaquinha.statusVenda === 'disponivel' ? '' : plaquinha.empresa
  );
  const [responsavel, setResponsavel] = useState(
    plaquinha.statusVenda === 'disponivel' ? '' : plaquinha.responsavel
  );
  const [telefone, setTelefone] = useState(plaquinha.telefone || '');
  const [cidade, setCidade] = useState(plaquinha.cidade || '');
  const [estado, setEstado] = useState(plaquinha.estado || 'SP');
  const [endereco, setEndereco] = useState(plaquinha.endereco || '');
  const [googlePlaceId, setGooglePlaceId] = useState(plaquinha.googlePlaceId || '');
  const [googleReviewUrl, setGoogleReviewUrl] = useState(plaquinha.googleReviewUrl || '');
  const [modoDestino, setModoDestino] = useState<PlaquinhaRecord['modoDestino']>(
    plaquinha.modoDestino || 'google_review'
  );
  const [valorCobrado, setValorCobrado] = useState<number>(plaquinha.valorCobrado || 149.90);

  // Search in Google Meu Negócio directly inside modal
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSearchGoogle = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.places || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const selectPlace = (p: any) => {
    setEmpresa(p.name || empresa);
    setEndereco(p.address || endereco);
    setGooglePlaceId(p.id);
    setGoogleReviewUrl(
      p.links?.directReviewUrl || `https://search.google.com/local/writereview?placeid=${p.id}`
    );
    if (p.phone) setTelefone(p.phone);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa || !responsavel) {
      alert('Nome da empresa e responsável são obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        empresa,
        responsavel,
        telefone,
        cidade,
        estado,
        endereco,
        statusVenda: 'instalado',
        modoDestino,
        valorCobrado: Number(valorCobrado),
        googlePlaceId,
        googleReviewUrl,
        modulosAtivos: {
          googleReview: Boolean(googleReviewUrl || googlePlaceId || modoDestino === 'google_review'),
          pix: true,
          whatsapp: Boolean(telefone),
          instagram: false,
          wifi: false,
          vcard: false,
          customUrl: false,
        },
      };

      if (telefone) {
        payload.dadosModulos = {
          whatsapp: {
            numero: telefone,
            mensagem: 'Olá! Vim pela plaquinha do balcão.',
          },
        };
      }

      const res = await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao ativar plaquinha');
      }

      setSuccess(true);
      onActivated();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Erro ao ativar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Ativação Imediata &bull; Plaquinha #{plaquinha.id}
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Ativar Plaquinha para Cliente na Hora da Venda
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Vincule o comércio do cliente à plaquinha física #{plaquinha.id} em segundos.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleActivate} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Dynamic QR Permanence Guarantee */}
          <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center space-x-3 text-xs text-slate-300">
            <div className="w-11 h-11 bg-white p-0.5 rounded-lg border border-slate-700 flex-shrink-0 flex items-center justify-center">
              {plaquinha.mainQrDataUrl ? (
                <img src={plaquinha.mainQrDataUrl} alt="QR Gravado" className="w-9 h-9 object-contain" />
              ) : (
                <Zap className="w-5 h-5 text-indigo-600" />
              )}
            </div>
            <div>
              <p className="font-bold text-white text-xs">Plaquinha Pré-Fabricada #{plaquinha.id}</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Esta peça física já possui o QR Code dinâmico gravado (<code className="text-amber-300 font-mono">/r/{plaquinha.id}</code>). Ao ativar para este cliente, o <strong>desenho gravado na plaquinha permanece idêntico</strong> — apenas o destino online é configurado!
              </p>
            </div>
          </div>

          {/* Quick Google Search */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-blue-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buscar Estabelecimento no Google Meu Negócio (Preenchimento Automático):</span>
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex: Bar do Zé, Salão Belas Unhas..."
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
                disabled={searching}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
              >
                {searching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1 bg-slate-900 p-2 rounded-xl border border-slate-800 max-h-40 overflow-y-auto">
                {searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPlace(p)}
                    className="p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-xs flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{p.address}</p>
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold">Usar Este &rarr;</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome da Empresa / Loja *</label>
                <input
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ex: Salão Beleza Pura"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
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
                <label className="text-slate-300 font-semibold block mb-1">Valor da Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorCobrado}
                  onChange={(e) => setValorCobrado(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Destination Mode Choice */}
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Destino do QR Code Dinâmico
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div
                  onClick={() => setModoDestino('google_review')}
                  className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center space-x-2.5 ${
                    modoDestino === 'google_review'
                      ? 'bg-amber-500/15 border-amber-500/50 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <span>Direto Google 5 Estrelas (Recomendado)</span>
                </div>

                <div
                  onClick={() => setModoDestino('hub')}
                  className={`p-3 rounded-xl border cursor-pointer text-xs flex items-center space-x-2.5 ${
                    modoDestino === 'hub'
                      ? 'bg-indigo-500/15 border-indigo-500/50 text-white font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <Radio className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Hub Multi-Ações (Google + Pix + Whats)</span>
                </div>
              </div>
            </div>

            {googleReviewUrl && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Link de Avaliação Vinculado:</span>
                <p className="font-mono text-[11px] text-amber-300 break-all">{googleReviewUrl}</p>
              </div>
            )}
          </div>

          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2">
              <Check className="w-4 h-4" />
              <span>Plaquinha #{plaquinha.id} ativada com sucesso! O QR Code já está funcionando.</span>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
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
              <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>{saving ? 'Ativando...' : `Concluir Venda & Ativar #${plaquinha.id}`}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
