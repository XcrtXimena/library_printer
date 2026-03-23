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
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJhZG1pbkBsaXZpbmsuY29tIiwibmFtZSI6IkNhcmxvcyBBZG1pbmlzdHJhZG9yIiwianRpIjoiOGY0MmU5MWEtZjBiOC00MDU4LTgyZjYtZjE1MDQxOGY1ZTA0IiwidXNlcklkIjoiMSIsInRlbmFudElkIjoiMSIsInRlbmFudENvZGUiOiJQVUVCTEEiLCJyb2xJZCI6IjEiLCJyb2xDb2RlIjoiU1VQRVJfQURNSU4iLCJyb2xOYW1lIjoiU3VwZXIgQWRtaW5pc3RyYWRvciIsInBlcm1pc3Npb24iOlsidXNlcnMuY3JlYXRlIiwidXNlcnMucmVhZCIsInVzZXJzLnVwZGF0ZSIsInVzZXJzLmRlbGV0ZSIsInJvbGVzLmNyZWF0ZSIsInJvbGVzLnJlYWQiLCJyb2xlcy51cGRhdGUiLCJyb2xlcy5kZWxldGUiLCJ0ZW5hbnRzLmNyZWF0ZSIsInRlbmFudHMucmVhZCIsInRlbmFudHMudXBkYXRlIiwidGVuYW50cy5kZWxldGUiLCJyZXBvcnRzLnZpZXciLCJyZXBvcnRzLmV4cG9ydCJdLCJleHAiOjE3NzM5NDYxOTYsImlzcyI6Ikxpdmlua0F1dGhTZXJ2aWNlIiwiYXVkIjoiTGl2aW5rTWljcm9zZXJ2aWNlcyJ9.829zRVwtli0OSy1CpzjcY_yRSnGBHgufa2T0H4rs4XU";
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


// ==========================
// REPLACE DE VARIABLES @@
// ==========================
export function fillTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/@@(\w+)/g, (_, key) => {
    return data[key] ?? '';
  });
}


  //Generador profesional ESC/POS
// Compatible 58mm y 80mm
 
export function buildEscPosTicket(rawText: string): string {
  
   let ticket = '';
 const MAX_CHARS = 48; // ancho del ticket

 // convertir \n texto → salto real
  rawText = rawText.replace(/\\n/g, '\n');

  // Reset impresora
  ticket += '\x1B\x40';

  //TEXTO PEQUEÑO
  ticket += '\x1B\x4D\x01';

// ------------------- CUERPO -------------------
ticket += '\x1B\x61\x00'; // Alinear izquierda

const lines = rawText
  .replace(/\r/g, '')
  .split('\n')
  .map(l => l.trim());

for (let line of lines) {

 // ==========================
// TÍTULO PRINCIPAL (CENTRADO)
// ==========================
if (line.includes('BOLETA DE INFRACCIÓN EN MATERIA DE MOVILIDAD Y SEGURIDAD VIAL')) {
  ticket += '\x1B\x61\x01'; // CENTER
  ticket += '\x1B\x45\x01'; // bold
  ticket += 'BOLETA DE INFRACCIÓN EN MATERIA\n';
  ticket += 'DE MOVILIDAD Y SEGURIDAD VIAL\n';
  ticket += '\x1B\x45\x00'; // quitar bold
  ticket += '\x1B\x61\x00'; // volver a izquierda
  ticket += '\n';
  continue;
  }


// ==========================
// OTROS TÍTULOS (IZQUIERDA)
// ==========================
if (
  line.includes('GOBIERNO DEL ESTADO DE PUEBLA') ||
  line.includes('SECRETARÍA DE MOVILIDAD Y TRANSPORTE')
) {
  ticket += '\x1B\x61\x00'; // izquierda
  ticket += '\x1B\x45\x01'; // bold (opcional)
  ticket += line + '\n';
  ticket += '\x1B\x45\x00';
  continue;
}

  // ==========================
    // SECCIONES (I, II, III...)
    // ==========================
    if (
      line.startsWith('I.') ||
      line.startsWith('II.') ||
      line.startsWith('III.') ||
      line.startsWith('IV.') ||
      line.startsWith('V.')
    ) {
      ticket += '\n';
      ticket += '\x1B\x45\x01'; // bold
      ticket += line ;
      ticket += '\x1B\x45\x00';
      continue;
    }
    ticket += '\n';  
  ticket += '\x1B\x61\x00'; // izquierda

    // ==========================
    // CHECKBOXES
    // ==========================
    if (line.startsWith('[x]') || line.startsWith('[]') || line.startsWith('☑') || line.startsWith('☐')) {
      ticket += line ;
      continue;
    }


  // Wrap automático sin cortar palabras
  while (line.length > MAX_CHARS) {
    let slice = line.substring(0, MAX_CHARS);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > 0) slice = slice.substring(0, lastSpace);
    ticket += slice + '\n';
    line = line.substring(slice.length).trim();
  }

  ticket += line ;
}

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


// ==========================
// STRING → BYTES
// ==========================
 
export function stringToBytes(str: string): number[] {
  const bytes: number[] = [];

  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  return bytes;
}
