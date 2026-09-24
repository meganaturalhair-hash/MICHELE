import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, ExternalLink, Copy, Check, QrCode, 
  Sparkles, ArrowRight, Loader2, AlertCircle, Building2, Store
} from 'lucide-react';
import { PlaceResult } from '../types';

interface SearchTabProps {
  onSelectPlace: (place: PlaceResult) => void;
}

export const SearchTab: React.FC<SearchTabProps> = ({ onSelectPlace }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickPlaceId, setQuickPlaceId] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  // Suggestions for quick testing
  const suggestions = [
    'Mega Natural Hair São Paulo',
    'Restaurante Fasano Jardins',
    'Padaria Bella Paulista',
    'Dengo Chocolates Pinheiros',
    'Hospital Albert Einstein Morumbi',
  ];

  const handleSearch = async (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(term)}`);
      if (!res.ok) {
        throw new Error(`Erro na busca (${res.status})`);
      }
      const data = await res.json();
      setResults(data.places || []);
      if ((data.places || []).length === 0) {
        setError(`Nenhum estabelecimento encontrado para "${term}". Tente adicionar a cidade ou bairro.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Falha ao buscar estabelecimentos no Google Meu Negócio.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPlaceIdLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlaceId.trim()) return;

    setQuickLoading(true);
    try {
      const res = await fetch(`/api/places/${encodeURIComponent(quickPlaceId.trim())}`);
      if (!res.ok) {
        throw new Error('Place ID inválido ou não encontrado.');
      }
      const placeData = await res.json();
      onSelectPlace(placeData);
    } catch (err: any) {
      alert(err.message || 'Erro ao consultar Place ID');
    } finally {
      setQuickLoading(false);
    }
  };

  const copyReviewLink = (e: React.MouseEvent, place: PlaceResult) => {
    e.stopPropagation();
    navigator.clipboard.writeText(place.links.directReviewUrl);
    setCopiedId(place.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-8 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Meu Negócio &bull; Google Maps Platform Places API</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Encontre o Estabelecimento e gere o{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              Link Direto de Avaliação 5 Estrelas
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Pesquise qualquer empresa no Google, extraia o identificador único <code>Place ID</code>, gere o link direto que abre a caixa de avaliação com 1 clique e exporte tudo via API REST para integrar com <strong>Zapier, Make.com, n8n, CRMs e WhatsApp</strong>.
          </p>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="mt-6 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome da empresa, loja, salão, restaurante ou endereço..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-4 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <span>Localizar</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Suggestion Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Exemplos para testar:</span>
            {suggestions.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alternative: Already have a Place ID? */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Já possui o Place ID do Google?</h4>
            <p className="text-xs text-slate-400">Insira diretamente para gerar o link e o QR Code sem precisar buscar.</p>
          </div>
        </div>

        <form onSubmit={handleQuickPlaceIdLookup} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={quickPlaceId}
            onChange={(e) => setQuickPlaceId(e.target.value)}
            placeholder="Ex: ChIJ... (Place ID)"
            className="flex-1 md:w-64 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={quickLoading || !quickPlaceId.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white transition-all cursor-pointer whitespace-nowrap"
          >
            {quickLoading ? 'Carregando...' : 'Gerar Direto'}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              <span>Estabelecimentos Encontrados ({results.length})</span>
            </h3>
            <span className="text-xs text-slate-400">
              Clique no cartão para ver o QR Code, templates e parâmetros de API
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((place) => (
              <div
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="group relative bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-lg hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-400 flex items-center mt-1">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 flex-shrink-0" />
                        <span className="line-clamp-1">{place.address}</span>
                      </p>
                    </div>

                    {place.rating && (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{place.rating.toFixed(1)}</span>
                        <span className="text-[11px] text-amber-400/70 font-normal">({place.userRatingCount || 0})</span>
                      </div>
                    )}
                  </div>

                  {/* Direct Link Preview Box */}
                  <div className="mt-4 bg-slate-950/70 rounded-xl p-3 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-blue-400">Link Direto de Avaliação</span>
                      <span className="font-mono text-[10px] text-slate-500">writereview</span>
                    </div>
                    <p className="font-mono text-xs text-slate-300 truncate">
                      {place.links.directReviewUrl}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => copyReviewLink(e, place)}
                    className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-semibold border border-blue-500/30 hover:border-transparent transition-all cursor-pointer"
                  >
                    {copiedId === place.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlace(place);
                    }}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                    <span>QR Code</span>
                  </button>

                  <a
                    href={place.links.directReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs border border-slate-700 transition-all cursor-pointer"
                    title="Testar link no navegador"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Explanations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Search className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">1. Localização Precisa</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Utiliza o Google Places API (New) com atribuição governada para identificar o Perfil de Empresa (Google Meu Negócio) oficial e seu Place ID permanente.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <h4 className="font-bold text-white text-base">2. Link Direto sem Fricção</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Constrói a URL oficial <code>search.google.com/local/writereview?placeid=...</code> que abre o popup de 5 estrelas diretamente no celular do cliente.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-white text-base">3. Automação via API</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Endpoints REST prontos para disparar solicitações automáticas de avaliação via WhatsApp, SMS ou e-mail logo após um atendimento ou venda no seu CRM.
          </p>
        </div>
      </div>
    </div>
  );
};
