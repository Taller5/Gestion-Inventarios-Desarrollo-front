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

/**
 * Convierte varios formatos de fecha a una representación en la zona "America/Costa_Rica".
 * - Acepta ISO con zona (ej: 2025-09-19T14:33:00Z)
 * - Acepta ISO sin zona (2025-09-19T14:33:00) -> lo trata como UTC
 * - Acepta formato con espacio (2025-09-19 14:33:00) -> lo convierte a ISO y trata como UTC
 * - Acepta timestamps numéricos
 * - Si la cadena ya es legible (contiene '/',' de ' u otro formato no ISO) la devuelve tal cual
 */
const formatDateSafe = (input?: string | number | null) => {
  if (input === null || input === undefined || input === "") return "-";

  // Si es número (timestamp)
  if (typeof input === "number") {
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString("es-CR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "America/Costa_Rica",
      });
    }
    return String(input);
  }

  const s = String(input).trim();

  // Si parece ya una fecha legible (ej: "19/09/2025 14:33" o "19 de septiembre ..."), devolvemos tal cual
  // Esto evita re-parsing de una fecha que ya es para mostrar.
  if (/[\/]|[a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(s) && !/T/.test(s)) {
    return s;
  }

  // Regex ISO-like: YYYY-MM-DDTHH:MM:SS(.sss)?(Z|+hh:mm|-hh:mm)?
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/;
  // Regex space-separated: YYYY-MM-DD HH:MM(:SS)?
  const spaceIsoRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/;
  let isoCandidate = s;

  if (isoRegex.test(s)) {
    // si ya tiene Z o offset, úsalo tal cual; si no tiene zona, asumimos UTC y agregamos 'Z'
    if (!/[Zz]|[+\-]\d{2}:\d{2}$/.test(s)) {
      isoCandidate = s + "Z";
    }
  } else if (spaceIsoRegex.test(s)) {
    // convierte "2025-09-19 14:33:00" -> "2025-09-19T14:33:00Z"
    isoCandidate = s.replace(" ", "T") + "Z";
  } else {
    // último recurso: intentar crear Date directamente (puede funcionar para algunos formatos)
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
    // si sigue inválido, devolvemos la cadena original (fallback)
    return s;
  }

  const d = new Date(isoCandidate);
  if (isNaN(d.getTime())) {
    // fallback: devuelve la cadena original si no se pudo parsear
    return s;
  }

  return d.toLocaleString("es-CR", {
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
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);
  const [openingAmount, setOpeningAmount] = useState<number | "">("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);

  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [cashRegisterToClose, setCashRegisterToClose] =
    useState<CashRegister | null>(null);
  const [closingAmount, setClosingAmount] = useState<number | "">("");
  const [closingError, setClosingError] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/branches`);
      const data = await res.json();
      setBranches(data);
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
      setAlert({
        type: "error",
        message: "Selecciona una sucursal y un monto válido.",
      });
      return;
    }

    const payload = {
      sucursal_id: selectedBranch,
      user_id: userId,
      opening_amount: openingAmount,
    };
    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/cash-registers/open`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        // Agregamos la nueva caja tal cual viene desde el backend; formatDateSafe se encargará de parsearla
        setCashRegisters((prev) => [...prev, data.data]);

        setModalOpen(false);
        setSelectedBranch(null);
        setOpeningAmount("");
      } else {
        setAlert({
          type: "error",
          message: data.message || "Error al abrir la caja",
        });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCashRegister = async () => {
    if (!cashRegisterToClose || closingAmount === "" || closingAmount < 0)
      return;

    // 🚨 Validación: que el monto de cierre no sea menor que el de apertura
    if (Number(closingAmount) < Number(cashRegisterToClose.opening_amount)) {
      setAlert({
        type: "error",
        message: "El monto de cierre no puede ser menor al de apertura",
      });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(
        `${API_URL}/api/v1/cash-registers/close/${cashRegisterToClose.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ closing_amount: closingAmount }),
        }
      );
      const data = await res.json();

      if (res.ok) {
        setCashRegisters((prev) =>
          prev.map((c) => (c.id === cashRegisterToClose.id ? data.data : c))
        );

        setCloseModalOpen(false);
        setCashRegisterToClose(null);
        setClosingAmount("");
      } else {
        setAlert({
          type: "error",
          message: data.message || "Error al cerrar la caja",
        });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: `Error de conexión: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  const tableContent = cashRegisters.map((c) => ({
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
              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestión de Cajas
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <Button
                  style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                  onClick={() => setModalOpen(true)}
                >
                  <IoAddCircle /> Abrir nueva caja
                </Button>
              </div>

              <TableInformation headers={headers} tableContent={tableContent} />

              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <h2 className="text-xl font-bold mb-4 text-center">
                      Abrir Caja
                    </h2>

                    {alert && (
                      <div
                        className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                          alert.type === "success"
                            ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro"
                            : "bg-rojo-ultra-claro text-rojo-claro border-rojo-oscuro"
                        }`}
                      >
                        {alert.message}
                      </div>
                    )}

                    <div className="flex flex-col gap-4 mb-4">
                      <div>
                        <label className="block font-semibold mb-1">
                          Sucursal
                        </label>
                        <select
                          value={selectedBranch ?? ""}
                          onChange={(e) =>
                            setSelectedBranch(Number(e.target.value))
                          }
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
                        <label className="block font-semibold mb-1">
                          Monto de apertura
                        </label>
                        <input
                          type="number"
                          value={openingAmount}
                          onChange={(e) =>
                            setOpeningAmount(Number(e.target.value))
                          }
                          placeholder="0.00"
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

              <SimpleModal
                open={closeModalOpen}
                onClose={() => setCloseModalOpen(false)}
                title={`Cerrar Caja #${cashRegisterToClose?.id}`}
              >
                <div className="flex flex-col gap-4">
                  <label className="font-semibold">Monto de cierre:</label>
                  <div className="w-full">
                    <input
                      type="number"
                      value={closingAmount}
                      onChange={(e) => {
                        const raw = e.target.value;

                        // Si lo borran → quitamos alerta y limpiamos
                        if (raw === "") {
                          setClosingAmount("");
                          setClosingError(null);
                          return;
                        }

                        const value = Number(raw);

                        // Validar contra apertura
                        if (
                          cashRegisterToClose &&
                          value < Number(cashRegisterToClose.opening_amount)
                        ) {
                          setClosingError(
                            `El monto de cierre no puede ser menor al de apertura (${cashRegisterToClose.opening_amount})`
                          );
                        } else {
                          setClosingError(null);
                        }

                        setClosingAmount(value);
                      }}
                      className="w-full border rounded-lg px-3 py-2 [appearance:textfield]" // 👈 sin flechas
                      placeholder="0"
                    />

                    {/* Mensaje de error debajo del input */}
                    {closingError && (
                      <p className="text-rojo-claro text-sm mt-1 font-semibold">
                        {closingError}
                      </p>
                    )}
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
