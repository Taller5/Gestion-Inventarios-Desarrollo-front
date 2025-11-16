const API_URL = import.meta.env.VITE_API_URL;

type XmlStatus = {
  status: 'SIN_ENVIAR' | 'XML_GENERATING' | 'SENDING' | 'RECEIVED' | 'PROCESSING' | 'ACCEPTED' | 'REJECTED' | string;
  message?: string;
  reason?: string;
  detalle?: string;
  clave?: string;
  consecutivo?: string;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

type DocType = '01' | '04' | undefined;

// Construye endpoint alias si se provee tipo y acción
const buildAliasEndpoint = (invoiceId: number, action: 'xml' | 'submit' | 'status', docType?: DocType) => {
  if (docType === '01') {
    if (action === 'xml') return `${API_URL}/api/v1/facturas/${invoiceId}/xml`;
    if (action === 'submit') return `${API_URL}/api/v1/facturas/${invoiceId}/submit`;
    if (action === 'status') return `${API_URL}/api/v1/facturas/${invoiceId}/status`;
  }
  if (docType === '04') {
    if (action === 'xml') return `${API_URL}/api/v1/tickets/${invoiceId}/xml`;
    if (action === 'submit') return `${API_URL}/api/v1/tickets/${invoiceId}/submit`;
    if (action === 'status') return `${API_URL}/api/v1/tickets/${invoiceId}/status`;
  }
  // Fallback genérico
  if (action === 'xml') return `${API_URL}/api/v1/invoices/${invoiceId}/xml`;
  if (action === 'submit') return `${API_URL}/api/v1/invoices/${invoiceId}/submit`;
  return `${API_URL}/api/v1/invoices/${invoiceId}/status`;
};

export async function generateInvoiceXml(invoiceId: number, docType?: DocType): Promise<void> {
  const endpoint = buildAliasEndpoint(invoiceId, 'xml', docType);
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const t = await res.text();
      if (t) {
        const j = JSON.parse(t);
        msg = j.message || msg;
      }
    } catch {}
    throw new Error(msg);
  }
}

export async function submitInvoice(invoiceId: number, docType?: DocType): Promise<{ status?: string; message?: string }> {
  const endpoint = buildAliasEndpoint(invoiceId, 'submit', docType);
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const t = await res.text();
      if (t) {
        const j = JSON.parse(t);
        msg = j.message || msg;
      }
    } catch {}
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function getInvoiceXmlStatus(invoiceId: number, docType?: DocType): Promise<XmlStatus> {
  const endpoint = buildAliasEndpoint(invoiceId, 'status', docType);
  const res = await fetch(endpoint, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(),
    },
  });
  if (!res.ok) {
    let msg = `Error ${res.status}`;
    try {
      const t = await res.text();
      if (t) {
        const j = JSON.parse(t);
        msg = j.message || msg;
      }
    } catch {}
    throw new Error(msg);
  }
  try {
    return await res.json();
  } catch {
    return { status: 'PROCESSING' } as XmlStatus;
  }
}

export type { XmlStatus };
