import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Key resolution (supports VITE_GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_API_KEY, or demo key fallback)
const getApiKey = () => {
  return (
    process.env.VITE_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    'AIzaSyAJikRF_u6xcscfE5wuk8NFvFTTJicScOw'
  );
};

// Solution ID as required by Google Maps Platform Agent Skills
const SOLUTION_ID = 'gmp_git_agentskills_v1';

// Helper to construct official direct review URLs
export function formatReviewLinks(placeId: string, displayName?: string) {
  const directReviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
  const mapsPlaceUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`;
  const reviewRedirectUrl = `/api/review-redirect/${placeId}`;
  
  return {
    placeId,
    directReviewUrl,
    mapsPlaceUrl,
    reviewRedirectUrl,
    whatsappMessage: `Olá! Agradecemos pela sua preferência${displayName ? ` no(a) ${displayName}` : ''}. Sua opinião é muito importante para nós! Poderia nos avaliar no Google com 5 estrelas? Leva menos de 1 minuto: ${directReviewUrl}`,
    smsMessage: `Olá! Conte como foi sua experiência${displayName ? ` no(a) ${displayName}` : ''}: ${directReviewUrl}`,
    emailTemplate: {
      subject: `Como foi sua experiência${displayName ? ` no(a) ${displayName}` : ''}? Avalie-nos no Google!`,
      body: `Olá,\n\nAgradecemos muito por escolher o(a) ${displayName || 'nosso estabelecimento'}.\n\nSe você gostou do nosso atendimento, poderia deixar uma rápida avaliação no Google? Isso nos ajuda imensamente!\n\nClique no link abaixo para avaliar:\n${directReviewUrl}\n\nMuito obrigado!`,
    },
  };
}

// ----------------------------------------------------
// REST API Endpoints for Automation
// ----------------------------------------------------

// 1. Health check & configuration metadata
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Google Business Review Link & Automation API',
    version: '1.0.0',
    hasApiKey: Boolean(getApiKey()),
  });
});

// 2. Search places by text query (New Places API: places:searchText)
app.get('/api/places/search', async (req, res) => {
  const query = (req.query.q as string || req.query.query as string || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Parâmetro de busca "q" ou "query" é obrigatório.' });
  }

  const apiKey = getApiKey();
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.websiteUri,places.nationalPhoneNumber,places.types,places.location,places.regularOpeningHours',
        'X-Goog-Maps-Solution-ID': SOLUTION_ID,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'pt-BR',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Erro na API do Google Places',
        details: errorText,
      });
    }

    const data = await response.json();
    const places = (data.places || []).map((p: any) => {
      const links = formatReviewLinks(p.id, p.displayName?.text);
      return {
        id: p.id,
        name: p.displayName?.text || 'Sem nome',
        address: p.formattedAddress || '',
        rating: p.rating || null,
        userRatingCount: p.userRatingCount || 0,
        googleMapsUri: p.googleMapsUri || '',
        websiteUri: p.websiteUri || '',
        phone: p.nationalPhoneNumber || '',
        types: p.types || [],
        location: p.location || null,
        openNow: p.regularOpeningHours?.openNow ?? null,
        links,
      };
    });

    res.json({
      query,
      total: places.length,
      places,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Falha ao buscar estabelecimentos', message: error.message });
  }
});

// 3. Get place details & review automation package
app.get('/api/places/:placeId', async (req, res) => {
  const { placeId } = req.params;
  if (!placeId) {
    return res.status(400).json({ error: 'placeId é obrigatório' });
  }

  const apiKey = getApiKey();
  try {
    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,websiteUri,nationalPhoneNumber,internationalPhoneNumber,types,location,regularOpeningHours,editorialSummary',
          'X-Goog-Maps-Solution-ID': SOLUTION_ID,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Erro ao obter dados do estabelecimento',
        details: errorText,
      });
    }

    const p = await response.json();
    const links = formatReviewLinks(p.id, p.displayName?.text);

    // Generate QR Code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(links.directReviewUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    res.json({
      id: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      rating: p.rating || null,
      userRatingCount: p.userRatingCount || 0,
      googleMapsUri: p.googleMapsUri || '',
      websiteUri: p.websiteUri || '',
      phone: p.nationalPhoneNumber || p.internationalPhoneNumber || '',
      types: p.types || [],
      location: p.location || null,
      summary: p.editorialSummary?.text || '',
      openNow: p.regularOpeningHours?.openNow ?? null,
      links,
      qrCodeDataUrl,
    });
  } catch (error: any) {
    console.error('Details error:', error);
    res.status(500).json({ error: 'Falha ao buscar detalhes do local', message: error.message });
  }
});

// 4. Instant Review Link Generator by Place ID or Query
app.post('/api/places/generate-review-link', async (req, res) => {
  const { placeId, query, businessName } = req.body;

  if (placeId) {
    const links = formatReviewLinks(placeId, businessName);
    const qrCodeDataUrl = await QRCode.toDataURL(links.directReviewUrl, { width: 300, margin: 2 });
    return res.json({
      status: 'success',
      ...links,
      qrCodeDataUrl,
    });
  }

  if (query) {
    // Lookup place first
    const apiKey = getApiKey();
    try {
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
          'X-Goog-Maps-Solution-ID': SOLUTION_ID,
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
      });

      const data = await response.json();
      const place = data.places?.[0];
      if (!place) {
        return res.status(404).json({ error: 'Nenhum estabelecimento encontrado com este termo.' });
      }

      const links = formatReviewLinks(place.id, place.displayName?.text);
      const qrCodeDataUrl = await QRCode.toDataURL(links.directReviewUrl, { width: 300, margin: 2 });

      return res.json({
        status: 'success',
        matchedBusiness: {
          id: place.id,
          name: place.displayName?.text,
          address: place.formattedAddress,
        },
        ...links,
        qrCodeDataUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Erro ao resolver local', message: err.message });
    }
  }

  return res.status(400).json({ error: 'Forneça "placeId" ou "query" no corpo da requisição.' });
});

// 5. Batch Automation Endpoint (for Zapier, Make, n8n, CRM pipelines)
app.post('/api/places/batch', async (req, res) => {
  const { items } = req.body; // array of string queries or objects with { query or placeId, customerName, etc. }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O corpo deve conter um array "items" com nomes ou placeIds.' });
  }

  const results = [];
  const apiKey = getApiKey();

  for (const item of items.slice(0, 50)) { // limit to 50 for safety
    try {
      let placeId = typeof item === 'string' ? '' : item.placeId;
      let name = typeof item === 'string' ? item : (item.name || item.query);

      if (!placeId && name) {
        const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
            'X-Goog-Maps-Solution-ID': SOLUTION_ID,
          },
          body: JSON.stringify({ textQuery: name, maxResultCount: 1 }),
        });
        const d = await resp.json();
        const found = d.places?.[0];
        if (found) {
          placeId = found.id;
          name = found.displayName?.text || name;
        }
      }

      if (placeId) {
        const links = formatReviewLinks(placeId, name);
        results.push({
          success: true,
          input: item,
          businessName: name,
          ...links,
        });
      } else {
        results.push({
          success: false,
          input: item,
          error: 'Estabelecimento não encontrado',
        });
      }
    } catch (e: any) {
      results.push({
        success: false,
        input: item,
        error: e.message,
      });
    }
  }

  res.json({
    totalProcessed: results.length,
    results,
  });
});

// 6. Direct HTTP Redirect to Review Modal (ideal for short SMS/WhatsApp URLs & QR tags)
app.get('/api/review-redirect/:placeId', (req, res) => {
  const { placeId } = req.params;
  const target = `https://search.google.com/local/writereview?placeid=${placeId}`;
  res.redirect(302, target);
});

