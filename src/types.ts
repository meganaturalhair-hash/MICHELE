export interface PlaceReviewLinks {
  placeId: string;
  directReviewUrl: string;
  mapsPlaceUrl: string;
  reviewRedirectUrl: string;
  whatsappMessage: string;
  smsMessage: string;
  emailTemplate: {
    subject: string;
    body: string;
  };
}

export interface PlaceResult {
  id: string;
  name: string;
  address: string;
  rating?: number | null;
  userRatingCount?: number;
  googleMapsUri?: string;
  websiteUri?: string;
  phone?: string;
  types?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  openNow?: boolean | null;
  links: PlaceReviewLinks;
  qrCodeDataUrl?: string;
  summary?: string;
}

export interface BatchItemResult {
  success: boolean;
  input: string | { name?: string; placeId?: string };
  placeId?: string;
  businessName?: string;
  directReviewUrl?: string;
  mapsPlaceUrl?: string;
  reviewRedirectUrl?: string;
  whatsappMessage?: string;
  smsMessage?: string;
  error?: string;
}

export type TipoPlaquinhaId = 
  | 'placa_10x15_madeira'
  | 'placa_10x15_base_virada'
  | 'placa_10x10_cola'
  | 'cartao_vcard'
  | 'tags_5x5_pequenas'
  | 'tags_redondas'
  | 'acrilico'
  | 'madeira'
  | 'pvc'
  | 'metal'
  | 'adesivo'
  | 'chaveiro'
  | string;

export interface TipoPlaquinhaCatalogo {
  id: string;
  nome: string;
  subtitulo: string;
  dimensoes: string;
  precoSugerido: number;
  badge?: string;
  icone: 'madeira' | 'base_virada' | 'adesivo' | 'vcard' | 'tag_quadrada' | 'tag_redonda' | string;
  material: string;
  destaque?: boolean;
}

export const TIPOS_PLAQUINHAS_CATALOGO: TipoPlaquinhaCatalogo[] = [
  {
    id: 'placa_10x15_madeira',
    nome: 'Plaquinha 10x15 com Base de Madeira',
    subtitulo: 'Acrílico cristal premium 10x15cm com base em madeira nobre maciça tratada',
    dimensoes: '10 x 15 cm',
    precoSugerido: 189.90,
    badge: 'Mais Vendida ⭐',
    icone: 'madeira',
    material: 'Acrílico Cristal + Madeira Nobre',
    destaque: true,
  },
  {
    id: 'placa_10x15_base_virada',
    nome: 'Plaquinha 10x15 Base Virada',
    subtitulo: 'Acrílico cristal 10x15cm dobrado a quente em L / base invertida autoportante',
    dimensoes: '10 x 15 cm',
    precoSugerido: 149.90,
    badge: 'Clássica Balcão',
    icone: 'base_virada',
    material: 'Acrílico Cristal Dobrado',
  },
  {
    id: 'placa_10x10_cola',
    nome: 'Plaquinha 10x10 com Cola',
    subtitulo: 'Placa compacta 10x10cm com fita dupla-face 3M para fixar em balcão, caixa, parede ou espelho',
    dimensoes: '10 x 10 cm',
    precoSugerido: 99.90,
    badge: 'Adesiva Balcão/Caixa',
    icone: 'adesivo',
    material: 'Acrílico / PVC com Adesivo 3M',
  },
  {
    id: 'cartao_vcard',
    nome: 'Cartão vCard (Cartão de Visita)',
    subtitulo: 'Cartão de visita PVC premium inteligente com NFC + QR Code que salva o contato na agenda',
    dimensoes: '8,5 x 5,4 cm (Cartão)',
    precoSugerido: 79.90,
    badge: 'vCard & Agenda',
    icone: 'vcard',
    material: 'PVC Inteligente NFC',
  },
  {
    id: 'tags_5x5_pequenas',
    nome: 'Tags 5x5 Pequenas',
    subtitulo: 'Mini plaquinha quadrada 5x5cm compacta com NFC + QR Code ideal para mesas, comandas ou displays',
    dimensoes: '5 x 5 cm',
    precoSugerido: 49.90,
    badge: 'Mesas & Displays',
    icone: 'tag_quadrada',
    material: 'Acrílico / PVC Compacto',
  },
  {
    id: 'tags_redondas',
    nome: 'Tags Redondas',
    subtitulo: 'Tag circular adesiva resinada / acrílica com NFC + QR Code para mesas de bar e superfícies redondas',
    dimensoes: 'Ø 5 cm circular',
    precoSugerido: 39.90,
    badge: 'Circular Adesiva',
    icone: 'tag_redonda',
    material: 'Resina / Adesivo Circular NFC',
  },
];

