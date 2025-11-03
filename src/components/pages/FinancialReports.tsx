import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import Container from "../ui/Container";
import TableInformation from "../ui/TableInformation";
import ExcelExporter from "../ui/ExcelExporter";
import PDFExporter from "../ui/PDFExporter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import InfoIcon from "../ui/InfoIcon";

const API_URL = import.meta.env.VITE_API_URL;

interface Product {
  codigo_producto: string;
  precio_compra: number;
  precio_venta: number;
  bodega_id: number;
  sucursal_id: number;
}

interface Invoice {
  id: number;
  branch_id: number;
  business_name: string;
  branch_name: string;
  customer_name: string;
  date: string;
  payment_method: string;
  products: {
    code: string;
    quantity: number;
  }[];
  total: number;
  discount: number;
}

export default function GrossProfitSaleReports() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("es-CR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [invoicesRes, productsRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/invoices`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/products`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/branches`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.json()),
        ]);

        setInvoices(invoicesRes);
        setProducts(productsRes);
        setBranches(branchesRes);
      } catch (err: any) {
        console.error(err);
        setError("Error cargando datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const businessList = Array.from(new Set(invoices.map((i) => i.business_name).filter(Boolean)));
  const branchList = branches.filter((b) => b.business.nombre_comercial === selectedBusiness);

  const filteredInvoices = invoices.filter((inv) => {
    if (selectedBusiness && inv.business_name !== selectedBusiness) return false;
    if (selectedBranch && inv.branch_id !== selectedBranch) return false;
    const invoiceTime = new Date(inv.date).getTime();
    const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : null;
    if (start && invoiceTime < start) return false;
    if (end && invoiceTime > end) return false;
    return true;
  });

  const invoicesWithProfit = filteredInvoices.map((inv) => {
    let ganancia_bruta = 0;
    let invoiceTotalWithoutDiscount = 0;

    inv.products.forEach((p) => {
      const productInfo = products.find(
        (pr) => pr.codigo_producto === p.code && pr.sucursal_id === inv.branch_id
      );
      if (productInfo) invoiceTotalWithoutDiscount += productInfo.precio_venta * (p.quantity || 0);
    });

    inv.products.forEach((p) => {
      const productInfo = products.find(
        (pr) => pr.codigo_producto === p.code && pr.sucursal_id === inv.branch_id
      );
      if (productInfo) {
        const venta = productInfo.precio_venta;
        const compra = productInfo.precio_compra;
        const cantidad = p.quantity || 0;
        const discountAmount = inv.discount ? ((venta * cantidad) / invoiceTotalWithoutDiscount) * inv.discount : 0;
        ganancia_bruta += (venta - compra) * cantidad - discountAmount;
      }
    });

    return {
      ...inv,
      dateFormatted: formatDate(inv.date),
      ganancia_bruta: ganancia_bruta.toFixed(2),
      total: Number(inv.total).toFixed(2),
    };
  });

  const totalGanancia = invoicesWithProfit.reduce(
    (sum, inv) => sum + parseFloat(inv.ganancia_bruta),
    0
  );

  const profitByDate: { date: string; profit: number }[] = [];
  const dateMap: Record<string, number> = {};
  invoicesWithProfit.forEach((inv) => {
    if (!dateMap[inv.dateFormatted]) dateMap[inv.dateFormatted] = 0;
    dateMap[inv.dateFormatted] += parseFloat(inv.ganancia_bruta);
  });
  for (const date in dateMap) profitByDate.push({ date, profit: dateMap[date] });

  const invoiceHeaders = [
    "id",
    "branch_name",
    "dateFormatted",
    "customer_name",
    "total",
    "ganancia_bruta",
    "payment_method",
  ];

  const clearFilters = () => {
    setSelectedBusiness(null);
    setSelectedBranch(null);
    setStartDate("");
    setEndDate("");
  };

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
      <Container
        page={
         <div className="w-full md:w-auto max-w-[1200px] px-2 sm:px-4 md:px-6 lg:px-10 flex flex-col h-[65rem]">

            <h1 className="text-3xl font-bold mb-6 mt-6">Reporte de Ganancia Bruta
              <InfoIcon
                title="Reporte de Ganancia Bruta"
                description="Aqui puedes ver el reporte de ganancia bruta de las ventas realizadas en la sucursal. La ganancia bruta se calcula restando el costo de los productos vendidos al total de la venta, considerando cualquier descuento aplicado."
              />
            </h1>

            {loading && <p>Cargando...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {/* FILTROS */}
            {!loading && !error && businessList.length > 0 && (
              <div className="flex flex-wrap items-end gap-4 mb-6">
                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Negocio:</label>
                  <select
                    className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                    value={selectedBusiness || ""}
                    onChange={(e) => {
                      setSelectedBusiness(e.target.value || null);
                      setSelectedBranch(null);
                    }}
                  >
                    <option value="">-- Todos --</option>
                    {businessList.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {selectedBusiness && branchList.length > 0 && (
                  <div className="flex flex-col">
                    <label className="block mb-1 font-semibold">Sucursal:</label>
                    <select
                      className="border px-3 py-2 rounded min-w-[180px] cursor-pointer"
                      value={selectedBranch || ""}
                      onChange={(e) => setSelectedBranch(Number(e.target.value) || null)}
                    >
                      <option value="">-- Todas --</option>
                      {branchList.map((b) => (
                        <option key={b.sucursal_id} value={b.sucursal_id}>{b.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Fecha inicio:</label>
                  <input
                    type="date"
                    className="border px-3 py-2 rounded cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block mb-1 font-semibold">Fecha fin:</label>
                  <input
                    type="date"
                    className="border px-3 py-2 rounded cursor-pointer"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                <div className="flex flex-col">
                  <button
                    className="bg-gray-200 hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded mt-4 md:mt-0 cursor-pointer"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            )}

            {/* GANANCIA TOTAL */}
            <p className="mt-4 font-semibold text-lg">
              Ganancia bruta total: ₡ {totalGanancia.toLocaleString()}
            </p>

            {/* EXPORTADORES */}
            {invoicesWithProfit.length > 0 && (
              <div className="mb-4 flex gap-4">
                <ExcelExporter
                  data={invoicesWithProfit}
                  headers={invoiceHeaders}
                  fileName={`GananciaBruta_${selectedBusiness || "Todos"}.xlsx`}
                />
                <PDFExporter
                  data={invoicesWithProfit}
                  headers={invoiceHeaders}
                  fileName={`GananciaBruta_${selectedBusiness || "Todos"}.pdf`}
                  reportTitle={`Reporte de Ganancia Bruta - ${selectedBusiness || "Todos"}`}
                />
              </div>
            )}

            {/* TABLA */}
            {invoicesWithProfit.length > 0 && (
              <div className="max-h-[20rem] overflow-hidden">
                <TableInformation headers={invoiceHeaders} tableContent={invoicesWithProfit} />
              </div>
            )}
{/* GRÁFICO DE LÍNEA */}
{!loading && !error && profitByDate.length > 0 && (
  <div className="mt-6 w-full h-64 sm:h-72 md:h-80 lg:h-96">
    <h2 className="text-lg sm:text-xl font-semibold mb-4">Ganancia por Fecha</h2>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={profitByDate} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  </div>
)}


            {!loading && !error && profitByDate.length === 0 && (
              <p>No hay facturas para los filtros seleccionados.</p>
            )}
          </div>
        }
      />
    </ProtectedRoute>
  );
}