// ----------------------------------------------------
// Plaquinhas & Clientes Database Endpoints (#1000+)
// ----------------------------------------------------
import { 
  readPlaquinhas, 
  createPlaquinha, 
  updatePlaquinha, 
  deletePlaquinha, 
  getNextPlaquinhaId,
  recordCountScan,
  createBatchPlaquinhas,
  readSettings,
  saveSettings
} from './src/server/plaquinhasStore.ts';
import { generatePixPayload } from './src/server/pixHelper.ts';

// Helper to determine the public base URL for permanent QR codes and NFC chips
export function getAppHost(req: express.Request): string {
  const settings = readSettings();
  if (settings.customDomain && settings.customDomain.trim()) {
    return settings.customDomain.trim().replace(/\/$/, '');
  }
  const forwardedProto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol);
  const forwardedHost = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  return `${forwardedProto}://${forwardedHost}`;
}

// ----------------------------------------------------
// DYNAMIC QR & NFC REDIRECT ROUTE (/r/:id)
// Esta rota é o endereço permanente impresso no QR Code físico e no chip NFC.
// Permite mudar o destino da plaquinha na hora da venda ou depois,
// sem precisar reimprimir o acrílico ou regravar o chip físico!
// ----------------------------------------------------
app.get('/r/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const list = readPlaquinhas();
  const item = list.find((p) => p.id === id);

  if (!item) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Plaquinha Não Encontrada</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #020617; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; text-align: center; }
            .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 24px; padding: 32px; max-width: 420px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            h2 { font-size: 20px; margin-bottom: 8px; }
            p { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
            a { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 12px; text-decoration: none; font-size: 14px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>Plaquinha #${id} Não Encontrada</h2>
            <p>Este número de identificação ainda não foi cadastrado no sistema.</p>
            <a href="/">Ir para o Painel</a>
          </div>
        </body>
      </html>
    `);
  }

  // Contabiliza a leitura do QR Code / NFC
  recordCountScan(id);

  // Se a placa estiver em estoque / aguardando ativação
  if (item.statusVenda === 'disponivel') {
    return res.redirect(302, `/p/${id}?status=disponivel`);
  }

  const modo = item.modoDestino || 'google_review';

  // 1. Redirecionamento Direto para Google Avaliação (5 Estrelas)
  if (modo === 'google_review') {
    const target = item.googleReviewUrl || (item.googlePlaceId ? `https://search.google.com/local/writereview?placeid=${item.googlePlaceId}` : null);
    if (target) {
      return res.redirect(302, target);
    }
  }

  // 2. Redirecionamento Direto para WhatsApp
  if (modo === 'whatsapp' && item.dadosModulos?.whatsapp?.numero) {
    const cleanNum = item.dadosModulos.whatsapp.numero.replace(/\D/g, '');
    const msg = encodeURIComponent(item.dadosModulos.whatsapp.mensagem || 'Olá!');
    return res.redirect(302, `https://wa.me/${cleanNum}?text=${msg}`);
  }

  // 3. Redirecionamento Direto para Instagram
  if (modo === 'instagram' && item.dadosModulos?.instagram?.usuario) {
    const handle = item.dadosModulos.instagram.usuario.replace('@', '').trim();
    return res.redirect(302, `https://instagram.com/${handle}`);
  }

  // 4. Redirecionamento Direto para Link Personalizado / Cardápio / Site
  if (modo === 'custom_url' && item.dadosModulos?.customUrl?.url) {
    return res.redirect(302, item.dadosModulos.customUrl.url);
  }

  // 5. Hub Inteligente da Loja (Página Mobile com Avaliação + PIX + Whats + Insta + Wi-Fi)
  return res.redirect(302, `/p/${id}`);
});


