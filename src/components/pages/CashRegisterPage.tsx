import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";
import SimpleModal from "../ui/SimpleModal";
import { IoAddCircle } from "react-icons/io5";

type Branch = {
  sucursal_id: number;
  nombre: string;
};

type CashRegister = {
  id: number;
  sucursal_id: number;
  user_id: number;
  opening_amount: number;
  closing_amount?: number;
  opened_at: string;
  closed_at?: string;
  branch: Branch;
  user: { id: number; name: string };
};

const headers = [
  "ID",
  "Sucursal",
  "Usuario",
  "Monto apertura",
  "Monto cierre",
  "Abierta",
  "Cerrada",
  "Acciones",
];

export default function CashRegisterPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";
  const userId = user.id;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [openingAmount, setOpeningAmount] = useState<number | "">("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);

  // Modal para cerrar caja
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cashRegisterToClose, setCashRegisterToClose] = useState<CashRegister | null>(null);
  const [closingAmount, setClosingAmount] = useState<number | "">("");

  const fetchBranches = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/branches");
      const data = await res.json();
      setBranches(data);
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
    }
  };

  const fetchCashRegisters = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/cash-registers");
      const data = await res.json();
      setCashRegisters(data);
    } catch (err) {
      console.error("Error al cargar cajas:", err);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchCashRegisters();
  }, []);

  const handleOpenCashRegister = async () => {
    if (!selectedBranch || openingAmount === "" || openingAmount <= 0) {
      setAlert({ type: "error", message: "Selecciona una sucursal y un monto válido." });
      return;
    }

    const payload = { sucursal_id: selectedBranch, user_id: userId, opening_amount: openingAmount };
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch("http://localhost:8000/api/v1/cash-registers/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: "success", message: "Caja abierta correctamente" });
        setCashRegisters(prev => [...prev, data.data]);
        setModalOpen(false);
        setSelectedBranch(null);
        setOpeningAmount("");
      } else {
        setAlert({ type: "error", message: data.message || "Error al abrir la caja" });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashRegister = async () => {
    if (!cashRegisterToClose || closingAmount === "" || closingAmount < 0) return;
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/cash-registers/close/${cashRegisterToClose.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closing_amount: closingAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: "success", message: "Caja cerrada correctamente" });
        setCashRegisters(prev =>
          prev.map(c => (c.id === cashRegisterToClose.id ? data.data : c))
        );
        setCloseModalOpen(false);
        setCashRegisterToClose(null);
        setClosingAmount("");
      } else {
        setAlert({ type: "error", message: data.message || "Error al cerrar la caja" });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const tableContent = cashRegisters.map(c => ({
    ID: c.id,
    Sucursal: c.branch?.nombre,
    Usuario: c.user?.name,
    "Monto apertura": c.opening_amount,
    "Monto cierre": c.closing_amount ?? "-",
    Abierta: c.opened_at,
    Cerrada: c.closed_at ?? "-",
    Acciones: !c.closed_at ? (
      <Button
        style="bg-red-500 hover:bg-red-600 text-white font-bold px-2 py-1 rounded text-sm"
        onClick={() => {
          setCashRegisterToClose(c);
          setCloseModalOpen(true);
        }}
        disabled={loading}
      >
        Cerrar
      </Button>
    ) : null,
  }));

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">Gestión de Cajas</h1>

              {/* Abrir nueva caja */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  style="bg-sky-500 hover:bg-azul-claro text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  <IoAddCircle /> Abrir nueva caja
                </Button>
              </div>

              {/* Tabla de cajas */}
              <TableInformation headers={headers} tableContent={tableContent} />

              {/* Modal Abrir Caja */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h2 className="text-xl font-bold mb-4 text-center">Abrir Caja</h2>

                    {alert && (
                      <div className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${alert.type === "success" ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-100 text-red-700 border border-red-300"}`}>
                        {alert.message}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 mb-4">
                      <div>
                        <label className="block font-semibold mb-1">Sucursal</label>
                        <select
                          value={selectedBranch ?? ""}
                          onChange={e => setSelectedBranch(Number(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">Selecciona una sucursal</option>
                          {branches.map(b => (
                            <option key={b.sucursal_id} value={b.sucursal_id}>{b.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Monto de apertura</label>
                        <input
                          type="number"
                          value={openingAmount}
                          onChange={e => setOpeningAmount(Number(e.target.value))}
                          placeholder="0.00"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold px-6 py-2 rounded" onClick={handleOpenCashRegister} disabled={loading}>
                        {loading ? "Abriendo..." : "Abrir Caja"}
                      </Button>
                      <Button style="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2 rounded" onClick={() => setModalOpen(false)}>Cancelar</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Cerrar Caja */}
              <SimpleModal open={closeModalOpen} onClose={() => setCloseModalOpen(false)} title={`Cerrar Caja #${cashRegisterToClose?.id}`}>
                <div className="flex flex-col gap-4">
                  <label className="font-semibold">Monto de cierre:</label>
                  <input
                    type="number"
                    value={closingAmount}
                    onChange={e => setClosingAmount(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                  <div className="flex gap-4 justify-end mt-4">
                    <Button style="bg-azul-fuerte hover:bg-azul-claro text-white px-6 py-2 rounded" onClick={handleCloseCashRegister} disabled={loading}>
                      {loading ? "Cerrando..." : "Cerrar Caja"}
                    </Button>
                    <Button style="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded" onClick={() => setCloseModalOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </SimpleModal>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
