import React, { useState } from 'react';
import { 
  X, Zap, Star, MessageSquare, Instagram, Globe, 
  ExternalLink, Check, Sparkles, Radio, HelpCircle 
} from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface DynamicDestinoModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onUpdated: () => void;
}

export const DynamicDestinoModal: React.FC<DynamicDestinoModalProps> = ({
  plaquinha,
  onClose,
  onUpdated,
}) => {
  const [modo, setModo] = useState<PlaquinhaRecord['modoDestino']>(
    plaquinha.modoDestino || 'google_review'
  );
  const [googleReviewUrl, setGoogleReviewUrl] = useState(
    plaquinha.googleReviewUrl || ''
  );
  const [waNumero, setWaNumero] = useState(
    plaquinha.dadosModulos?.whatsapp?.numero || plaquinha.telefone || ''
  );
  const [waMensagem, setWaMensagem] = useState(
    plaquinha.dadosModulos?.whatsapp?.mensagem || 'Olá! Vim pela plaquinha do balcão.'
  );
  const [instaUsuario, setInstaUsuario] = useState(
    plaquinha.dadosModulos?.instagram?.usuario || ''
  );
  const [customUrl, setCustomUrl] = useState(
    plaquinha.dadosModulos?.customUrl?.url || ''
  );
  const [customTitulo, setCustomTitulo] = useState(
    plaquinha.dadosModulos?.customUrl?.titulo || 'Cardápio / Catálogo Online'
  );
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const origin = window.location.origin;
  const dynamicUrl = plaquinha.dynamicRedirectUrl || `${origin}/r/${plaquinha.id}`;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    const payload: any = {
      modoDestino: modo,
    };

    if (modo === 'google_review') {
      payload.googleReviewUrl = googleReviewUrl;
    } else if (modo === 'whatsapp') {
      payload.whatsapp = {
        numero: waNumero,
        mensagem: waMensagem,
      };
    } else if (modo === 'instagram') {
      payload.instagram = {
        usuario: instaUsuario.replace('@', '').trim(),
        url: `https://instagram.com/${instaUsuario.replace('@', '').trim()}`,
      };
    } else if (modo === 'custom_url') {
      payload.customUrl = {
        titulo: customTitulo,
        url: customUrl,
      };
    }

    try {
      const res = await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar destino');
      }

      setSuccessMsg('Destino do QR Code atualizado com sucesso!');
      onUpdated();
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar destino');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Plaquinha #{plaquinha.id}
              </span>
              <span className="text-xs text-indigo-400 font-semibold flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>QR Code Dinâmico</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Modificar Destino do QR Code
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empresa: <strong className="text-slate-200">{plaquinha.empresa}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Callout */}
        <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 flex items-center space-x-3.5 text-xs text-indigo-200">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-md">
            {plaquinha.mainQrDataUrl ? (
              <img src={plaquinha.mainQrDataUrl} alt="QR Físico" className="w-10 h-10 object-contain" />
            ) : (
              <Sparkles className="w-6 h-6 text-indigo-600" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-bold text-white text-xs">Desenho do QR Code Gravado Fixo</p>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                /r/{plaquinha.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              O desenho deste QR Code impresso na plaquinha física <strong>permanece 100% o mesmo</strong>. Ao escolher um novo destino abaixo, apenas o redirecionamento online é alterado.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Options Grid */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              Escolha para onde o QR Code deve redirecionar agora:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Google Reviews (Direct) */}
              <div
                onClick={() => setModo('google_review')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  modo === 'google_review'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${modo === 'google_review' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-400'}`}>
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Google 5 Estrelas (Direto)</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Abre direto a tela de 5 estrelas do Google Meu Negócio no celular do cliente.
                  </p>
                </div>
              </div>

              {/* Option 2: Hub Interativo da Loja */}
              <div
                onClick={() => setModo('hub')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  modo === 'hub'
                    ? 'bg-indigo-500/15 border-indigo-500/50 text-white shadow-md shadow-indigo-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${modo === 'hub' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-indigo-400'}`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Hub Completo da Loja</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Página mobile com botões de Avaliar Google + Pagar com Pix + WhatsApp + Instagram.
                  </p>
                </div>
              </div>

              {/* Option 3: WhatsApp Direct */}
              <div
                onClick={() => setModo('whatsapp')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  modo === 'whatsapp'
                    ? 'bg-green-500/15 border-green-500/50 text-white shadow-md shadow-green-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${modo === 'whatsapp' ? 'bg-green-500 text-white' : 'bg-slate-800 text-green-400'}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">WhatsApp da Empresa</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Abre a conversa do WhatsApp com mensagem pronta configurada.
                  </p>
                </div>
              </div>

              {/* Option 4: Instagram Direct */}
              <div
                onClick={() => setModo('instagram')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  modo === 'instagram'
                    ? 'bg-pink-500/15 border-pink-500/50 text-white shadow-md shadow-pink-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${modo === 'instagram' ? 'bg-pink-500 text-white' : 'bg-slate-800 text-pink-400'}`}>
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instagram Oficial</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Redireciona diretamente para o perfil do Instagram da empresa.
                  </p>
                </div>
              </div>

              {/* Option 5: Custom URL / Cardápio / Site */}
              <div
                onClick={() => setModo('custom_url')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 sm:col-span-2 ${
                  modo === 'custom_url'
                    ? 'bg-blue-500/15 border-blue-500/50 text-white shadow-md shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-xl ${modo === 'custom_url' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-blue-400'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Link Personalizado / Cardápio Digital / Site</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Redireciona para qualquer link externo (cardápio, catálogo, Linktree, agendamento).
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Conditional inputs based on selected mode */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            {modo === 'google_review' && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Link Direto de Avaliação Google (5 Estrelas)
                </label>
                <input
                  type="url"
                  required
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  💡 Gerado automaticamente pelo sistema através do Place ID da empresa.
                </p>
              </div>
            )}

            {modo === 'whatsapp' && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Número do WhatsApp com DDD</label>
                  <input
                    type="text"
                    required
                    value={waNumero}
                    onChange={(e) => setWaNumero(e.target.value)}
                    placeholder="Ex: (11) 98765-4321 ou 5511987654321"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Mensagem Inicial Pré-definida</label>
                  <input
                    type="text"
                    value={waMensagem}
                    onChange={(e) => setWaMensagem(e.target.value)}
                    placeholder="Ex: Olá! Vim pela plaquinha do balcão."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {modo === 'instagram' && (
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Nome de Usuário (@)</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-900 border border-r-0 border-slate-700 rounded-l-xl text-slate-500 font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={instaUsuario.replace('@', '')}
                    onChange={(e) => setInstaUsuario(e.target.value)}
                    placeholder="nomedaloja"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-r-xl px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            )}

            {modo === 'custom_url' && (
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Título do Link</label>
                  <input
                    type="text"
                    value={customTitulo}
                    onChange={(e) => setCustomTitulo(e.target.value)}
                    placeholder="Ex: Nosso Cardápio Digital"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">URL Completa de Destino</label>
                  <input
                    type="url"
                    required
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://exemplo.com.br/cardapio"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {modo === 'hub' && (
              <p className="text-xs text-slate-400">
                Ao selecionar o Hub Completo, quem escanear o QR Code ou aproximar o chip NFC verá uma página mobile premium com todas as opções ativadas para este cliente.
              </p>
            )}
          </div>

          {/* Test Link and Status */}
          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href={dynamicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center space-x-1.5 underline cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Testar Redirecionamento Dinâmico (/r/{plaquinha.id})</span>
            </a>

            {successMsg && (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </span>
            )}
          </div>

          {/* Footer Action Buttons */}
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
              <span>{saving ? 'Atualizando...' : 'Salvar Novo Destino do QR'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
