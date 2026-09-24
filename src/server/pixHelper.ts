/**
 * Gerador de Payload PIX Padrão EMVCo / Banco Central do Brasil
 */

function crc16(str: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;
  const bytes = Buffer.from(str, 'utf-8');

  for (let i = 0; i < bytes.length; i++) {
    for (let j = 0; j < 8; j++) {
      const bit = ((bytes[i] >> (7 - j)) & 1) === 1;
      const c15 = ((crc >> 15) & 1) === 1;
      crc <<= 1;
      if (c15 !== bit) crc ^= polynomial;
    }
  }

  crc &= 0xffff;
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function emvField(id: string, value: string): string {
  const len = Buffer.byteLength(value, 'utf-8');
  const lenStr = len.toString().padStart(2, '0');
  return `${id}${lenStr}${value}`;
}

export function generatePixPayload(params: {
  chave: string;
  beneficiario: string;
  cidade: string;
  valor?: number;
  identificador?: string;
}): string {
  const { chave, beneficiario, cidade, valor, identificador = '***' } = params;

  // Normaliza textos (sem acentos e comprimentos máximos)
  const normNome = beneficiario
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .slice(0, 25)
    .toUpperCase();
  const normCidade = cidade
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .slice(0, 15)
    .toUpperCase();

  // Payload format indicator
  let payload = emvField('00', '01');

  // Point of Initiation Method (12 = dinâmico, 11 = estático)
  payload += emvField('01', '11');

  // Merchant Account Information (PIX)
  const gui = emvField('00', 'br.gov.bcb.pix');
  const key = emvField('01', chave.trim());
  payload += emvField('26', `${gui}${key}`);

  // Merchant Category Code (0000 = padrão)
  payload += emvField('52', '0000');

  // Transaction Currency (986 = BRL)
  payload += emvField('53', '986');

  // Transaction Amount (opcional)
  if (valor && valor > 0) {
    payload += emvField('54', valor.toFixed(2));
  }

  // Country Code (BR)
  payload += emvField('58', 'BR');

  // Merchant Name
  payload += emvField('59', normNome || 'RECEBEDOR');

  // Merchant City
  payload += emvField('60', normCidade || 'BRASIL');

  // Additional Data Field Template (TXID)
  const txid = emvField('05', identificador);
  payload += emvField('62', txid);

  // CRC16 Placeholder
  const payloadToCrc = `${payload}6304`;
  const crc = crc16(payloadToCrc);

  return `${payloadToCrc}${crc}`;
}
