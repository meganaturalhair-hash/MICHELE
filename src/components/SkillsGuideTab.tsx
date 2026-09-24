import React from 'react';
import { 
  BookOpen, CheckCircle, ExternalLink, ShieldCheck, 
  Cpu, Server, Link as LinkIcon, Database, ArrowRight, Layers, Radio, Sparkles, Smartphone 
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
            <h2 className="text-2xl font-bold text-white">Skills, NFC e Arquitetura de Plaquinhas</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Guia completo de tecnologias: Google Places API, Web NFC API para gravação de chips, gerador de QR Codes multifunção e banco de dados sequencial #1000+.
            </p>
          </div>
        </div>
      </div>

      {/* NOVO: 1. Como Funciona a Instalação no Chip NFC */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Radio className="w-5 h-5 text-indigo-400" />
          <span>1. Como Funciona a Gravação & Instalação no Chip NFC</span>
        </h3>

        <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-4">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            Sim! A web moderna possui a <strong>Web NFC API</strong> (padrão W3C implementado pelo Chrome/Chromium no Android). Essa API permite que a nossa própria aplicação web se comunique diretamente com a antena NFC do smartphone para **ler e gravar chips NFC** ao aproximar a plaquinha traseira do aparelho, sem precisar de nenhum app terceiro!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Chips Compatíveis</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tags padrão <strong>NTAG213</strong> (144 bytes), <strong>NTAG215</strong> (504 bytes) e <strong>NTAG216</strong> (888 bytes).
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Formato Gravado (NDEF)</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Gravamos um registro NDEF do tipo <strong>URI / URL</strong> apontando para o <em>Hub Inteligente #{'{ID}'}</em> ou para o link direto de avaliação.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Gravação em Campo</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Você pode visitar o cliente, abrir o app no Chrome do celular, tocar em <strong>"Gravar NFC"</strong> e encostar a plaquinha para finalizar a instalação na hora.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
            <span className="text-slate-500 text-[11px] font-sans font-bold block mb-1">Código de Execução Nativo:</span>
            <div>const ndef = new window.NDEFReader();</div>
            <div>await ndef.write({'{'} records: [{'{'} recordType: "url", data: targetUrl {'}'}] {'}'});</div>
          </div>
        </div>
      </div>

      {/* 2. O Hub Inteligente com Numeração #1000+ */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <span>2. Banco de Dados com Numeração a partir de #1000</span>
        </h3>

        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Cada plaquinha fabricada recebe um código sequencial exclusivo iniciando em <strong>#1000</strong> (ex: <code className="text-amber-400 font-mono">PLQ-1000</code>, <code className="text-amber-400 font-mono">PLQ-1001</code>...).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Vantagem do Hub Dinâmico (/p/1000)</span>
              <p className="text-slate-400 text-[11px]">
                Se o cliente mudar a chave PIX, o WhatsApp ou a senha do Wi-Fi daqui a 6 meses, você altera no painel e a plaquinha física continua funcionando perfeitamente sem precisar regravar o chip NFC!
              </p>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span className="font-bold text-white block mb-1">Rastreabilidade Comercial</span>
              <p className="text-slate-400 text-[11px]">
                Você sabe exatamente qual cliente comprou qual placa, quem é o responsável, telefone, data de instalação e quanto foi cobrado na venda.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Módulos & QR Codes Suportados */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span>3. Tipos de QR Codes Gerados na Plaquinha</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 flex items-center space-x-1">
              <span>⭐ Google Avaliações</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Abre diretamente o pop-up de 5 estrelas do Google Meu Negócio do estabelecimento.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center space-x-1">
              <span>💳 PIX Banco Central</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Payload EMVCo com CRC16 oficial. O cliente escaneia no app do banco e paga na hora.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-blue-400 flex items-center space-x-1">
              <span>📶 Wi-Fi Automático</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              A câmera do smartphone conecta na rede Wi-Fi sem o cliente precisar digitar a senha.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-green-400 flex items-center space-x-1">
              <span>💬 WhatsApp Direto</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Abre a conversa com o número do estabelecimento com mensagem pré-configurada.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-pink-400 flex items-center space-x-1">
              <span>📸 Instagram Oficial</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Encaminha direto para o perfil do Instagram da empresa para ganhar seguidores.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="font-bold text-indigo-400 flex items-center space-x-1">
              <span>📇 Cartão de Visita vCard</span>
            </span>
            <p className="text-slate-400 text-[11px]">
              Salva o contato completo do profissional na agenda do celular do cliente.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Skills do Google Maps Platform Utilizadas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <span>4. Skills do Google Maps Platform</span>
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
              Skill responsável por consultar estabelecimentos (Google Meu Negócio / Google Business Profile). Utiliza a <strong>Google Places API (New)</strong> para resolver nomes de estabelecimentos, endereços e retornar o <strong>Place ID</strong> único.
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
    </div>
  );
};
