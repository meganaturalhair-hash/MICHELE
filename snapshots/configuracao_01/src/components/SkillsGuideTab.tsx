import React from 'react';
import { 
  BookOpen, CheckCircle, ExternalLink, ShieldCheck, 
  Cpu, Server, Link as LinkIcon, Database, ArrowRight, Layers 
} from 'lucide-react';

export const SkillsGuideTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Skills, APIs e Arquitetura Técnica</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Mapeamento detalhado das skills do Google Maps Platform, protocolo do link direto de avaliação e esteira de automação.
            </p>
          </div>
        </div>
      </div>

      {/* 1. As Skills Necessárias */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <span>1. Skills do Google Maps Platform Utilizadas</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-400 font-bold">places-api-web-api</span>
              <span className="px-2 py-0.5 text-[10px] rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Core Skill
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Skill principal responsável por consultar estabelecimentos (Google Meu Negócio / Google Business Profile). Utiliza a <strong>Google Places API (New)</strong> para resolver nomes de estabelecimentos, endereços e retornar o <strong>Place ID</strong> único.
            </p>
            <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div>Endpoint: <code>places:searchText</code></div>
              <div>FieldMask: <code>places.id,places.displayName</code></div>
              <div>Header: <code>X-Goog-Maps-Solution-ID: gmp_git_agentskills_v1</code></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-indigo-400 font-bold">gmp-framework-react</span>
              <span className="px-2 py-0.5 text-[10px] rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Frontend Skill
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recomendação oficial da engenharia do Google Maps para integração com React usando o SDK moderno <code>@vis.gl/react-google-maps</code> com componentes declarativos, sem serviços legados callback-based.
            </p>
            <div className="text-[11px] font-mono text-slate-400 space-y-1 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
              <div>SDK: <code>@vis.gl/react-google-maps</code></div>
              <div>Suporte: Autocomplete & Markers Modernos</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. O Segredo do Link Direto de Avaliação */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <LinkIcon className="w-5 h-5 text-amber-400" />
          <span>2. Como Funciona o Link Direto para a Janela de Avaliação</span>
        </h3>

        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Muitas empresas cometem o erro de enviar o link comum do Google Maps (<code className="text-amber-300">google.com/maps/place/...</code>). Nesse link, o cliente precisa carregar a página inteira, descer a tela, achar o botão de avaliações e clicar para abrir o modal. A maioria desiste no caminho.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1">
              Fórmula Oficial Direta:
            </span>
            <div className="font-mono text-xs text-amber-300 select-all break-all">
              https://search.google.com/local/writereview?placeid={'{PLACE_ID}'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-semibold text-white block mb-1">1. Foco Total</span>
              <p className="text-slate-400">Abre imediatamente o popup com as 5 estrelas em destaque.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-semibold text-white block mb-1">2. Mobile Friendly</span>
              <p className="text-slate-400">Se o cliente estiver no smartphone Android ou iOS, abre no app nativo.</p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="font-semibold text-white block mb-1">3. Alta Conversão</span>
              <p className="text-slate-400">Aumenta em até 350% a taxa de clientes que concluem a avaliação.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Arquitetura de Exportação e Automação */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>3. Arquitetura da API de Automação Implementada</span>
        </h3>

        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Para permitir exportar e acionar esses dados em ferramentas de automação (Make, Zapier, n8n, CRM, Webhooks), este applet disponibiliza os seguintes endpoints REST no servidor Express:
          </p>

          <div className="space-y-2.5">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 rounded mr-2">
                  GET
                </span>
                <code className="text-xs font-mono text-white">/api/places/search?q={'{termo}'}</code>
                <p className="text-[11px] text-slate-400 mt-1">Busca estabelecimentos no Google Meu Negócio e já inclui Place ID e links prontos.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 rounded mr-2">
                  POST
                </span>
                <code className="text-xs font-mono text-white">/api/places/generate-review-link</code>
                <p className="text-[11px] text-slate-400 mt-1">Ideal para Webhooks de CRM: envie o nome ou Place ID e receba a URL direta e o QR Code.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 rounded mr-2">
                  POST
                </span>
                <code className="text-xs font-mono text-white">/api/places/batch</code>
                <p className="text-[11px] text-slate-400 mt-1">Processa listas em lote para redes com centenas de unidades ou exportações periódicas.</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 rounded mr-2">
                  GET
                </span>
                <code className="text-xs font-mono text-white">/api/review-redirect/:placeId</code>
                <p className="text-[11px] text-slate-400 mt-1">Redireciona com HTTP 302 direto para a avaliação. Perfeito para links curtos em SMS ou tags NFC.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