// Helper to format QR string for any module
export function generateModulePayload(type: string, data: any, host: string, plaquinhaId?: number): { rawPayload: string; displayTitle: string } {
  if (type === 'googleReview' && data.googleReviewUrl) {
    return { rawPayload: data.googleReviewUrl, displayTitle: 'Avaliação Google' };
  }
  if (type === 'hub' && plaquinhaId) {
    return { rawPayload: `${host}/p/${plaquinhaId}`, displayTitle: `Hub da Plaquinha #${plaquinhaId}` };
  }
  if (type === 'pix' && data.pix?.chave) {
    const pixPayload = generatePixPayload({
      chave: data.pix.chave,
      beneficiario: data.pix.beneficiario || 'BENEFICIARIO',
      cidade: data.pix.cidade || 'SAO PAULO',
      valor: data.pix.valor,
      identificador: `PLQ${plaquinhaId || 1000}`,
    });
    return { rawPayload: pixPayload, displayTitle: 'PIX Copia e Cola' };
  }
  if (type === 'whatsapp' && data.whatsapp?.numero) {
    const cleanNum = data.whatsapp.numero.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNum}?text=${encodeURIComponent(data.whatsapp.mensagem || 'Olá!')}`;
    return { rawPayload: url, displayTitle: 'WhatsApp' };
  }
  if (type === 'instagram' && data.instagram?.usuario) {
    const handle = data.instagram.usuario.replace('@', '').trim();
    return { rawPayload: `https://instagram.com/${handle}`, displayTitle: 'Instagram' };
  }
  if (type === 'wifi' && data.wifi?.ssid) {
    const sec = data.wifi.seguranca || 'WPA';
    const wifiStr = `WIFI:T:${sec};S:${data.wifi.ssid};P:${data.wifi.senha || ''};;`;
    return { rawPayload: wifiStr, displayTitle: 'Conexão Wi-Fi' };
  }
  if (type === 'vcard' && data.vcard?.nome) {
    const v = data.vcard;
    const vcardStr = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${v.nome}`,
      v.empresa ? `ORG:${v.empresa}` : '',
      v.cargo ? `TITLE:${v.cargo}` : '',
      v.telefone ? `TEL:${v.telefone}` : '',
      v.email ? `EMAIL:${v.email}` : '',
      v.site ? `URL:${v.site}` : '',
      'END:VCARD',
    ].filter(Boolean).join('\n');
    return { rawPayload: vcardStr, displayTitle: 'Contato vCard' };
  }
  if (type === 'customUrl' && data.customUrl?.url) {
    return { rawPayload: data.customUrl.url, displayTitle: data.customUrl.titulo || 'Link' };
  }

  return { rawPayload: data.url || `${host}/p/${plaquinhaId || 1000}`, displayTitle: 'Link' };
}

// 7. List all plaquinhas / clients
app.get('/api/plaquinhas', async (req, res) => {
  const list = readPlaquinhas();
  const nextId = getNextPlaquinhaId();
  const host = getAppHost(req);

  const enriched = await Promise.all(
    list.map(async (item) => {
      const dynamicRedirectUrl = `${host}/r/${item.id}`;
      let mainQrDataUrl = item.mainQrDataUrl;
      if (!mainQrDataUrl) {
        try {
          mainQrDataUrl = await QRCode.toDataURL(dynamicRedirectUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: {
              dark: item.designQr?.corFrente || '#0f172a',
              light: item.designQr?.corFundo || '#ffffff',
            },
          });
        } catch {
          // ignore
        }
      }
      return {
        ...item,
        dynamicRedirectUrl,
        mainQrDataUrl,
        nfcTargetUrl: dynamicRedirectUrl,
      };
    })
  );

  res.json({
    total: enriched.length,
    nextId,
    plaquinhas: enriched,
  });
});

// 8. Get specific plaquinha
app.get('/api/plaquinhas/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const list = readPlaquinhas();
  const item = list.find((p) => p.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }

  // A URL dinâmica permanente gravada no QR Code físico e no NFC é SEMPRE /r/:id
  const host = getAppHost(req);
  const dynamicRedirectUrl = `${host}/r/${item.id}`;

  const qrDataUrl = await QRCode.toDataURL(dynamicRedirectUrl, {
    width: 400,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: {
      dark: item.designQr?.corFrente || '#0f172a',
      light: item.designQr?.corFundo || '#ffffff',
    },
  });

  res.json({
    ...item,
    dynamicRedirectUrl,
    mainQrDataUrl: qrDataUrl,
    nfcTargetUrl: dynamicRedirectUrl,
  });
});

// Settings: Get & Update Production/Custom Domain
app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  const currentHost = getAppHost(req);
  const proto = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : req.protocol);
  const detectedHost = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  res.json({
    ...settings,
    currentHost,
    serverDetectedHost: `${proto}://${detectedHost}`
  });
});

