import React, { useState } from 'react';
import { 
  Building2, Download, Copy, Check, Play, RefreshCw, 
  FileSpreadsheet, FileJson, AlertCircle, ArrowUpRight, Sparkles 
} from 'lucide-react';
import { BatchItemResult } from '../types';

export const BatchExportTab: React.FC = () => {
  const [inputText, setInputText] = useState(
    'Padaria Bella Paulista São Paulo\nRestaurante Fasano São Paulo\nHotel Unique São Paulo\nDengo Chocolates Pinheiros'
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchItemResult[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleRunBatch = async () => {
    const lines = inputText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/places/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: lines }),
      });

      if (!res.ok) {
        throw new Error(`Erro na API (${res.status})`);
      }

      const data = await res.json();
      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Falha ao processar lote');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const exportCSV = () => {
    if (results.length === 0) return;

    const headers = [
      'Estabelecimento',
      'Place_ID',
      'Link_Direto_Avaliacao',
      'Link_Google_Maps',
      'Mensagem_WhatsApp',
      'Status',
    ];

    const rows = results.map((r) => [
      `"${(r.businessName || String(r.input)).replace(/"/g, '""')}"`,
      `"${r.placeId || ''}"`,
      `"${r.directReviewUrl || ''}"`,
      `"${r.mapsPlaceUrl || ''}"`,
      `"${(r.whatsappMessage || '').replace(/"/g, '""')}"`,
      r.success ? 'Sucesso' : 'Falha',
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `google-review-links-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    if (results.length === 0) return;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `google-review-links-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Processamento em Lote & Exportação</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Exportação em Massa para Automação</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cole uma lista de nomes de estabelecimentos ou Place IDs para gerar automaticamente os links de avaliação e exportar em CSV ou JSON.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              disabled={results.length === 0}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all shadow-md shadow-emerald-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={exportJSON}
              disabled={results.length === 0}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white transition-all shadow-md shadow-indigo-600/20"
            >
              <FileJson className="w-4 h-4" />
              <span>Exportar JSON</span>
            </button>
          </div>
        </div>

        {/* Input box */}
        <div className="mt-6 space-y-3">
          <label className="text-xs font-semibold text-slate-300">
            Lista de Estabelecimentos (um por linha):
          </label>
          <textarea
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Exemplo:&#10;Padaria Bella Paulista SP&#10;Bar do Juarez Itaim&#10;Restaurante Mocotó Vila Medeiros"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500">
              {inputText.split('\n').filter((l) => l.trim()).length} itens informados
            </span>
            <button
              onClick={handleRunBatch}
              disabled={loading || !inputText.trim()}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center space-x-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Consultando Google Places API...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Processar Lista</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Resultados Processados ({results.length})</h3>
            <button
              onClick={() => copyToClipboard(results.map((r) => r.directReviewUrl).filter(Boolean).join('\n'), 'all-links')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              {copiedKey === 'all-links' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copiar Lista de Links</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Estabelecimento</th>
                  <th className="py-3 px-4">Place ID</th>
                  <th className="py-3 px-4">Link Direto de Avaliação</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {results.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-medium text-white max-w-[200px] truncate">
                      {r.businessName || String(r.input)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 select-all max-w-[150px] truncate">
                      {r.placeId || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-blue-400 max-w-[300px] truncate select-all">
                      {r.directReviewUrl ? (
                        <a href={r.directReviewUrl} target="_blank" rel="noreferrer" className="hover:underline">
                          {r.directReviewUrl}
                        </a>
                      ) : (
                        <span className="text-rose-400 font-sans">{r.error || 'Não localizado'}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      {r.directReviewUrl && (
                        <button
                          onClick={() => copyToClipboard(r.directReviewUrl!, `btn-${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
                        >
                          {copiedKey === `btn-${idx}` ? 'Copiado!' : 'Copiar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
