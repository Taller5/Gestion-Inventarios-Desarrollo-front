import type { Branch } from "./DashboardInformation";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const API_URL = import.meta.env.VITE_API_URL;

type Props = {
  branch: Branch | null;
};

export default function DashboardInformation({ branch }: Props) {
  const [invoices, setInvoices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const res = await fetch(`${API_URL}/api/v1/invoices`, { method: "GET" });
        if (!res.ok) throw new Error("Error al obtener las facturas");
        const data = await res.json();
        setInvoices(data);
      } catch (err: any) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [branch]);

  const groupInvoicesByDay = (invoices: any[]) => {
    const counts: Record<string, number> = {};
    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const dayKey = date.toISOString().split("T")[0];
      counts[dayKey] = (counts[dayKey] || 0) + 1;
    });
    return counts;
  };

  const InvoiceChart = ({ invoices }: { invoices: any[] }) => {
    const dailyCounts = groupInvoicesByDay(invoices);
    const dates = Object.keys(dailyCounts).sort();
    const values = dates.map((date) => dailyCounts[date]);

    return (
      <Plot
        data={[
          {
            x: dates,
            y: values,
            type: "bar",
            marker: { color: "azul-medio" }, // no cambia color
          },
        ]}
        layout={{
          title: "Facturas por día",
          xaxis: { title: "Fecha" },
          yaxis: { title: "Cantidad de facturas" },
          font: { color: "black" },
          margin: { l: 40, r: 20, t: 40, b: 40 },
          transition: "transform",
        }}
        style={{
          width: "100%",
          height: 250, // altura por defecto en móviles
          maxHeight: 350, // límite en pantallas grandes
          border: "2px solid #E5E7EB",
          borderRadius: "10px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      />
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 px-2 sm:px-4 md:px-0">
      {loading ? (
        <h2 className="text-center sm:text-left text-base sm:text-lg font-semibold mt-6 sm:mt-8">
          Cargando gráficos...
        </h2>
      ) : !invoices || invoices.length <= 0 ? (
        <h2 className="text-center sm:text-left text-base sm:text-lg font-semibold mt-6 sm:mt-8">
          Debe crear una
          <a href="/cashRegisterPage" className="text-azul-hover hover:font-bold ml-1">
            caja
          </a>
          para ver las facturas de la sucursal
        </h2>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-center sm:text-left text-base sm:text-lg font-semibold">
            Facturas por día - {branch?.nombre}
          </h2>
          <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
            <InvoiceChart
              invoices={invoices.filter(
                (invoice) => invoice.branch_name === branch?.nombre
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