app.post('/api/settings', (req, res) => {
  try {
    const { customDomain } = req.body;
    let formatted = (customDomain || '').trim();
    if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    formatted = formatted.replace(/\/$/, '');
    const saved = saveSettings({ customDomain: formatted });
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao salvar configurações', message: err.message });
  }
});

// 9. Batch Create Blank Plaquinhas for Stock
app.post('/api/plaquinhas/batch', (req, res) => {
  try {
    const { count = 10, tipoPlaquinha = 'acrilico', valorCobrado = 149.90 } = req.body;
    const qty = Math.min(Math.max(parseInt(count, 10) || 10, 1), 100);
    const created = createBatchPlaquinhas(qty, tipoPlaquinha, Number(valorCobrado) || 149.90);
    res.status(201).json({
      success: true,
      message: `${created.length} plaquinhas criadas com sucesso para estoque.`,
      created,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao criar lote de plaquinhas', message: err.message });
  }
});

// 10. Quick Update Destination Mode (Na hora da venda ou manutenção)
app.put('/api/plaquinhas/:id/destino', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { modoDestino, googleReviewUrl, googlePlaceId, customUrl, whatsapp, instagram, statusVenda, empresa, responsavel } = req.body;

  const updates: any = {};
  if (modoDestino) updates.modoDestino = modoDestino;
  if (googleReviewUrl) updates.googleReviewUrl = googleReviewUrl;
  if (googlePlaceId) updates.googlePlaceId = googlePlaceId;
  if (statusVenda) updates.statusVenda = statusVenda;
  if (empresa) updates.empresa = empresa;
  if (responsavel) updates.responsavel = responsavel;

  if (customUrl) {
    updates.dadosModulos = updates.dadosModulos || {};
    updates.dadosModulos.customUrl = customUrl;
    updates.modulosAtivos = updates.modulosAtivos || {};
    updates.modulosAtivos.customUrl = true;
  }

  if (whatsapp) {
    updates.dadosModulos = updates.dadosModulos || {};
    updates.dadosModulos.whatsapp = whatsapp;
    updates.modulosAtivos = updates.modulosAtivos || {};
    updates.modulosAtivos.whatsapp = true;
  }

  if (instagram) {
    updates.dadosModulos = updates.dadosModulos || {};
    updates.dadosModulos.instagram = instagram;
    updates.modulosAtivos = updates.modulosAtivos || {};
    updates.modulosAtivos.instagram = true;
  }

  const updated = updatePlaquinha(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }

  res.json({
    success: true,
    message: `Destino do QR Code #${id} atualizado para "${updates.modoDestino || updated.modoDestino}" com sucesso!`,
    plaquinha: updated,
  });
});

// 11. Create new client & plaquinha
app.post('/api/plaquinhas', async (req, res) => {
  try {
    const data = req.body;
    if (!data.empresa || !data.responsavel) {
      return res.status(400).json({ error: 'Nome da empresa e responsável são obrigatórios.' });
    }

    const host = `${req.protocol}://${req.get('host')}`;
    const nextId = getNextPlaquinhaId();

    // Auto Google Review URL if placeId provided
    let googleReviewUrl = data.googleReviewUrl;
    if (data.googlePlaceId && !googleReviewUrl) {
      googleReviewUrl = `https://search.google.com/local/writereview?placeid=${data.googlePlaceId}`;
    }

    // Auto PIX payload if PIX data provided
    if (data.dadosModulos?.pix?.chave) {
      data.dadosModulos.pix.payloadPix = generatePixPayload({
        chave: data.dadosModulos.pix.chave,
        beneficiario: data.dadosModulos.pix.beneficiario || data.empresa,
        cidade: data.dadosModulos.pix.cidade || data.cidade || 'SAO PAULO',
        valor: data.dadosModulos.pix.valor,
        identificador: `PLQ${nextId}`,
      });
    }

    const newPlaquinha = createPlaquinha({
      empresa: data.empresa,
      responsavel: data.responsavel,
      telefone: data.telefone || '',
      email: data.email || '',
      cidade: data.cidade || '',
      estado: data.estado || 'SP',
      endereco: data.endereco || '',
      tipoPlaquinha: data.tipoPlaquinha || 'acrilico',
      statusVenda: data.statusVenda || 'visitado',
      modoDestino: data.modoDestino || 'google_review',
      valorCobrado: data.valorCobrado || 149.90,
      dataVisita: data.dataVisita || new Date().toISOString().slice(0, 10),
      googlePlaceId: data.googlePlaceId || '',
      googleReviewUrl: googleReviewUrl || '',
      scansTotal: 0,
      modulosAtivos: {
        googleReview: Boolean(data.modulosAtivos?.googleReview ?? true),
        pix: Boolean(data.modulosAtivos?.pix),
        whatsapp: Boolean(data.modulosAtivos?.whatsapp),
        instagram: Boolean(data.modulosAtivos?.instagram),
        wifi: Boolean(data.modulosAtivos?.wifi),
        vcard: Boolean(data.modulosAtivos?.vcard),
        customUrl: Boolean(data.modulosAtivos?.customUrl),
      },
      dadosModulos: data.dadosModulos || {},
      designQr: data.designQr || {
        corFrente: '#0f172a',
        corFundo: '#ffffff',
        logoCentro: 'google',
      },
      nfcConfig: {
        gravado: false,
        tipoGravacao: data.nfcConfig?.tipoGravacao || 'landing_page_plaquinha',
        urlGravada: `${host}/r/${nextId}`,
      },
    });

    res.status(201).json(newPlaquinha);
  } catch (err: any) {
    console.error('Error creating plaquinha:', err);
    res.status(500).json({ error: 'Erro ao criar plaquinha', message: err.message });
  }
});

// 10. Update plaquinha
app.put('/api/plaquinhas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const updates = req.body;

  // Re-generate PIX payload if updated
  if (updates.dadosModulos?.pix?.chave) {
    updates.dadosModulos.pix.payloadPix = generatePixPayload({
      chave: updates.dadosModulos.pix.chave,
      beneficiario: updates.dadosModulos.pix.beneficiario || updates.empresa || 'RECEBEDOR',
      cidade: updates.dadosModulos.pix.cidade || updates.cidade || 'SAO PAULO',
      valor: updates.dadosModulos.pix.valor,
      identificador: `PLQ${id}`,
    });
  }

  const updated = updatePlaquinha(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }

  res.json(updated);
});

