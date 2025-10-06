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
  business?: { negocio_id: number; nombre_comercial: string };
};

type CashRegister = {
  id: number;
  sucursal_id: number;
  user_id: number;
  opening_amount: number;
  closing_amount?: number;
  opened_at: string | null;
  closed_at?: string | null;
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

const API_URL = import.meta.env.VITE_API_URL as string;

const formatDateSafe = (input?: string | number | null) => {
  if (!input) return "-";
  if (typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime())
      ? String(input)
      : d.toLocaleString("es-CR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "America/Costa_Rica",
        });
  }
  const s = String(input).trim();
  if (/[\/]|[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(s) && !/T/.test(s)) return s;
  let isoCandidate = s;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/.test(s)) {
    if (!/[Zz]|[+\-]\d{2}:\d{2}$/.test(s)) isoCandidate += "Z";
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/.test(s)) {
    isoCandidate = s.replace(" ", "T") + "Z";
  } else {
    const tryD = new Date(s);
    if (!isNaN(tryD.getTime())) {
      return tryD.toLocaleString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Costa_Rica",
      });
    }
    return s;
  }
  const d = new Date(isoCandidate);
  return isNaN(d.getTime())
    ? s
    : d.toLocaleString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Costa_Rica",
      });
};

export default function CashRegisterPage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role || "";
  const userId = user.id;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [businesses, setBusinesses] = useState<{ negocio_id: number; nombre_comercial: string }[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [openingAmount, setOpeningAmount] = useState<number | "">("");
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cashRegisterToClose, setCashRegisterToClose] = useState<CashRegister | null>(null);
  const [closingAmount, setClosingAmount] = useState<number | "">("");
  const [closingError, setClosingError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const MAX_AMOUNT = 99999999.99;

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/branches`);
      const data = await res.json();
      setBranches(data);

      // Extraer negocios únicos
      const map = new Map<number, { negocio_id: number; nombre_comercial: string }>();
      data.forEach((b: Branch) => {
        const bus = b.business;
        if (bus && !map.has(bus.negocio_id)) map.set(bus.negocio_id, bus);
      });
      setBusinesses(Array.from(map.values()));
    } catch (err) {
      console.error("Error al cargar sucursales:", err);
    }
  };

  const fetchCashRegisters = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/cash-registers`);
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
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/cash-registers/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sucursal_id: selectedBranch, user_id: userId, opening_amount: openingAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setCashRegisters((prev) => [...prev, data.data]);
        setModalOpen(false);
        setSelectedBranch(null);
        setOpeningAmount("");
      } else setAlert({ type: "error", message: data.message || "Error al abrir la caja" });
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashRegister = async () => {
    if (!cashRegisterToClose || closingAmount === "" || closingAmount < 0) return;
    if (Number(closingAmount) < Number(cashRegisterToClose.opening_amount)) {
      setAlert({ type: "error", message: "El monto de cierre no puede ser menor al de apertura" });
      return;
    }
    setLoading(true);
    setAlert(null);
    try {
      const res = await fetch(`${API_URL}/api/v1/cash-registers/close/${cashRegisterToClose.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ closing_amount: closingAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setCashRegisters((prev) => prev.map((c) => (c.id === cashRegisterToClose.id ? data.data : c)));
        setCloseModalOpen(false);
        setCashRegisterToClose(null);
        setClosingAmount("");
      } else setAlert({ type: "error", message: data.message || "Error al cerrar la caja" });
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Ordena las cajas abiertas primero
  const sortedCashRegisters = cashRegisters.slice().sort((a, b) => {
    if (!a.closed_at && b.closed_at) return -1;
    if (a.closed_at && !b.closed_at) return 1;
    const dateA = a.opened_at ? new Date(a.opened_at).getTime() : 0;
    const dateB = b.opened_at ? new Date(b.opened_at).getTime() : 0;
    return dateB - dateA;
  });
/// Filtro por negocio (a través de la sucursal) y rango de fecha
const filteredCashRegisters = sortedCashRegisters.filter((c) => {
  let matchBusiness = true;
  let matchDate = true;

  if (selectedBusiness) {
    const branch = branches.find((b) => b.sucursal_id === c.sucursal_id);
    const negocioId = branch?.business?.negocio_id;
    matchBusiness = negocioId === selectedBusiness;
  }

  if (startDate) {
    matchDate = matchDate && new Date(c.opened_at || 0).getTime() >= new Date(startDate).getTime();
  }
  if (endDate) {
    matchDate = matchDate && new Date(c.opened_at || 0).getTime() <= new Date(endDate).getTime();
  }

  return matchBusiness && matchDate;
});

// Mostrar alerta si no hay cajas
useEffect(() => {
  if (selectedBusiness && filteredCashRegisters.length === 0) {
    setAlert({
      type: "error",
      message: "No hay cajas registradas para el negocio seleccionado.",
    });
  } else {
    setAlert(null);
  }
}, [selectedBusiness, filteredCashRegisters]);



  const tableContent = filteredCashRegisters.map((c) => ({
    ID: c.id,
    Sucursal: c.branch?.nombre,
    Usuario: c.user?.name,
    "Monto apertura": c.opening_amount,
    "Monto cierre": c.closing_amount ?? "-",
    Abierta: formatDateSafe(c.opened_at),
    Cerrada: c.closed_at ? formatDateSafe(c.closed_at) : "-",
    Acciones: !c.closed_at ? (
      <Button
        style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-2 py-1 rounded text-sm"
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
              <h1 className="text-2xl font-bold mb-6 text-left">Gestionar Cajas</h1>

              {/* Filtros */}
              <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div>
                  <label className="block font-semibold mb-1">Negocio</label>
                  <select
                    value={selectedBusiness ?? ""}
                    onChange={(e) => setSelectedBusiness(Number(e.target.value) || null)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">Todos los negocios</option>
                    {businesses.map((b) => (
                      <option key={b.negocio_id} value={b.negocio_id}>
                        {b.nombre_comercial}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Desde</label>
                  <input
                    type="date"
                    value={startDate ?? ""}
                    onChange={(e) => setStartDate(e.target.value || null)}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value || null)}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <Button
                    style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-4 py-2 rounded"
                    onClick={() => {
                      setSelectedBusiness(null);
                      setStartDate(null);
                      setEndDate(null);
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>

              {/* Botón abrir nueva caja */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  <IoAddCircle /> Abrir nueva caja
                </Button>
              </div>

              <TableInformation headers={headers} tableContent={tableContent} />

              {/* Modal Abrir Caja */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h2 className="text-xl font-bold mb-4 text-center">Abrir Caja</h2>

                    {alert && (
                      <div
                        className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                          alert.type === "success"
                            ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro"
                            : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-oscuro"
                        }`}
                      >
                        {alert.message}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 mb-4">
                      <div>
                        <label className="block font-semibold mb-1">Sucursal</label>
                        <select
                          value={selectedBranch ?? ""}
                          onChange={(e) => setSelectedBranch(Number(e.target.value))}
                          className="w-full border rounded-lg px-3 py-2"
                        >
                          <option value="">Selecciona una sucursal</option>
                          {branches.map((b) => (
                            <option key={b.sucursal_id} value={b.sucursal_id}>
                              {b.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Monto de apertura</label>
                        <input
                          type="number"
                          value={openingAmount}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (/[^0-9.]$/.test(raw)) return;
                            if (raw === "") {
                              setOpeningAmount("");
                              setAlert(null);
                              return;
                            }
                            const value = Number(raw);
                            if (value > MAX_AMOUNT) {
                              setAlert({ type: "error", message: `El monto no puede poseer más de 8 dígitos` });
                              return;
                            }
                            setAlert(null);
                            setOpeningAmount(value);
                          }}
                          placeholder="0.00"
                          max={MAX_AMOUNT}
                          step="0.01"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-4">
                      <Button
                        style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={handleOpenCashRegister}
                        disabled={loading}
                      >
                        {loading ? "Abriendo..." : "Abrir Caja"}
                      </Button>
                      <Button
                        style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                        onClick={() => setModalOpen(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              {/* Alerta general */}
{alert && (
  <div
    className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
      alert.type === "success"
        ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro"
        : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-oscuro"
    }`}
  >
    {alert.message}
  </div>
)}

              {/* Modal Cerrar Caja */}
              <SimpleModal
                open={closeModalOpen}
                onClose={() => setCloseModalOpen(false)}
                title={`Cerrar Caja #${cashRegisterToClose?.id}`}
              >
                <div className="flex flex-col gap-4">
                  <label className="font-semibold">Monto de cierre:</label>
                  <div className="w-full">
                    <input
                      type="text"
                      value={closingAmount}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const validPattern = /^\d{0,8}(\.\d{0,2})?$/;
                        if (!validPattern.test(raw)) return;
                        if (raw === "") {
                          setClosingAmount("");
                          setClosingError(null);
                          return;
                        }
                        const value = Number(raw);
                        if (value > MAX_AMOUNT) setClosingError(`El monto no puede poseer más de 8 dígitos`);
                        else if (cashRegisterToClose && value < Number(cashRegisterToClose.opening_amount))
                          setClosingError(
                            `El monto de cierre no puede ser menor al de apertura ₡${Number(
                              cashRegisterToClose.opening_amount
                            ).toLocaleString("es-CR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          );
                        else setClosingError(null);
                        setClosingAmount(Number(raw));
                      }}
                      placeholder="0.00"
                      className={`w-full border rounded-lg px-3 py-2 [appearance:textfield] ${
                        closingError ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {closingError && <p className="text-red-500 text-sm mt-1 font-medium">{closingError}</p>}
                  </div>

                  <div className="flex gap-4 justify-end mt-4">
                    <Button
                      style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={handleCloseCashRegister}
                      disabled={loading}
                    >
                      {loading ? "Cerrando..." : "Cerrar Caja"}
                    </Button>
                    <Button
                      style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={() => setCloseModalOpen(false)}
                    >
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
