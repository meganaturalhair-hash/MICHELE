import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/plaquinhas.json');
const SETTINGS_FILE = path.resolve(__dirname, '../../data/settings.json');

export interface AppSettings {
  customDomain?: string; // ex: "https://seusite.com.br"
}

export function readSettings(): AppSettings {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return {};
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

export function saveSettings(settings: AppSettings): AppSettings {
  try {
    if (!fs.existsSync(path.dirname(SETTINGS_FILE))) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
    return settings;
  } catch (err) {
    console.error('Error saving settings:', err);
    return settings;
  }
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
  tipoPlaquinha: 'acrilico' | 'madeira' | 'pvc' | 'metal' | 'adesivo' | 'chaveiro';
  statusVenda: 'disponivel' | 'visitado' | 'negociando' | 'pago' | 'instalado' | 'entregue';
  modoDestino: 'google_review' | 'hub' | 'whatsapp' | 'instagram' | 'custom_url';
  valorCobrado?: number;
  dataVisita: string;
  googlePlaceId?: string;
  googleReviewUrl?: string;
  scansTotal?: number;
  ultimoScan?: string;
  urlDinamica?: string;
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
  criadoEm?: string;
  atualizadoEm?: string;
  mainQrDataUrl?: string;
  dynamicRedirectUrl?: string;
}

export function readPlaquinhas(): PlaquinhaRecord[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading plaquinhas data:', err);
    return [];
  }
}

export function savePlaquinhas(list: PlaquinhaRecord[]): void {
  try {
    if (!fs.existsSync(path.dirname(DATA_FILE))) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving plaquinhas data:', err);
  }
}

export function getNextPlaquinhaId(): number {
  const list = readPlaquinhas();
  if (list.length === 0) return 1000;
  const maxId = Math.max(...list.map((p) => p.id || 999));
  return Math.max(maxId + 1, 1000);
}

export function createPlaquinha(record: Omit<PlaquinhaRecord, 'id' | 'codigo'>): PlaquinhaRecord {
  const list = readPlaquinhas();
  const nextId = getNextPlaquinhaId();
  const newRecord: PlaquinhaRecord = {
    ...record,
    id: nextId,
    codigo: `PLQ-${nextId}`,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  };

  list.unshift(newRecord);
  savePlaquinhas(list);
  return newRecord;
}

export function updatePlaquinha(id: number, updates: Partial<PlaquinhaRecord>): PlaquinhaRecord | null {
  const list = readPlaquinhas();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  list[index] = {
    ...list[index],
    ...updates,
    id, // preserve id
    codigo: `PLQ-${id}`,
    atualizadoEm: new Date().toISOString(),
  };

  savePlaquinhas(list);
  return list[index];
}

export function deletePlaquinha(id: number): boolean {
  const list = readPlaquinhas();
  const filtered = list.filter((p) => p.id !== id);
  if (filtered.length === list.length) return false;
  savePlaquinhas(filtered);
  return true;
}

export function recordCountScan(id: number): PlaquinhaRecord | null {
  const list = readPlaquinhas();
  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const currentScans = list[index].scansTotal || 0;
  list[index].scansTotal = currentScans + 1;
  list[index].ultimoScan = new Date().toISOString();

  savePlaquinhas(list);
  return list[index];
}

export function createBatchPlaquinhas(
  count: number = 10,
  tipoPlaquinha: PlaquinhaRecord['tipoPlaquinha'] = 'acrilico',
  valorCobrado: number = 149.90
): PlaquinhaRecord[] {
  const list = readPlaquinhas();
  const created: PlaquinhaRecord[] = [];

  for (let i = 0; i < count; i++) {
    const nextId = list.length === 0 ? 1000 : Math.max(...list.map((p) => p.id || 999)) + 1;
    const item: PlaquinhaRecord = {
      id: nextId,
      codigo: `PLQ-${nextId}`,
      empresa: `Plaquinha #${nextId} (Em Estoque)`,
      responsavel: 'Aguardando Venda / Cliente',
      telefone: '',
      cidade: '',
      estado: '',
      endereco: '',
      tipoPlaquinha,
      statusVenda: 'disponivel',
      modoDestino: 'google_review',
      valorCobrado,
      dataVisita: new Date().toISOString().slice(0, 10),
      googlePlaceId: '',
      googleReviewUrl: '',
      scansTotal: 0,
      modulosAtivos: {
        googleReview: true,
        pix: false,
        whatsapp: false,
        instagram: false,
        wifi: false,
        vcard: false,
        customUrl: false,
      },
      dadosModulos: {},
      designQr: {
        corFrente: '#0f172a',
        corFundo: '#ffffff',
        logoCentro: 'google',
      },
      nfcConfig: {
        gravado: false,
        tipoGravacao: 'landing_page_plaquinha',
        urlGravada: `/r/${nextId}`,
      },
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    list.unshift(item);
    created.push(item);
  }

  savePlaquinhas(list);
  return created;
}

