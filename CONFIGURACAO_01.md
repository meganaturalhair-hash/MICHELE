# 📦 Snapshot: Configuração 01 (configuração01)

**Data de Salvamento:** 2026-09-23  
**Status da Versão:** Estável, testada e compilada com sucesso.  
**Comando de Restauração:** Se você pedir *"volte a configuração01"*, este snapshot será restaurado integralmente.

---

## 📋 Resumo das Funcionalidades Salvas na Configuração 01

1. **Localizador Google Meu Negócio / Places:**
   - Busca em tempo real usando Google Places API (New) com governança e FieldMask enxuto.
   - Detecção do `place_id`, nome oficial, nota média, quantidade de avaliações, endereço, telefone e website.

2. **Gerador Automático de Link de Avaliação & QR Code:**
   - Link direto oficial: `https://search.google.com/local/writereview?placeid={place_id}` (abre diretamente o modal de 5 estrelas).
   - QR Code em tempo real (SVG/PNG para download e impressão em displays de balcão, mesas ou recibos).
   - Modelos prontos e personalizáveis para WhatsApp, SMS e E-mail.

3. **Backend Express com API REST para Automação:**
   - `GET /api/places/search?q={query}`
   - `GET /api/places/:placeId`
   - `POST /api/places/generate-review-link`
   - `POST /api/places/batch` (processamento em lote para listas de estabelecimentos)
   - `GET /api/review-redirect/:placeId` (redirecionamento HTTP 302 para links curtos)
   - `GET /api/health`

4. **Console Interativo & Exportação:**
   - Testador de API integrado na aba "API & Webhooks" com snippets em cURL, Node.js, Python, Make.com e Zapier.
   - Exportação em massa para CSV e JSON.
   - Documentação técnica completa das skills na aba "Skills & Guia".

---

## 📁 Arquivos Preservados no Diretório `/snapshots/configuracao_01/`

- `server.ts` (Servidor Express com rotas de API e integração com Vite)
- `package.json`
- `metadata.json`
- `index.html`
- `.env.example`
- `tsconfig.json`
- `vite.config.ts`
- `src/App.tsx`
- `src/types.ts`
- `src/components/Navbar.tsx`
- `src/components/SearchTab.tsx`
- `src/components/PlaceDetailModal.tsx`
- `src/components/BatchExportTab.tsx`
- `src/components/ApiAutomationTab.tsx`
- `src/components/SkillsGuideTab.tsx`
