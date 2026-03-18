// services/ticket.ts

export interface TicketResponse {
  success: boolean;
  message: string;
  data: string;
  errors: null;
  statusCode: number;
  timestamp: string;
}

const BASE_URL = 'http://198.71.58.84:5001/livinkApi/Locations';

const getToken = (): string => {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBsaXZpbmsuY29tIiwibmFtZSI6IkNhcmxvcyBBZG1pbmlzdHJhZG9yIiwianRpIjoiN2UzMzQ4MWYtOGNjMy00NWIxLTg3NGUtNDBiNDQ4NGMzMzlhIiwidXNlcklkIjoiMSIsInRlbmFudElkIjoiMSIsInRlbmFudENvZGUiOiJQVUVCTEEiLCJyb2xJZCI6IjEiLCJyb2xDb2RlIjoiU1VQRVJfQURNSU4iLCJyb2xOYW1lIjoiU3VwZXIgQWRtaW5pc3RyYWRvciIsInBlcm1pc3Npb24iOlsidXNlcnMuY3JlYXRlIiwidXNlcnMucmVhZCIsInVzZXJzLnVwZGF0ZSIsInVzZXJzLmRlbGV0ZSIsInJvbGVzLmNyZWF0ZSIsInJvbGVzLnJlYWQiLCJyb2xlcy51cGRhdGUiLCJyb2xlcy5kZWxldGUiLCJ0ZW5hbnRzLmNyZWF0ZSIsInRlbmFudHMucmVhZCIsInRlbmFudHMudXBkYXRlIiwidGVuYW50cy5kZWxldGUiLCJyZXBvcnRzLnZpZXciLCJyZXBvcnRzLmV4cG9ydCJdLCJleHAiOjE3NzM4NTg3NDQsImlzcyI6Ikxpdmlua0F1dGhTZXJ2aWNlIiwiYXVkIjoiTGl2aW5rTWljcm9zZXJ2aWNlcyJ9.iM0O85emYSsnlSQz5ENGltuAGz29g_ST7x2E78Y17xE";
};


 //Llama al backend
 
export async function fetchTicketInfraction(): Promise<TicketResponse> {
  const token = getToken();

  const url = `${BASE_URL}/ticket-infraction?userId=1&tenantId=1`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error API: ${res.status} ${text}`);
  }

  return await res.json();
}


  //Generador profesional ESC/POS
// Compatible 58mm y 80mm
 
export function buildEscPosTicket(rawText: string): string {
  
   let ticket = '';
 const MAX_CHARS = 48; // ancho del ticket
  // ==========================
  // ENCABEZADO
  // ==========================
/*
  ticket += '\x1B\x61\x01'; // Centrar
  ticket += '\x1D\x21\x11'; // Doble tamaño
  ticket += 'SECRETARÍA DE SEGURIDAD\n';
  ticket += 'PÚBLICA\n';
  ticket += '\x1D\x21\x00'; // Tamaño normal
  ticket += 'DEL ESTADO DE PUEBLA\n';
  ticket += '--------------------------------\n';
  */

  // Reset impresora
  ticket += '\x1B\x40';

  //TEXTO PEQUEÑO
  ticket += '\x1B\x4D\x01';

// ------------------- CUERPO -------------------
ticket += '\x1B\x61\x00'; // Alinear izquierda

const lines = rawText
  .replace(/\r/g, '')
  .split('\n')
  .map(l => l.trim())
  .filter(l => l.length > 0);

for (let line of lines) {

  // Centrar MOVILIDAD SEGURA y Operativo Móvil
  if (line.includes('MOVILIDAD SEGURA') || line.includes('Operativo Móvil')) {
    ticket += '\x1B\x61\x00'; // center
    ticket += '\x1B\x45\x01'; // bold
    ticket += line + '\n';
    ticket += '\x1B\x45\x00'; // quitar bold
    ticket += '\x1B\x61\x00'; // volver a izquierda
    continue;
  }

    // BLOQUE DE DATOS VEHÍCULO → solo izquierda
  if (
    line.startsWith('FOLIO:') ||
    line.startsWith('PLACAS:') ||
    line.startsWith('NIV:') ||
    line.startsWith('MARCA:') ||
    line.startsWith('LÍNEA:') ||
    line.startsWith('TIPO:') ||
    line.startsWith('AÑO:') ||
    line.startsWith('COLOR:') ||
    line.startsWith('ENTIDAD:') ||
    line.startsWith('SERVICIO:')||
    line.startsWith('NOMBRE:') ||
    line.startsWith('ID:') ||
    line.startsWith('NOMBRE:') ||
    line.startsWith('DOMICILIO:') ||
    line.startsWith('NO. DE LICENCIA:') ||
    line.startsWith('TIPO DE LICENCIA:')
  ) 
     
      
  ticket += '\x1B\x61\x00'; // izquierda


  // Wrap automático sin cortar palabras
  while (line.length > MAX_CHARS) {
    let slice = line.substring(0, MAX_CHARS);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > 0) slice = slice.substring(0, lastSpace);
    ticket += slice + '\n';
    line = line.substring(slice.length).trim();
  }

  ticket += line + '\n';
}

  
  // ==========================
  // PIE
  // ==========================
  ticket += '\n';
  ticket += '--------------------------------\n';
  ticket += '\x1B\x61\x00'; // Centrar
  ticket += 'DOCUMENTO INFORMATIVO\n';


  ticket += '\n\n';

  // Corte de papel
  ticket += '\x1B\x56\x00';

  
 return replaceSpecialChars(ticket);
}

function replaceSpecialChars(text: string): string {
  const map: { [key: string]: string } = {
    'á': '\xA0',
    'é': '\x82',
    'í': '\xA1',
    'ó': '\xA2',
    'ú': '\xA3',
    'ñ': '\xA4',
    'Á': '\xB5',
    'É': '\x90',
    'Í': '\xD6',
    'Ó': '\xE0',
    'Ú': '\xE9',
    'Ñ': '\xA5',
  };

  return text.replace(/[áéíóúñÁÉÍÓÚÑ]/g, (match) => map[match] || match);
}


// Convierte string ESC/POS a array de bytes
 
export function stringToBytes(str: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}
