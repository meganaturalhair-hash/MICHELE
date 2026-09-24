import React, { useState } from 'react';
import { 
  Terminal, Code2, Copy, Check, Play, Send, Zap, 
  Workflow, ArrowRight, Layers, FileJson, CheckCircle2 
} from 'lucide-react';

export const ApiAutomationTab: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'search' | 'details' | 'generate' | 'batch' | 'redirect'>('search');
  const [testParam, setTestParam] = useState('Mega Natural Hair');
  const [loading, setLoading] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'js' | 'python' | 'make' | 'zapier'>('curl');

  const origin = window.location.origin;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestApi = async () => {
    setLoading(true);
    setResponseStatus(null);
    setResponsePayload(null);

    try {
      let url = '';
      let options: RequestInit = { method: 'GET' };

      if (selectedEndpoint === 'search') {
        url = `/api/places/search?q=${encodeURIComponent(testParam || 'Padaria Bella Paulista')}`;
      } else if (selectedEndpoint === 'details') {
        url = `/api/places/${encodeURIComponent(testParam || 'ChIJ66V9WCVYzpQRr3m-k6i-zZ4')}`;
      } else if (selectedEndpoint === 'generate') {
        url = '/api/places/generate-review-link';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: testParam || 'Padaria Bella Paulista' }),
        };
      } else if (selectedEndpoint === 'batch') {
        url = '/api/places/batch';
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [testParam || 'Padaria Bella Paulista SP', 'Restaurante Fasano SP'],
          }),
        };
      } else if (selectedEndpoint === 'redirect') {
        url = `/api/review-redirect/${encodeURIComponent(testParam || 'ChIJ66V9WCVYzpQRr3m-k6i-zZ4')}`;
      }

      const res = await fetch(url, options);
      setResponseStatus(res.status);

      if (selectedEndpoint === 'redirect') {
        setResponsePayload({
          status: 'HTTP 302 Redirect',
          targetUrl: `https://search.google.com/local/writereview?placeid=${testParam}`,
        });
      } else {
        const json = await res.json();
        setResponsePayload(json);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponsePayload({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Generate code snippet dynamically based on selected endpoint and lang
  const getCodeSnippet = () => {
    const baseUrl = origin;
    if (activeCodeLang === 'curl') {
      if (selectedEndpoint === 'search') {
        return `curl -X GET "${baseUrl}/api/places/search?q=${encodeURIComponent(testParam)}" \\\n  -H "Accept: application/json"`;
      }
      if (selectedEndpoint === 'generate') {
        return `curl -X POST "${baseUrl}/api/places/generate-review-link" \\\n  -H "Content-Type: application/json" \\\n  -d '{"query": "${testParam}"}'`;
      }
      if (selectedEndpoint === 'batch') {
        return `curl -X POST "${baseUrl}/api/places/batch" \\\n  -H "Content-Type: application/json" \\\n  -d '{"items": ["${testParam}", "Restaurante Fasano"]}'`;
      }
      return `curl -X GET "${baseUrl}/api/places/${testParam}" \\\n  -H "Accept: application/json"`;
    }

    if (activeCodeLang === 'js') {
      return `// JavaScript / Node.js
const fetchReviewLink = async (businessName) => {
  const response = await fetch('${baseUrl}/api/places/generate-review-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: businessName })
  });
  
  const data = await response.json();
  console.log("Link Direto de Avaliação:", data.directReviewUrl);
  console.log("Mensagem WhatsApp:", data.whatsappMessage);
  return data;
};

fetchReviewLink('${testParam}');`;
    }

    if (activeCodeLang === 'python') {
      return `# Python (requests)
import requests

def get_google_review_link(business_query):
    url = f"${baseUrl}/api/places/generate-review-link"
    payload = {"query": business_query}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    data = response.json()
    
    print("Link de Avaliação:", data.get("directReviewUrl"))
    print("Place ID:", data.get("placeId"))
    return data

result = get_google_review_link("${testParam}")`;
    }

    if (activeCodeLang === 'make') {
      return `// Configuração no Make.com (Integromat)
1. Adicione o módulo "HTTP - Make a request"
2. URL: ${baseUrl}/api/places/generate-review-link
3. Method: POST
4. Headers:
   - Content-Type: application/json
5. Body type: Raw
6. Content type: JSON (application/json)
7. Request content:
   {
     "query": "{{1.businessName}}"
   }
8. Mapeie a saída:
   - {{data.directReviewUrl}} para envio no WhatsApp (Z-API / Evolution / Twilio)`;
    }

    if (activeCodeLang === 'zapier') {
      return `// Configuração no Zapier
1. Crie uma ação "Webhooks by Zapier" -> "Custom Request"
2. Method: POST
3. URL: ${baseUrl}/api/places/generate-review-link
4. Data:
   {
     "query": "Nome da Empresa ou Place ID"
   }
5. Headers:
   Content-Type: application/json
6. Próximo passo no Zap: Enviar mensagem SMS/WhatsApp com a variável data.directReviewUrl`;
    }

    return '';
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">API REST & Webhooks para Automação</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Conecte seu CRM, ERP, WhatsApp Bot ou ferramentas no-code (Zapier, Make, n8n) para disparar pedidos automáticos de avaliação 5 estrelas.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Sandbox & Code Snippets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Endpoints & Interactive Tester (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Testador Interativo de Endpoints</span>
            </h3>

            {/* Endpoint Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setSelectedEndpoint('search');
                  setTestParam('Mega Natural Hair');
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedEndpoint === 'search'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[10px] text-emerald-400">GET /search</div>
                <div className="truncate">Busca por Termo</div>
              </button>

              <button
                onClick={() => {
                  setSelectedEndpoint('generate');
                  setTestParam('Restaurante Fasano Jardins');
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedEndpoint === 'generate'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[10px] text-blue-400">POST /generate</div>
                <div className="truncate">Gerar Link Direto</div>
              </button>

              <button
                onClick={() => {
                  setSelectedEndpoint('batch');
                  setTestParam('Padaria Bella Paulista');
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedEndpoint === 'batch'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[10px] text-purple-400">POST /batch</div>
                <div className="truncate">Processar Lote</div>
              </button>

              <button
                onClick={() => {
                  setSelectedEndpoint('details');
                  setTestParam('ChIJ66V9WCVYzpQRr3m-k6i-zZ4');
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedEndpoint === 'details'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[10px] text-amber-400">GET /:placeId</div>
                <div className="truncate">Detalhes & QR Code</div>
              </button>

              <button
                onClick={() => {
                  setSelectedEndpoint('redirect');
                  setTestParam('ChIJ66V9WCVYzpQRr3m-k6i-zZ4');
                }}
                className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all ${
                  selectedEndpoint === 'redirect'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-mono text-[10px] text-rose-400">GET /redirect</div>
                <div className="truncate">Redirecionamento 302</div>
              </button>
            </div>

            {/* Input Param */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {selectedEndpoint === 'details' || selectedEndpoint === 'redirect'
                  ? 'Parâmetro: Place ID'
                  : 'Parâmetro: Nome da Empresa / Busca'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testParam}
                  onChange={(e) => setTestParam(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleTestApi}
                  disabled={loading || !testParam.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center space-x-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {loading ? (
                    <span>Testando...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Executar</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Response Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">Resposta da API:</span>
                {responseStatus && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    Status {responseStatus}
                  </span>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-h-80 overflow-y-auto font-mono text-xs">
                {responsePayload ? (
                  <pre className="text-emerald-400">{JSON.stringify(responsePayload, null, 2)}</pre>
                ) : (
                  <div className="text-slate-600 text-center py-8">
                    Clique em &quot;Executar&quot; para enviar a requisição e ver o JSON em tempo real.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code Snippets & Guides (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Exemplo de Integração</span>
              </h3>
              <button
                onClick={() => copyToClipboard(getCodeSnippet(), 'code-snippet')}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
              >
                {copiedKey === 'code-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'code-snippet' ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(['curl', 'js', 'python', 'make', 'zapier'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveCodeLang(lang)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    activeCodeLang === lang
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'js' ? 'Node.js' : lang === 'make' ? 'Make.com' : lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Code Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-96">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

          {/* Integration Workflow Cards */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2">
              <Workflow className="w-4 h-4 text-indigo-400" />
              <span>Casos de Uso em Automação</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-400">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Disparo via WhatsApp pós-visita:</span>
                  <p className="mt-0.5">Após a finalização do pedido no seu sistema, o webhook obtém o link e envia a mensagem automática.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Enriquecimento no CRM:</span>
                  <p className="mt-0.5">Preencha o Place ID e a URL direta de avaliação no cadastro da empresa para uso pela equipe de CS.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-200">Totens e Recibos Fiscais:</span>
                  <p className="mt-0.5">Gere o QR Code dinamicamente para impressão no comprovante de compra dos clientes.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
