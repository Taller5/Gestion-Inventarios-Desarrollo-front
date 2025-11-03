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

export async function generateInvoiceXml(invoiceId: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}/xml`, {
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

export async function submitInvoice(invoiceId: number): Promise<{ status?: string; message?: string }> {
  const res = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}/submit`, {
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

export async function getInvoiceXmlStatus(invoiceId: number): Promise<XmlStatus> {
  const res = await fetch(`${API_URL}/api/v1/invoices/${invoiceId}/status`, {
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
