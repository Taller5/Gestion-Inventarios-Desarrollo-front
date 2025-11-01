import type { Branch } from "./DashboardInformation";
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";


const API_URL = import.meta.env.VITE_API_URL;

type Props = {
  branch: Branch | null;
};

export default function DashboardInformation( { branch }: Props ) {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInvoices() {
          try {
            const res = await fetch(`${API_URL}/api/v1/invoices`, {
              method: "GET",
            });
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
      }, []);
    

    const groupInvoicesByDay = (invoices: any[]) => {
        const counts: Record<string, number> = {};

        invoices.forEach((invoice) => {
            const date = new Date(invoice.date);
            const dayKey = date.toISOString().split("T")[0]; // formato YYYY-MM-DD

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
          marker: { color: "azul-medio" },
        },
      ]}
      layout={{
        title: "Facturas por día",
        xaxis: { title: "Fecha" },
        yaxis: { title: "Cantidad de facturas" },
        // plot_bgcolor: "#000",
        // paper_bgcolor: "#000",
        font: { color: "black" },
        margin: {
            l: 40, // izquierda
            r: 20, // derecha
            t: 40, // arriba
            b: 40  // abajo
        },

      }}
      style={{
    width: "100%",
    height: "300px",
    border: "2px solid #E5E7EB",
    overflow: "hidden",
    boxSizing: "border-box",
    borderRadius: "10px",
  }}

//   border-radius: 50px;
// background: #dbdbdb;
// box-shadow:  20px 20px 60px #bababa,
//              -20px -20px 60px #fcfcfc;

    />
  );
};
    return (
  <div className="w-full">
    {!loading && invoices.length > 0 && branch && (
      <div>
        <h2 className="text-lg font-semibold">
          Facturas por día – {branch.nombre}
        </h2>
        <InvoiceChart
          invoices={invoices.filter(
            (invoice) => invoice.branch_name === branch.nombre
          )}
        />
      </div>
    )}
  </div>
);
}