export function getTipoPlaquinhaInfo(tipoId?: string): TipoPlaquinhaCatalogo {
  if (!tipoId) return TIPOS_PLAQUINHAS_CATALOGO[1];
  const exact = TIPOS_PLAQUINHAS_CATALOGO.find((t) => t.id === tipoId);
  if (exact) return exact;
  // Legacy mappings
  if (tipoId === 'madeira') return TIPOS_PLAQUINHAS_CATALOGO[0];
  if (tipoId === 'acrilico') return TIPOS_PLAQUINHAS_CATALOGO[1];
  if (tipoId === 'adesivo' || tipoId === 'pvc') return TIPOS_PLAQUINHAS_CATALOGO[2];
  if (tipoId === 'chaveiro') return TIPOS_PLAQUINHAS_CATALOGO[3];
  return {
    id: tipoId,
    nome: tipoId.charAt(0).toUpperCase() + tipoId.slice(1),
    subtitulo: 'Modelo personalizado',
    dimensoes: 'Padrão',
    precoSugerido: 149.90,
    icone: 'base_virada',
    material: 'Acrílico',
  };
}

export interface PlaquinhaRecord {
  id: number; // 1000 em diante
  codigo: string; // "PLQ-1000"
  empresa: string;
  responsavel: string;
  telefone: string;
  email?: string;
  cidade: string;
  estado: string;
  endereco?: string;
  tipoPlaquinha: TipoPlaquinhaId;
  statusVenda: 'disponivel' | 'visitado' | 'negociando' | 'pago' | 'instalado' | 'entregue';
  modoDestino: 'google_review' | 'hub' | 'whatsapp' | 'instagram' | 'custom_url';
  valorCobrado?: number;
  dataVisita: string;
  googlePlaceId?: string;
  googleReviewUrl?: string;
  scansTotal?: number;
  ultimoScan?: string;
  urlDinamica?: string;
  dynamicRedirectUrl?: string;
  modulosAtivos: {
    googleReview: boolean;
    pix: boolean;
    whatsapp: boolean;
    instagram: boolean;
    wifi: boolean;
    vcard: boolean;
    customUrl: boolean;
  };
  dadosModulos: {
    pix?: {
      chave: string;
      tipo: 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria';
      beneficiario: string;
      cidade: string;
      valor?: number;
      payloadPix?: string;
    };
    whatsapp?: {
      numero: string;
      mensagem: string;
    };
    instagram?: {
      usuario: string;
      url: string;
    };
    wifi?: {
      ssid: string;
      senha: string;
      seguranca: 'WPA' | 'WEP' | 'nopass';
    };
    vcard?: {
      nome: string;
      empresa: string;
      cargo?: string;
      telefone: string;
      email?: string;
      site?: string;
    };
    customUrl?: {
      titulo: string;
      url: string;
    };
  };
  designQr?: {
    corFrente: string;
    corFundo: string;
    logoCentro: string;
  };
  nfcConfig?: {
    gravado: boolean;
    dataGravacao?: string;
    tipoGravacao: 'landing_page_plaquinha' | 'url_review_google' | 'pix' | 'whatsapp' | 'instagram' | 'vcard';
    urlGravada: string;
  };
  mainQrDataUrl?: string;
  nfcTargetUrl?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}