// 11. Delete plaquinha
app.delete('/api/plaquinhas/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const success = deletePlaquinha(id);
  if (!success) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }
  res.json({ success: true, message: `Plaquinha #${id} removida com sucesso.` });
});

// 12. Mark NFC as recorded
app.post('/api/plaquinhas/:id/nfc-recorded', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { urlGravada, tipoGravacao } = req.body;

  const updated = updatePlaquinha(id, {
    statusVenda: 'instalado',
    nfcConfig: {
      gravado: true,
      dataGravacao: new Date().toISOString(),
      tipoGravacao: tipoGravacao || 'landing_page_plaquinha',
      urlGravada: urlGravada || `/p/${id}`,
    },
  });

  if (!updated) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }

  res.json({ success: true, updated });
});

// 13. Dynamic QR Generator with Custom Styling
app.post('/api/generate-custom-qr', async (req, res) => {
  try {
    const { 
      type = 'custom', 
      payload, 
      plaquinhaId, 
      corFrente = '#0f172a', 
      corFundo = '#ffffff' 
    } = req.body;

    const host = getAppHost(req);
    let finalPayload = payload;

    if (!finalPayload && plaquinhaId) {
      const list = readPlaquinhas();
      const item = list.find((p) => p.id === Number(plaquinhaId));
      if (item) {
        finalPayload = generateModulePayload(type, item.dadosModulos, host, item.id).rawPayload;
      }
    }

    if (!finalPayload) {
      return res.status(400).json({ error: 'Payload ou plaquinhaId é obrigatório' });
    }

    const qrDataUrl = await QRCode.toDataURL(finalPayload, {
      width: 450,
      margin: 2,
      color: {
        dark: corFrente,
        light: corFundo,
      },
    });

    res.json({
      payload: finalPayload,
      qrDataUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Erro ao gerar QR Code customizado', message: err.message });
  }
});

// 14. Public Landing Page Data for /p/:id
app.get('/api/public/plaquinha/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const list = readPlaquinhas();
  const item = list.find((p) => p.id === id);

  if (!item) {
    return res.status(404).json({ error: 'Plaquinha não encontrada' });
  }

  // Pre-generate individual QR codes for active modules
  const qrCodes: Record<string, string> = {};

  if (item.modulosAtivos.pix && item.dadosModulos.pix?.payloadPix) {
    qrCodes.pix = await QRCode.toDataURL(item.dadosModulos.pix.payloadPix, { width: 300, margin: 2 });
  }

  if (item.modulosAtivos.wifi && item.dadosModulos.wifi?.ssid) {
    const wifiStr = `WIFI:T:${item.dadosModulos.wifi.seguranca || 'WPA'};S:${item.dadosModulos.wifi.ssid};P:${item.dadosModulos.wifi.senha || ''};;`;
    qrCodes.wifi = await QRCode.toDataURL(wifiStr, { width: 300, margin: 2 });
  }

  res.json({
    id: item.id,
    codigo: item.codigo,
    empresa: item.empresa,
    responsavel: item.responsavel,
    cidade: item.cidade,
    estado: item.estado,
    googleReviewUrl: item.googleReviewUrl,
    modoDestino: item.modoDestino || 'google_review',
    statusVenda: item.statusVenda || 'visitado',
    scansTotal: item.scansTotal || 0,
    ultimoScan: item.ultimoScan,
    modulosAtivos: item.modulosAtivos,
    dadosModulos: item.dadosModulos,
    qrCodes,
  });
});

// ----------------------------------------------------
// Frontend Mounting (Vite dev middleware vs static build)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
