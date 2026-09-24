import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Download, Copy, Check, QrCode, Star, 
  Sparkles, Wifi, MessageSquare, Instagram, CreditCard, User, Radio, Palette, Zap
} from 'lucide-react';
import { PlaquinhaRecord } from '../types';

interface PlaquinhaCardModalProps {
  plaquinha: PlaquinhaRecord;
  onClose: () => void;
  onUpdatePlaquinha?: () => void;
}

export const PlaquinhaCardModal: React.FC<PlaquinhaCardModalProps> = ({ plaquinha, onClose, onUpdatePlaquinha }) => {
  const [activeTab, setActiveTab] = useState<'mockup' | 'individual' | 'design'>('mockup');
  const [corFrente, setCorFrente] = useState(plaquinha.designQr?.corFrente || '#0f172a');
  const [corFundo, setCorFundo] = useState(plaquinha.designQr?.corFundo || '#ffffff');
  const [logoCentro, setLogoCentro] = useState(plaquinha.designQr?.logoCentro || 'google');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [generatedQrs, setGeneratedQrs] = useState<Record<string, string>>({});
  const [loadingQr, setLoadingQr] = useState(false);
  const [qrTypeOnTemplate, setQrTypeOnTemplate] = useState<'dynamic' | 'direct_google'>('dynamic');
  const [currentModoDestino, setCurrentModoDestino] = useState(plaquinha.modoDestino || 'google_review');

  const origin = window.location.origin;
  // A URL gravada no QR Code e no NFC da placa física é SEMPRE a rota dinâmica /r/:id
  const hubUrl = plaquinha.dynamicRedirectUrl || `${origin}/r/${plaquinha.id}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Fetch or regenerate individual QRs
  useEffect(() => {
    const fetchQrs = async () => {
      setLoadingQr(true);
      try {
        const qrs: Record<string, string> = {};

        // Main Plaquinha Hub QR
        const resHub = await fetch('/api/generate-custom-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payload: hubUrl,
            corFrente,
            corFundo,
          }),
        });
        if (resHub.ok) {
          const d = await resHub.json();
          qrs.hub = d.qrDataUrl;
        }

        // Google Review QR
        if (plaquinha.googleReviewUrl) {
          const resReview = await fetch('/api/generate-custom-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: plaquinha.googleReviewUrl,
              corFrente,
              corFundo,
            }),
          });
          if (resReview.ok) {
            const d = await resReview.json();
            qrs.google = d.qrDataUrl;
          }
        }

        // PIX QR
        if (plaquinha.modulosAtivos.pix && plaquinha.dadosModulos.pix?.payloadPix) {
          const resPix = await fetch('/api/generate-custom-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: plaquinha.dadosModulos.pix.payloadPix,
              corFrente,
              corFundo,
            }),
          });
          if (resPix.ok) {
            const d = await resPix.json();
            qrs.pix = d.qrDataUrl;
          }
        }

        // Wi-Fi QR
        if (plaquinha.modulosAtivos.wifi && plaquinha.dadosModulos.wifi?.ssid) {
          const wifiStr = `WIFI:T:${plaquinha.dadosModulos.wifi.seguranca || 'WPA'};S:${plaquinha.dadosModulos.wifi.ssid};P:${plaquinha.dadosModulos.wifi.senha || ''};;`;
          const resWifi = await fetch('/api/generate-custom-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: wifiStr,
              corFrente,
              corFundo,
            }),
          });
          if (resWifi.ok) {
            const d = await resWifi.json();
            qrs.wifi = d.qrDataUrl;
          }
        }

        // WhatsApp QR
        if (plaquinha.modulosAtivos.whatsapp && plaquinha.dadosModulos.whatsapp?.numero) {
          const cleanNum = plaquinha.dadosModulos.whatsapp.numero.replace(/\D/g, '');
          const waUrl = `https://wa.me/${cleanNum}?text=${encodeURIComponent(plaquinha.dadosModulos.whatsapp.mensagem || '')}`;
          const resWa = await fetch('/api/generate-custom-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: waUrl,
              corFrente,
              corFundo,
            }),
          });
          if (resWa.ok) {
            const d = await resWa.json();
            qrs.whatsapp = d.qrDataUrl;
          }
        }

        // Instagram QR
        if (plaquinha.modulosAtivos.instagram && plaquinha.dadosModulos.instagram?.usuario) {
          const instaUrl = `https://instagram.com/${plaquinha.dadosModulos.instagram.usuario.replace('@', '')}`;
          const resInsta = await fetch('/api/generate-custom-qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              payload: instaUrl,
              corFrente,
              corFundo,
            }),
          });
          if (resInsta.ok) {
            const d = await resInsta.json();
            qrs.instagram = d.qrDataUrl;
          }
        }

        setGeneratedQrs(qrs);
      } catch (err) {
        console.error('Error generating QRs:', err);
      } finally {
        setLoadingQr(false);
      }
    };

    fetchQrs();
  }, [plaquinha, corFrente, corFundo, hubUrl]);

  const handlePrint = () => {
    window.print();
  };

  const downloadImage = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Plaquinha Oficial #{plaquinha.id}
              </span>
              <span className="text-xs text-slate-400 capitalize">&bull; Acabamento: {plaquinha.tipoPlaquinha}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{plaquinha.empresa}</h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Gabarito</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('mockup')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'mockup'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Gabarito da Plaquinha Física</span>
          </button>

          <button
            onClick={() => setActiveTab('individual')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'individual'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QRs Individuais (Pix, Wi-Fi, Insta...)</span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'design'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Cores & Personalização</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          
          {/* TAB 1: Mockup da Plaquinha Física (Acrílico com pedestal) */}
          {activeTab === 'mockup' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* Plaquinha Visual Preview */}
              <div className="md:col-span-6 flex justify-center">
                <div 
                  id="plaquinha-print-area"
                  className="relative w-72 sm:w-80 rounded-3xl p-6 text-center shadow-2xl border flex flex-col items-center justify-between transition-all"
                  style={{
                    backgroundColor: corFundo,
                    color: corFrente,
                    borderColor: 'rgba(203, 213, 225, 0.4)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    aspectRatio: '1 / 1.45',
                  }}
                >
                  {/* Top NFC Sensor Area */}
                  <div className="w-full flex items-center justify-between border-b pb-2 mb-2" style={{ borderColor: `${corFrente}20` }}>
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80">
                      <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-600" />
                      <span>NFC Inteligente</span>
                    </div>
                    <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-slate-900/10">
                      #{plaquinha.id}
                    </span>
                  </div>

                  {/* Company Name */}
                  <div className="my-1">
                    <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">
                      {plaquinha.empresa}
                    </h3>
                    <p className="text-[11px] opacity-75 font-medium mt-0.5">
                      {plaquinha.cidade} - {plaquinha.estado}
                    </p>
                  </div>

                  {/* Central QR Code */}
                  <div className="p-3 rounded-2xl bg-white shadow-md border border-slate-100 my-2">
                    {generatedQrs.hub ? (
                      <img
                        src={generatedQrs.hub}
                        alt={`QR Code Dinâmico Permanente Plaquinha #${plaquinha.id}`}
                        className="w-40 h-40 sm:w-44 sm:h-44 object-contain"
                      />
                    ) : (
                      <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                        Carregando QR Permanente...
                      </div>
                    )}
                  </div>

                  {/* Feature Icons Row */}
                  <div className="flex items-center justify-center space-x-3 my-1 opacity-90">
                    {plaquinha.modulosAtivos.googleReview && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        </div>
                        <span className="text-[9px] font-bold mt-0.5">Avalie</span>
                      </div>
                    )}

                    {plaquinha.modulosAtivos.pix && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-600">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold mt-0.5">PIX</span>
                      </div>
                    )}

                    {plaquinha.modulosAtivos.whatsapp && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center text-green-600">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold mt-0.5">Whats</span>
                      </div>
                    )}

                    {plaquinha.modulosAtivos.instagram && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-600">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold mt-0.5">Insta</span>
                      </div>
                    )}

                    {plaquinha.modulosAtivos.wifi && (
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-600">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <span className="text-[9px] font-bold mt-0.5">Wi-Fi</span>
                      </div>
                    )}
                  </div>

                  {/* Call to Action Footer */}
                  <div className="border-t pt-2 w-full mt-1" style={{ borderColor: `${corFrente}20` }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                      Aproxime o celular ou aponte a câmera
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions and Specs */}
              <div className="md:col-span-6 space-y-5">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Especificações de Produção</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 block">Número de Série:</span>
                      <span className="font-mono font-bold text-amber-300">PLQ-{plaquinha.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Material Recomendado:</span>
                      <span className="font-semibold text-white capitalize">{plaquinha.tipoPlaquinha} Cristal</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Dimensões Padrão:</span>
                      <span className="font-semibold text-white">10cm x 15cm (A6)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Status da Gravação NFC:</span>
                      <span className={plaquinha.nfcConfig?.gravado ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                        {plaquinha.nfcConfig?.gravado ? 'Chip Gravado' : 'Pendente Gravação'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Controle Rápido de Destino Dinâmico & Link Direto */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-bold flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>Destino do QR Code / NFC na Placa Física:</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 font-semibold">
                      {currentModoDestino === 'google_review' ? '⭐ Google 5 Estrelas' : currentModoDestino === 'whatsapp' ? '💬 WhatsApp' : currentModoDestino === 'instagram' ? '📸 Instagram' : currentModoDestino === 'custom_url' ? '🌐 Link Custom' : '📱 Hub Completo'}
                    </span>
                  </div>

                  {/* 1-Click Fast Destination Selector */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        setCurrentModoDestino('google_review');
                        await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ modoDestino: 'google_review' }),
                        });
                        onUpdatePlaquinha?.();
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        currentModoDestino === 'google_review'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      ⭐ 5★ Google
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setCurrentModoDestino('hub');
                        await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ modoDestino: 'hub' }),
                        });
                        onUpdatePlaquinha?.();
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        currentModoDestino === 'hub'
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      📱 Hub da Loja
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setCurrentModoDestino('whatsapp');
                        await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ modoDestino: 'whatsapp' }),
                        });
                        onUpdatePlaquinha?.();
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        currentModoDestino === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      💬 WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setCurrentModoDestino('instagram');
                        await fetch(`/api/plaquinhas/${plaquinha.id}/destino`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ modoDestino: 'instagram' }),
                        });
                        onUpdatePlaquinha?.();
                      }}
                      className={`p-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                        currentModoDestino === 'instagram'
                          ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      📸 Instagram
                    </button>
                  </div>

                  {/* QR Imprinted on Plaque: Dynamic Guarantee */}
                  <div className="pt-2 border-t border-slate-850 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center space-x-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>QR Code Dinâmico Gravado (Permanente)</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-mono">
                        /r/{plaquinha.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      🛡️ <strong>Desenho Fixo e Inalterável:</strong> O desenho gerado acima é o que deve ser gravado/impresso no acrílico. Mesmo quando você alterar os links do cliente (Google, WhatsApp, Instagram ou Cardápio), o <strong>desenho físico da plaquinha continuará 100% idêntico</strong>. O sistema atualiza apenas o destino online sem precisar reimprimir!
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-medium flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Link Gravado na Plaquinha (QR Code &amp; NFC):</span>
                    </span>
                    <a
                      href={hubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 hover:underline"
                      title="Testar a leitura do QR Code agora"
                    >
                      <Zap className="w-3 h-3 fill-amber-400" />
                      <span>Testar Leitura Online &rarr;</span>
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={hubUrl}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 select-all"
                    />
                    <button
                      onClick={() => copyToClipboard(hubUrl, 'hub-url')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-xl flex items-center space-x-1 cursor-pointer"
                    >
                      {copiedKey === 'hub-url' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>Copiar</span>
                    </button>
                    <a
                      href={hubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl cursor-pointer"
                    >
                      Testar Redirecionamento
                    </a>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    💡 <strong>Como Funciona na Internet:</strong> O QR Code impresso no acrílico acessa <code>/r/{plaquinha.id}</code> no seu domínio publicado. Ele consulta o destino salvo e abre o link final automaticamente!
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-2">
                  {generatedQrs.hub && (
                    <button
                      onClick={() => downloadImage(generatedQrs.hub, `plaquinha-qr-${plaquinha.id}.png`)}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-600/20"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar QR Code Principal (PNG)</span>
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir para Corte</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: QR Codes Individuais */}
          {activeTab === 'individual' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-400">
                Você também pode baixar os QR Codes de cada funcionalidade separadamente para adesivar em chaveiros, espelhos, balcões ou menus:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* 1. Google Review */}
                {plaquinha.modulosAtivos.googleReview && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>Google Avaliação 5 Estrelas</span>
                    </div>
                    {generatedQrs.google && (
                      <img src={generatedQrs.google} alt="QR Google" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    )}
                    <button
                      onClick={() => downloadImage(generatedQrs.google, `qr-google-review-${plaquinha.id}.png`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Baixar PNG
                    </button>
                  </div>
                )}

                {/* 2. PIX */}
                {plaquinha.modulosAtivos.pix && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                      <CreditCard className="w-4 h-4" />
                      <span>PIX Copia e Cola</span>
                    </div>
                    {generatedQrs.pix && (
                      <img src={generatedQrs.pix} alt="QR Pix" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    )}
                    <button
                      onClick={() => downloadImage(generatedQrs.pix, `qr-pix-${plaquinha.id}.png`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Baixar PNG
                    </button>
                  </div>
                )}

                {/* 3. Wi-Fi */}
                {plaquinha.modulosAtivos.wifi && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
                      <Wifi className="w-4 h-4" />
                      <span>Conectar ao Wi-Fi</span>
                    </div>
                    {generatedQrs.wifi && (
                      <img src={generatedQrs.wifi} alt="QR Wifi" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    )}
                    <button
                      onClick={() => downloadImage(generatedQrs.wifi, `qr-wifi-${plaquinha.id}.png`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Baixar PNG
                    </button>
                  </div>
                )}

                {/* 4. WhatsApp */}
                {plaquinha.modulosAtivos.whatsapp && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-green-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>WhatsApp Oficial</span>
                    </div>
                    {generatedQrs.whatsapp && (
                      <img src={generatedQrs.whatsapp} alt="QR WhatsApp" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    )}
                    <button
                      onClick={() => downloadImage(generatedQrs.whatsapp, `qr-whatsapp-${plaquinha.id}.png`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Baixar PNG
                    </button>
                  </div>
                )}

                {/* 5. Instagram */}
                {plaquinha.modulosAtivos.instagram && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-pink-400">
                      <Instagram className="w-4 h-4" />
                      <span>Instagram Oficial</span>
                    </div>
                    {generatedQrs.instagram && (
                      <img src={generatedQrs.instagram} alt="QR Instagram" className="w-36 h-36 bg-white p-2 rounded-xl" />
                    )}
                    <button
                      onClick={() => downloadImage(generatedQrs.instagram, `qr-instagram-${plaquinha.id}.png`)}
                      className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Baixar PNG
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 3: Cores e Design */}
          {activeTab === 'design' && (
            <div className="space-y-6 max-w-xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Cor dos Elementos (Frente):</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={corFrente}
                      onChange={(e) => setCorFrente(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                    />
                    <input
                      type="text"
                      value={corFrente}
                      onChange={(e) => setCorFrente(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Cor do Fundo da Plaquinha:</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={corFundo}
                      onChange={(e) => setCorFundo(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-slate-900 border border-slate-700"
                    />
                    <input
                      type="text"
                      value={corFundo}
                      onChange={(e) => setCorFundo(e.target.value)}
                      className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Color Themes */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 font-medium">Temas Prontos:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setCorFrente('#0f172a'); setCorFundo('#ffffff'); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    Acrílico Cristal Clássico
                  </button>
                  <button
                    onClick={() => { setCorFrente('#e2e8f0'); setCorFundo('#090d16'); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-slate-950 text-slate-200 border border-slate-800"
                  >
                    Black Piano Luxo
                  </button>
                  <button
                    onClick={() => { setCorFrente('#78350f'); setCorFundo('#fef3c7'); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-amber-950 text-amber-200 border border-amber-900"
                  >
                    Madeira Nobre / Dourado
                  </button>
                  <button
                    onClick={() => { setCorFrente('#1e3a8a'); setCorFundo('#f0f9ff'); }}
                    className="px-3 py-1.5 rounded-lg text-xs bg-blue-950 text-blue-200 border border-blue-900"
                  >
                    Azul Royal Google
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500">ID #{plaquinha.id} &bull; {plaquinha.empresa}</span>
          <button
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
