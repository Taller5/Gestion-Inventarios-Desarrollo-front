import { useEffect, useState } from "react";
import Plot from "react-plotly.js";


const API_URL = import.meta.env.VITE_API_URL;
export default function DashboardInformation() {
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
      }}
      style={{
    width: "100%",
    height: "400px",
    border: "5px solid #ccc",
    padding: "5px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  }}

    />
  );
};
    return (   
        <div className="w-full">
            {!loading && invoices.length > 0 && 
            <div>
                <h2 className="text-lg font-semibold">Facturas por día</h2>
                <InvoiceChart invoices={invoices} />
            </div>
}
        </div>

    );
}