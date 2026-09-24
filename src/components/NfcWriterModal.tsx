import React, { useState, useEffect } from 'react';
import { 
  X, Radio, CheckCircle2, AlertCircle, Smartphone, 
  RefreshCw, Sparkles, ExternalLink, ShieldCheck, Zap 
} from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface NfcWriterModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onSuccess: (updated: PlaquinhaRecord) => void;
}

export const NfcWriterModal: React.FC<NfcWriterModalProps> = ({ plaquinha, onClose, onSuccess }) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [writing, setWriting] = useState(false);
  const [statusText, setStatusText] = useState('Pronto para iniciar gravação');
  const [writeError, setWriteError] = useState<string | null>(null);
  const [writeSuccess, setWriteSuccess] = useState(false);
  const [targetType, setTargetType] = useState<'landing_page_plaquinha' | 'url_review_google'>(
    plaquinha.nfcConfig?.tipoGravacao === 'url_review_google' ? 'url_review_google' : 'landing_page_plaquinha'
  );

  const origin = window.location.origin;
  // A URL dinâmica /r/:id permite mudar o destino a qualquer momento pelo painel sem trocar a placa física
  const dynamicUrl = `${origin}/r/${plaquinha.id}`;
  const directReviewUrl = plaquinha.googleReviewUrl || `https://search.google.com/local/writereview?placeid=${plaquinha.googlePlaceId || ''}`;
  const finalTargetUrl = targetType === 'url_review_google' && directReviewUrl ? directReviewUrl : dynamicUrl;

  useEffect(() => {
    // Check if Web NFC API (NDEFReader) is available in current browser
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }
  }, []);

  const handleWriteNfc = async () => {
    setWriting(true);
    setWriteError(null);
    setWriteSuccess(false);
    setStatusText('Aproxime a plaquinha com chip NFC da traseira do seu celular...');

    try {
      if (!('NDEFReader' in window)) {
        throw new Error('Web NFC não suportado neste navegador. Use o Google Chrome no Android com NFC ativo.');
      }

      const NDEFReaderClass = (window as any).NDEFReader;
      const ndef = new NDEFReaderClass();

      // Write URL record to NFC tag
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: finalTargetUrl,
          },
        ],
      });

      // Tag successfully written!
      setStatusText('Chip NFC gravado com sucesso!');
      setWriteSuccess(true);
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }

      // Update backend status
      const res = await fetch(`/api/plaquinhas/${plaquinha.id}/nfc-recorded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlGravada: finalTargetUrl,
          tipoGravacao: targetType,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.updated);
      }
    } catch (err: any) {
      console.error('NFC Write Error:', err);
      setWriteError(err.message || 'Erro ao gravar tag NFC. Certifique-se de que o NFC está ligado e aproxime a tag.');
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  #{plaquinha.id}
                </span>
                <span className="text-xs text-slate-400">{plaquinha.empresa}</span>
              </div>
              <h2 className="text-xl font-bold text-white">Instalação & Gravação no Chip NFC</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NFC Support Indicator */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
            {isSupported ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-5 h-5" />
              </div>
            )}
            <div className="text-xs space-y-1">
              <span className="font-semibold text-white">
                {isSupported ? 'Web NFC API Disponível' : 'Aviso de Compatibilidade Web NFC'}
              </span>
              <p className="text-slate-400 leading-relaxed">
                {isSupported
                  ? 'Seu navegador suporta gravação direta de chips NFC (NTAG213, NTAG215, NTAG216). Basta clicar no botão e aproximar a plaquinha.'
                  : 'Para gravar diretamente pelo navegador sem nenhum app externo, acesse este link pelo Google Chrome no smartphone Android com o NFC ativado. No iPhone ou computador, você também pode usar o app gratuito "NFC Tools" com o link abaixo.'}
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Escolha o que será gravado no Chip NFC da Plaquinha:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetType('landing_page_plaquinha')}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  targetType === 'landing_page_plaquinha'
                    ? 'bg-indigo-600/20 border-indigo-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold">Link Dinâmico Permanente (/r/#{plaquinha.id})</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Altamente recomendado! Grava a rota inteligente fixa. Quando você mudar o destino no painel (Google 5★, WhatsApp, Insta ou Hub), o chip NFC atualiza na hora sem precisar regravar fisicamente!
                </p>
              </button>

              <button
                type="button"
                onClick={() => setTargetType('url_review_google')}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  targetType === 'url_review_google'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold">Google Avaliação Direto</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Aproxima o celular e abre imediatamente a caixa de 5 estrelas do Google Meu Negócio do cliente.
                </p>
              </button>
            </div>
          </div>

          {/* Target URL Preview */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">URL a ser instalada no chip:</span>
            <p className="font-mono text-xs text-emerald-400 break-all select-all">
              {finalTargetUrl}
            </p>
          </div>

          {/* Interactive Animation Box */}
          <div className="bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 p-6 rounded-3xl text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                writing 
                  ? 'bg-indigo-600/30 ring-8 ring-indigo-500/20 animate-ping' 
                  : writeSuccess 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-slate-800 text-indigo-400'
              }`}>
                {writeSuccess ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                ) : (
                  <Radio className={`w-10 h-10 ${writing ? 'animate-bounce text-indigo-400' : ''}`} />
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white">{statusText}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Compatível com tags padrão NTAG213, NTAG215 e NTAG216.
              </p>
            </div>

            {writeError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 text-left">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{writeError}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleWriteNfc}
                disabled={writing}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {writing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Aguardando aproximação da plaquinha...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>Gravar no Chip NFC Agora</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Alternative for manual NFC Tools setup */}
          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-2">
            <span className="font-semibold text-slate-300">Como gravar usando o app NFC Tools (Alternativa no iPhone/Android):</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Abra o app <strong>NFC Tools</strong> (gratuito na Play Store e App Store).</li>
              <li>Toque em <strong>Escrever &gt; Adicionar um registro &gt; URL / URI</strong>.</li>
              <li>Cole a URL acima (<code className="text-blue-400">{finalTargetUrl}</code>).</li>
              <li>Toque em <strong>Escrever</strong> e encoste a plaquinha no topo do aparelho até apitar.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">Plaquinha Inteligente NFC &bull; ID #{plaquinha.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
