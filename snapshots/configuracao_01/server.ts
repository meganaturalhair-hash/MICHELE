import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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
