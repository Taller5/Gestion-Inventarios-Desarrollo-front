import { useEffect, useState, useMemo } from 'react';
import ProtectedRoute from '../services/ProtectedRoute';
import Container from '../ui/Container';
import TableInformation from '../ui/TableInformation';

const API_URL = import.meta.env.VITE_API_URL; 
const HACIENDA_ENDPOINT = '/api/v1/hacienda-report';
const API_BASE = (API_URL || '').replace(/\/+$/, '');

interface HaciendaReportItem {
  id: number;
  business_nombre: string;
  tipo: string;
  fecha: string;
  clave: string;
  hacienda_estado: string;
  xml_download_url: string;
  response_xml_download_url: string;
}

// Sin interfaz de paginación: eliminamos controles y parámetros de página

export default function HaciendaReports() {
  const [data, setData] = useState<HaciendaReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Soporte para "Cargar más"
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  // Mantener opciones "maestras" (provenientes de la primera carga) para poblar selects
  const [masterNegocios, setMasterNegocios] = useState<string[] | null>(null);
  const [masterTipos, setMasterTipos] = useState<string[] | null>(null);
  const [masterEstados, setMasterEstados] = useState<string[] | null>(null);

  // Filtros
  const [businessFilter, setBusinessFilter] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [estadoFilter, setEstadoFilter] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  // Función para obtener una página específica y decidir si se agrega o se reemplaza
  const fetchPage = async (pageToLoad: number, append: boolean) => {
      try {
        append ? setIsLoadingMore(true) : setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const params = new URLSearchParams();
        if (businessFilter) {
          // NOTA: backend espera business_id. Sin ID disponible en respuesta, no se envía.
        }
        if (tipoFilter) {
          const documentTypeMap: Record<string, string> = { Factura: '01', Tiquete: '04' };
          const code = documentTypeMap[tipoFilter];
          if (code) params.append('document_type', code);
        }
        if (estadoFilter) params.append('estado', estadoFilter);
        if (fechaInicio) params.append('fecha_inicio', fechaInicio);
        if (fechaFin) params.append('fecha_fin', fechaFin);
        // Pedir la página correspondiente
        params.append('page', String(pageToLoad));

        const url = params.toString() ? `${HACIENDA_ENDPOINT}?${params.toString()}` : HACIENDA_ENDPOINT;
        const fullUrl = API_BASE ? `${API_BASE}${url.startsWith('/') ? url : '/' + url}` : url;
        const res = await fetch(fullUrl, { headers });
        const contentType = res.headers.get('content-type') || '';
        let rawBody: string | null = null;
        if (!res.ok) {
          try { rawBody = await res.text(); } catch { rawBody = null; }
          // Si la respuesta es HTML, probablemente es la página de error de Laravel (500)
          if (contentType.includes('text/html')) {
            throw new Error(`Error ${res.status} ${res.statusText}. Backend devolvió HTML (posible 500). Revisa logs en storage/logs/laravel.log. Cuerpo parcial: ${rawBody?.slice(0,120) || ''}`);
          }
          throw new Error(`Error ${res.status} ${res.statusText} ${rawBody || ''}`);
        }
        const json = contentType.includes('application/json') ? await res.json() : { data: [] };
        const raw = Array.isArray(json) ? json : json.data || [];
        const items: HaciendaReportItem[] = raw.map((it: any) => ({
          id: it.id,
          business_nombre: it.business || '',
          tipo: it.tipo || (it.document_type === '04' ? 'Tiquete' : 'Factura'),
            fecha: it.date || '',
          clave: it.clave || '',
          hacienda_estado: it.estado || '',
          xml_download_url: it.xml_download_url || '',
          response_xml_download_url: it.response_xml_download_url || '',
        }));
        setData(prev => append ? [...prev, ...items] : items);
        // Evaluar si hay más páginas
        const p = json.pagination;
        let more = false;
        if (p) {
          if (typeof p.next_page_url !== 'undefined') more = Boolean(p.next_page_url);
          else if (p.current_page != null && p.last_page != null) more = Number(p.current_page) < Number(p.last_page);
          else if (p.total != null && p.per_page != null) more = Number(p.current_page ?? pageToLoad) * Number(p.per_page) < Number(p.total);
        }
        setHasMore(Boolean(more));
        setPage(pageToLoad);
        // Guardar opciones maestras la primera vez que se obtienen datos (evita que los selects se "encojen"
        // cuando el backend responde solo con items filtrados)
        const respNegocios = Array.from(new Set(items.map(i => i.business_nombre).filter(Boolean)));
        const respTipos = Array.from(new Set(items.map(i => i.tipo).filter(Boolean)));
        const respEstados = Array.from(new Set(items.map(i => i.hacienda_estado).filter(Boolean)));
        setMasterNegocios(prev => prev ?? respNegocios);
        setMasterTipos(prev => prev ?? respTipos);
        setMasterEstados(prev => prev ?? respEstados);
      } catch (e: any) {
        setError(e.message || 'Error desconocido');
        if (!append) setData([]);
      } finally {
        append ? setIsLoadingMore(false) : setLoading(false);
      }
  };

  // Carga inicial y cuando cambian filtros: reset a página 1
  useEffect(() => {
    setPage(1);
    fetchPage(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessFilter, tipoFilter, estadoFilter, fechaInicio, fechaFin]);

  // Helper: descargar un archivo (XML) vía fetch para incluir Authorization si es necesario
  const downloadFile = async (url: string, filename?: string) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Error descargando: ${res.status} ${res.statusText}`);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
  };

  const handleValidateXml = async (id: number) => {
  try {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}/api/v1/invoices/${id}/validate-xml`, { headers });
    if (!res.ok) throw new Error(`Error validando XML: ${res.status}`);
    const json = await res.json();
    alert('Validación: ' + JSON.stringify(json));
  } catch (err:any) {
    console.error(err);
    alert(err.message || String(err));
  }
};

  // Derivar listas únicas para selects
  const negocios = useMemo(() => masterNegocios ?? Array.from(new Set(data.map(d => d.business_nombre).filter(Boolean))), [data, masterNegocios]);
  const tipos = useMemo(() => masterTipos ?? Array.from(new Set(data.map(d => d.tipo).filter(Boolean))), [data, masterTipos]);
  const estados = useMemo(() => masterEstados ?? Array.from(new Set(data.map(d => d.hacienda_estado).filter(Boolean))), [data, masterEstados]);

  // Filtrado en memoria
  const filtered = useMemo(() => {
    return data.filter(item => {
      if (businessFilter && item.business_nombre !== businessFilter) return false;
      if (tipoFilter && item.tipo !== tipoFilter) return false;
      if (estadoFilter && item.hacienda_estado !== estadoFilter) return false;
      if (fechaInicio && new Date(item.fecha) < new Date(fechaInicio)) return false;
      if (fechaFin) {
        const finDate = new Date(fechaFin);
        finDate.setHours(23,59,59,999);
        if (new Date(item.fecha) > finDate) return false;
      }
      return true;
    });
  }, [data, businessFilter, tipoFilter, estadoFilter, fechaInicio, fechaFin]);

  const clearFilters = () => {
    setBusinessFilter('');
    setTipoFilter('');
    setEstadoFilter('');
    setFechaInicio('');
    setFechaFin('');
    setPage(1);
  };

  // Contenido para la tabla adaptando enlaces
  const tableContent = filtered.map(row => {
  const xmlUrl = row.xml_download_url;
  const responseXmlUrl = row.response_xml_download_url;

  return {
    id: row.id,
    business_nombre: row.business_nombre,
    tipo: row.tipo,
    fecha: row.fecha ? new Date(row.fecha).toLocaleDateString('es-CR') : '—',
    clave: row.clave || '—',
    hacienda_estado: row.hacienda_estado || '—',
    xml: xmlUrl ? (
      <button className="bg-azul-medio hover:bg-azul-hover text-white font-semibold py-2 px-4 rounded cursor-pointer" onClick={() => downloadFile(xmlUrl, `xml_${row.id}.xml`)}>
        Descargar
      </button>
    ) : '—',
    xml_respuesta: responseXmlUrl ? (
      <button className="bg-azul-medio hover:bg-azul-hover text-white font-semibold py-2 px-4 rounded cursor-pointer" onClick={() => downloadFile(responseXmlUrl, `response_${row.id}.xml`)}>
        Descargar
      </button>
    ) : '—',
    validar: (
      <button
        className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-1 px-2 rounded"
        onClick={() => handleValidateXml(row.id)}
      >
        Validar XML
      </button>
    ),
  };
});

  const headers = [
    'id',
    'business_nombre',
    'tipo',
    'fecha',
    'clave',
    'hacienda_estado',
    'xml',
    'xml_respuesta'
  ];

  return (
    <ProtectedRoute allowedRoles={['administrador','supervisor']}>
      <Container page={
        <div className="w-full flex justify-center px-2 md:px-10 pt-10 overflow-x-hidden">
          <div className="w-full pl-4">
            <div className="flex items-center gap-3 mb-6 mt-6">
              <h1 className="text-3xl font-bold">Reporte Hacienda</h1>
              {/* Se puede agregar un InfoIcon si se desea */}
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <div className="flex flex-col lg:flex-row flex-wrap gap-4 mb-6">
              {/* Filtro Negocio */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="block mb-1 font-semibold">Negocio:</label>
                <select
                  className="border px-3 py-2 rounded min-w-[180px] cursor-pointer w-full sm:w-auto"
                  value={businessFilter}
                  onChange={(e) => setBusinessFilter(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {negocios.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {/* Filtro Tipo */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="block mb-1 font-semibold">Tipo:</label>
                <select
                  className="border px-3 py-2 rounded min-w-[150px] cursor-pointer w-full sm:w-auto"
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="block mb-1 font-semibold">Estado:</label>
                <select
                  className="border px-3 py-2 rounded min-w-[180px] cursor-pointer w-full sm:w-auto"
                  value={estadoFilter}
                  onChange={(e) => setEstadoFilter(e.target.value)}
                >
                  <option value="">-- Todos --</option>
                  {estados.map(est => <option key={est} value={est}>{est}</option>)}
                </select>
              </div>

              {/* Fecha inicio */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="block mb-1 font-semibold">Fecha inicio:</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded cursor-pointer"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>

              {/* Fecha fin */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="block mb-1 font-semibold">Fecha fin:</label>
                <input
                  type="date"
                  className="border px-3 py-2 rounded cursor-pointer"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>

              {/* Botón limpiar */}
              <div className="flex flex-col w-full sm:w-auto">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded mt-2 sm:mt-0 cursor-pointer w-full sm:w-auto"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            </div>

            <TableInformation
              headers={headers}
              tableContent={tableContent}
              loading={loading}
            />
            {hasMore && (
              <div className="mt-4">
                <button
                  className="bg-azul-medio hover:bg-azul-hover text-white font-semibold py-2 px-4 rounded cursor-pointer disabled:opacity-50"
                  onClick={() => fetchPage(page + 1, true)}
                  disabled={isLoadingMore}
                >{isLoadingMore ? 'Cargando…' : 'Cargar más'}</button>
              </div>
            )}
            {(!loading && tableContent.length === 0) && <p className="mt-4">No hay datos para los filtros seleccionados.</p>}
          </div>
        </div>
      }/>
    </ProtectedRoute>
  );
}
