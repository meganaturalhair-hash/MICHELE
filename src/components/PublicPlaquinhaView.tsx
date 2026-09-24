import React, { useState, useEffect } from 'react';
import { 
  Star, CreditCard, MessageSquare, Instagram, Wifi, 
  User, Check, Copy, ExternalLink, ShieldCheck, MapPin, 
  Smartphone, ArrowLeft, Radio 
} from 'lucide-react';

interface PublicPlaquinhaViewProps {
  id: string;
}

export const PublicPlaquinhaView: React.FC<PublicPlaquinhaViewProps> = ({ id }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<'pix' | 'wifi' | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/plaquinha/${id}`);
        if (!res.ok) {
          throw new Error('Plaquinha não encontrada');
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar plaquinha');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Carregando Plaquinha #{id}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
          <Radio className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Plaquinha Não Encontrada</h2>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          O identificador #{id} não foi localizado em nossa base de dados ou ainda não foi configurado.
        </p>
        <a
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
        >
          Voltar ao Início
        </a>
      </div>
    );
  }

  // Se a plaquinha física estiver em estoque aguardando ser vendida/ativada para um cliente
  if (data.statusVenda === 'disponivel') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="w-full max-w-md bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Plaquinha Inteligente #{id}
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">
              Pronta para Ativação!
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esta plaquinha física já possui QR Code dinâmico permanente e chip NFC configurados.
              Ao concluir a venda para seu cliente, configure o destino em segundos pelo painel.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Número de Série:</span>
              <span className="font-mono text-amber-300 font-bold">PLQ-{id}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Status Atual:</span>
              <span className="text-amber-400 font-semibold">Em Estoque (Aguardando Venda)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Total de Scans:</span>
              <span className="text-emerald-400 font-mono font-bold">{data.scansTotal || 0} leituras</span>
            </div>
          </div>

          <div className="space-y-3">
            <a
              href={`/?activate=${id}`}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <span>⚡ Ativar Plaquinha #{id} para Cliente</span>
            </a>
            <a
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center"
            >
              Voltar ao Painel Geral
            </a>
          </div>
        </div>
      </div>
    );
  }

  const { empresa, cidade, estado, googleReviewUrl, modulosAtivos, dadosModulos, qrCodes } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      
      {/* Mobile-sized Card Container */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto">
        
        {/* Verification Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>NFC &bull; Plaquinha Oficial #{id}</span>
          </div>

          <span className="flex items-center text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Verificado
          </span>
        </div>

        {/* Business Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {empresa}
          </h1>
          <p className="text-xs text-slate-400 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span>{cidade} - {estado}</span>
          </p>
        </div>

        {/* Action Buttons List */}
        <div className="space-y-3">
          
          {/* 1. Google Review Direct */}
          {modulosAtivos.googleReview && googleReviewUrl && (
            <a
              href={googleReviewUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-600/15 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-200 flex items-center justify-between transition-all group shadow-lg shadow-amber-500/5 cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Avaliar no Google</span>
                  <span className="text-[11px] text-amber-300/80">Deixe 5 estrelas em 1 minuto</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-amber-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}

          {/* 2. PIX Modal Trigger */}
          {modulosAtivos.pix && dadosModulos.pix?.chave && (
            <button
              onClick={() => setActiveModal('pix')}
              className="w-full p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-slate-200 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Pagar via PIX</span>
                  <span className="text-[11px] text-slate-400">Chave e QR Code instantâneo</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Ver Chave &rarr;</span>
            </button>
          )}

          {/* 3. WhatsApp Direct */}
          {modulosAtivos.whatsapp && dadosModulos.whatsapp?.numero && (
            <a
              href={`https://wa.me/${dadosModulos.whatsapp.numero.replace(/\D/g, '')}?text=${encodeURIComponent(dadosModulos.whatsapp.mensagem || 'Olá!')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-green-500/40 text-slate-200 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 flex-shrink-0">
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Falar no WhatsApp</span>
                  <span className="text-[11px] text-slate-400">Atendimento direto com a equipe</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-green-400 flex-shrink-0" />
            </a>
          )}

          {/* 4. Instagram Direct */}
          {modulosAtivos.instagram && dadosModulos.instagram?.usuario && (
            <a
              href={`https://instagram.com/${dadosModulos.instagram.usuario.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="w-full p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-pink-500/40 text-slate-200 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
                  <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Seguir no Instagram</span>
                  <span className="text-[11px] text-slate-400">@{dadosModulos.instagram.usuario.replace('@', '')}</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-400 flex-shrink-0" />
            </a>
          )}

          {/* 5. Wi-Fi Conexão */}
          {modulosAtivos.wifi && dadosModulos.wifi?.ssid && (
            <button
              onClick={() => setActiveModal('wifi')}
              className="w-full p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 text-slate-200 flex items-center justify-between transition-all group cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Wifi className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-white block">Wi-Fi para Clientes</span>
                  <span className="text-[11px] text-slate-400">Rede: {dadosModulos.wifi.ssid}</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-400">Conectar &rarr;</span>
            </button>
          )}

        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
          <p>Plaquinha Inteligente NFC &bull; ID #{id}</p>
        </div>

      </div>

      {/* MODAL PIX */}
      {activeModal === 'pix' && dadosModulos.pix && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Pagamento Instantâneo</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <h3 className="text-lg font-bold text-white">Pagar via PIX</h3>

            {qrCodes?.pix && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                <img src={qrCodes.pix} alt="QR Code Pix" className="w-44 h-44 object-contain" />
              </div>
            )}

            <div className="text-xs text-left bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div><span className="text-slate-500">Beneficiário:</span> <strong className="text-slate-200">{dadosModulos.pix.beneficiario || empresa}</strong></div>
              <div><span className="text-slate-500">Chave PIX:</span> <strong className="text-emerald-400 font-mono select-all break-all">{dadosModulos.pix.chave}</strong></div>
              {dadosModulos.pix.valor && <div><span className="text-slate-500">Valor:</span> <strong className="text-white">R$ {Number(dadosModulos.pix.valor).toFixed(2)}</strong></div>}
            </div>

            <button
              onClick={() => copyToClipboard(dadosModulos.pix.payloadPix || dadosModulos.pix.chave, 'pix-chave')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {copiedKey === 'pix-chave' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'pix-chave' ? 'Chave Copiada!' : 'Copiar Chave / Copia e Cola'}</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL WI-FI */}
      {activeModal === 'wifi' && dadosModulos.wifi && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Wi-Fi de Clientes</span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <h3 className="text-lg font-bold text-white">Conectar ao Wi-Fi</h3>

            {qrCodes?.wifi && (
              <div className="p-3 bg-white rounded-2xl inline-block shadow-md">
                <img src={qrCodes.wifi} alt="QR Code Wi-Fi" className="w-44 h-44 object-contain" />
              </div>
            )}
            <p className="text-[11px] text-slate-400">Aponte a câmera do seu celular para conectar automaticamente</p>

            <div className="text-xs text-left bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div><span className="text-slate-500">Nome da Rede:</span> <strong className="text-white font-mono">{dadosModulos.wifi.ssid}</strong></div>
              <div><span className="text-slate-500">Senha:</span> <strong className="text-blue-300 font-mono">{dadosModulos.wifi.senha}</strong></div>
            </div>

            <button
              onClick={() => copyToClipboard(dadosModulos.wifi.senha, 'wifi-pass')}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {copiedKey === 'wifi-pass' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'wifi-pass' ? 'Senha Copiada!' : 'Copiar Senha do Wi-Fi'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
