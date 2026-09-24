import React, { useState } from 'react';
import { 
  X, ExternalLink, Copy, Check, QrCode, MessageSquare, 
  Mail, MapPin, Phone, Globe, Star, Sparkles, Download, Share2, Code2
} from 'lucide-react';
import { PlaceResult } from '../types';

interface PlaceDetailModalProps {
  place: PlaceResult | null;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('Cliente');
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'messages' | 'api'>('link');

  if (!place) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const dynamicWhatsapp = `Olá ${customerName}! Agradecemos pela sua visita ao ${place.name}. Sua opinião é muito valiosa para nós! Você poderia nos avaliar no Google com 5 estrelas? Leva apenas 30 segundos: ${place.links.directReviewUrl}`;
  const dynamicSms = `Olá ${customerName}! Conte como foi sua experiência no ${place.name}: ${place.links.directReviewUrl}`;

  const downloadQrCode = () => {
    if (!place.qrCodeDataUrl) return;
    const link = document.createElement('a');
    link.href = place.qrCodeDataUrl;
    link.download = `qrcode-avaliacao-google-${place.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700/80 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Google Meu Negócio
              </span>
              {place.rating && (
                <div className="flex items-center space-x-1 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{place.rating.toFixed(1)}</span>
                  <span className="text-amber-400/70 font-normal">({place.userRatingCount || 0} avaliações)</span>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{place.name}</h2>
            <p className="text-xs text-slate-400 flex items-center mt-1">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
              {place.address}
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-3 space-x-4">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'link'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>Link Direto de Avaliação</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'qr'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code para Balcão</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'messages'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Templates WhatsApp / SMS</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center space-x-2 transition-all ${
              activeTab === 'api'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Payload JSON & API</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* TAB 1: Direct Link */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/20 to-purple-900/30 border border-blue-800/40 p-5 rounded-2xl">
                <div className="flex items-center space-x-2 mb-2 text-blue-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Link Oficial Direto para Avaliação do Google (Write Review)</span>
                </div>
                <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                  Este link abre diretamente o modal oficial de avaliação do Google com 5 estrelas selecionáveis, pulando a busca e levando o cliente direto para o feedback.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 font-mono text-xs text-blue-300 break-all select-all">
                    {place.links.directReviewUrl}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(place.links.directReviewUrl, 'direct-link')}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      {copiedKey === 'direct-link' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedKey === 'direct-link' ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                    <a
                      href={place.links.directReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-xs text-slate-200 transition-all border border-slate-700 cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Testar Link</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Technical IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-400">Google Place ID</span>
                    <button
                      onClick={() => copyToClipboard(place.id, 'place-id')}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      {copiedKey === 'place-id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'place-id' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-200 select-all break-all">{place.id}</p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Identificador imutável no Google Meu Negócio / Places API para integrações e automações.
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-400">Link no Google Maps</span>
                    <button
                      onClick={() => copyToClipboard(place.googleMapsUri || place.links.mapsPlaceUrl, 'maps-url')}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      {copiedKey === 'maps-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'maps-url' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-slate-200 select-all break-all truncate">
                    {place.googleMapsUri || place.links.mapsPlaceUrl}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Página padrão do perfil da empresa no aplicativo e web do Google Maps.
                  </p>
                </div>
              </div>

              {/* Extra details */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                {place.phone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{place.phone}</span>
                  </div>
                )}
                {place.websiteUri && (
                  <div className="flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <a href={place.websiteUri} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      Website Oficial
                    </a>
                  </div>
                )}
                {place.types && place.types.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-500">Categorias:</span>
                    <span className="text-slate-400">{place.types.slice(0, 3).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: QR Code */}
          {activeTab === 'qr' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner border border-slate-200 text-slate-900 text-center">
                {place.qrCodeDataUrl ? (
                  <img
                    src={place.qrCodeDataUrl}
                    alt={`QR Code Google Review ${place.name}`}
                    className="w-64 h-64 object-contain"
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                    Gerando QR Code...
                  </div>
                )}
                <div className="mt-3">
                  <p className="font-bold text-slate-900 text-sm">Avalie {place.name}</p>
                  <p className="text-xs text-slate-500">Aponte a câmera do seu celular</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">QR Code para Ponto Físico</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coloque este QR Code em:
                </p>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  <li>Displays de acrílico no balcão de pagamento</li>
                  <li>Mesas de restaurante ou salão</li>
                  <li>Rodapé de recibos fiscais ou notas de entrega</li>
                  <li>Cartões de visita com chip NFC ou impressão</li>
                  <li>Espelhos, provadores ou saída da loja</li>
                </ul>

                <div className="pt-4 flex flex-col space-y-2">
                  <button
                    onClick={downloadQrCode}
                    className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Imagem do QR Code (PNG)</span>
                  </button>

                  <button
                    onClick={() => copyToClipboard(place.qrCodeDataUrl || '', 'qr-data')}
                    className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium text-xs text-slate-300 transition-all border border-slate-700 cursor-pointer"
                  >
                    {copiedKey === 'qr-data' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>Copiar QR Code (Base64 Data URI)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Message Templates */}
          {activeTab === 'messages' && (
            <div className="space-y-5">
              <div className="flex items-center space-x-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <label className="text-xs font-semibold text-slate-300 flex-shrink-0">
                  Nome do Cliente (para teste de personalização):
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Carlos, Maria..."
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-48"
                />
              </div>

              {/* WhatsApp Template */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>Modelo WhatsApp (Pós-Atendimento / Pós-Venda)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dynamicWhatsapp, 'msg-whatsapp')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'msg-whatsapp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'msg-whatsapp' ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg text-xs font-sans text-slate-200 border border-slate-800 whitespace-pre-line">
                  {dynamicWhatsapp}
                </div>
                <div className="flex justify-end pt-1">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(dynamicWhatsapp)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
                  >
                    <Share2 className="w-3 h-3 mr-1" />
                    Abrir no WhatsApp Web
                  </a>
                </div>
              </div>

              {/* SMS Template */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>Modelo SMS Curto</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(dynamicSms, 'msg-sms')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'msg-sms' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'msg-sms' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg text-xs font-mono text-slate-200 border border-slate-800">
                  {dynamicSms}
                </div>
              </div>

              {/* Email Template */}
              <div className="bg-slate-800/40 border border-slate-700/80 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-xs">
                    <Mail className="w-4 h-4" />
                    <span>Modelo de E-mail de Feedback</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(`${place.links.emailTemplate.subject}\n\n${place.links.emailTemplate.body}`, 'msg-email')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    {copiedKey === 'msg-email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'msg-email' ? 'Copiado!' : 'Copiar E-mail'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 border border-slate-800 whitespace-pre-line">
                  <span className="font-semibold text-white">Assunto:</span> {place.links.emailTemplate.subject}
                  {'\n\n'}
                  {place.links.emailTemplate.body}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API & Automation Payload */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-400">
                  Payload JSON retornado por <code>/api/places/{place.id}</code> pronto para automação (Make, Zapier, n8n, CRM):
                </p>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(place, null, 2), 'raw-json')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 rounded-lg flex items-center space-x-1"
                >
                  {copiedKey === 'raw-json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar JSON</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
                <pre className="font-mono text-xs text-emerald-400">
                  {JSON.stringify(
                    {
                      id: place.id,
                      name: place.name,
                      address: place.address,
                      rating: place.rating,
                      userRatingCount: place.userRatingCount,
                      links: place.links,
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              <div className="bg-blue-950/30 border border-blue-800/40 p-3 rounded-xl flex items-start space-x-3 text-xs text-blue-200">
                <Code2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white">Endpoint de Automação Direto:</span>
                  <p className="font-mono text-[11px] text-blue-300 mt-1 select-all">
                    GET {window.location.origin}/api/places/{place.id}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Identificador Google Places API (New)</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
