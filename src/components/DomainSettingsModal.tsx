import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  X, 
  Check, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  Server, 
  Smartphone, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface DomainSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const DomainSettingsModal: React.FC<DomainSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [customDomain, setCustomDomain] = useState('');
  const [currentHost, setCurrentHost] = useState('');
  const [serverDetectedHost, setServerDetectedHost] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setStatusMsg(null);
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setCustomDomain(data.customDomain || '');
        setCurrentHost(data.currentHost || window.location.origin);
        setServerDetectedHost(data.serverDetectedHost || window.location.origin);
      })
      .catch(() => {
        setCurrentHost(window.location.origin);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      });

      if (!res.ok) {
        throw new Error('Falha ao salvar configuração');
      }

      setStatusMsg({
        type: 'success',
        text: 'Domínio salvo com sucesso! Todos os QR Codes e gabaritos agora usarão este endereço base.',
      });
      if (onSaved) onSaved();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Erro ao salvar domínio.',
      });
    } finally {
      setSaving(false);
    }
  };

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Configurar Domínio do Site &amp; Produção
              </h3>
              <p className="text-xs text-slate-400">
                Como os QR Codes funcionam no teste e quando seu site for lançado na internet
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Important explanation callout */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Como saber se vai realmente funcionar quando fizer o site?</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              O sistema de plaquinhas inteligentes funciona com um <strong>redirecionador dinâmico permanente</strong>. Cada placa física gravada tem o código <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">/r/NUMERO</code>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-300 flex items-center space-x-1">
                  <span>1. Câmera do Cliente</span>
                </span>
                <p className="text-slate-400 text-[10px]">
                  O cliente aponta a câmera para a placa física gravada. O celular lê <code className="text-slate-300">seusite.com.br/r/1001</code>.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-blue-300 flex items-center space-x-1">
                  <span>2. Seu Servidor</span>
                </span>
                <p className="text-slate-400 text-[10px]">
                  Seu site recebe o acesso em 0.1 segundo e consulta qual destino você cadastrou no painel.
                </p>
              </div>

              <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-300 flex items-center space-x-1">
                  <span>3. Redirecionamento</span>
                </span>
                <p className="text-slate-400 text-[10px]">
                  O celular do cliente abre na hora a tela do Google 5 Estrelas, WhatsApp ou o Hub da Loja!
                </p>
              </div>
            </div>
          </div>

          {/* Test Environment Warning (Localhost vs Mobile) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Por que ao escanear com o celular no teste pode dar erro?</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {isLocalhost ? (
                <>
                  Você está acessando pelo computador via <strong>localhost</strong>. Seu celular físico não consegue acessar o endereço do seu computador porque o celular não está dentro dele! No computador, clicando nos botões de teste, o redirecionamento funciona 100%.
                </>
              ) : (
                <>
                  Neste ambiente de desenvolvimento do editor, o Google exige autenticação de desenvolvedor. Quando você publicar seu site em um domínio aberto ou VPS/hospedagem (ex: Hostinger, Vercel ou servidor próprio), <strong>qualquer celular do Brasil acessa direto e instantaneamente sem nenhum bloqueio</strong>.
                </>
              )}
            </p>
          </div>

          {/* Form: Set Production Domain */}
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="block text-slate-200 font-bold mb-1">
                Domínio Oficial de Produção do Seu Site:
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Insira o domínio onde seu site vai rodar quando estiver no ar (ex: <span className="text-blue-300 font-mono">https://minhaplaquinha.com.br</span> ou <span className="text-blue-300 font-mono">https://seusite.com.br</span>).
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="https://suaempresa.com.br"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Salvando...' : 'Salvar Domínio'}</span>
                </button>
              </div>
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                  statusMsg.type === 'success'
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/15 border-red-500/30 text-red-300'
                }`}
              >
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{statusMsg.text}</span>
              </div>
            )}

            {/* Current Active Resolution Preview */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Endereço Base Atual Utilizado para QR Codes e Chips NFC:
              </span>
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-emerald-400 font-bold truncate">
                  {customDomain ? customDomain : currentHost}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 whitespace-nowrap ml-2">
                  {customDomain ? '🌐 Domínio de Produção' : '⚡ Endereço Atual'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Exemplo do QR impresso no acrílico: <span className="text-amber-300 font-mono">{customDomain ? customDomain : currentHost}/r/1001</span>
              </p>
            </div>
          </form>

          {/* Quick FAQ */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantias de Funcionamento:</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>
                <strong className="text-slate-300">As plaquinhas já gravadas continuam funcionando?</strong> Sim! Se você já tiver o domínio registrado, basta configurar e gravar o QR permanente.
              </li>
              <li>
                <strong className="text-slate-300">O que acontece se o cliente mudar de endereço ou telefone?</strong> Você entra no painel, altera o link ou telefone e a mesma plaquinha já começa a redirecionar para o novo destino na hora.
              </li>
              <li>
                <strong className="text-slate-300">Qual velocidade do redirecionamento?</strong> Menos de 100 milissegundos (instantâneo), pois é uma rota direta de servidor HTTP 302.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
