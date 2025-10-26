import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import TableInformation from "../ui/TableInformation";
import Button from "../ui/Button";
import Container from "../ui/Container";
import SimpleModal from "../ui/SimpleModal";

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
  available_amount: number;
};

const headers = [
  "ID",
  "Sucursal",
  "Usuario",
  "Monto apertura",
  "Monto cierre",
  "Disponible",
  "Abierta",
  "Cerrada",
  "Acciones",
];

const API_URL = import.meta.env.VITE_API_URL as string;

const formatDateSafe = (input?: string | number | null) => {
  if (!input) return "-";

  // Si es un número (timestamp)
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

  // Si contiene letras o símbolos y no tiene "T", devolver tal cual
  if (/[\/a-zA-ZñÑáéíóúÁÉÍÓÚ]/.test(s) && !/T/.test(s)) return s;

  let isoCandidate = s;

  // Formato ISO completo
  if (
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?$/.test(
      s
    )
  ) {
    if (!/([Zz]|[+\-]\d{2}:\d{2})$/.test(s)) isoCandidate += "Z";
  }

  // Formato "YYYY-MM-DD HH:MM(:SS)"
  else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(?::\d{2})?$/.test(s)) {
    isoCandidate = s.replace(" ", "T") + "Z";
  }
  // Otros formatos que Date pueda interpretar
  else {
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
    return s; // si no es fecha, devolver string tal cual
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
  const [businesses, setBusinesses] = useState<
    { negocio_id: number; nombre_comercial: string }[]
  >([]);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
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
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  // Declaración en tu componente
  const [cashRegisterToOpen, setCashRegisterToOpen] = useState<CashRegister | null>(null);


  const mostrarAlerta = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
  };
  const [closeModalAlert, setCloseModalAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [reopenModalOpen, setReopenModalOpen] = useState(false);

  const MAX_AMOUNT = 99999999.99;

  const fetchBranches = async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/branches`);
      const data = await res.json();
      setBranches(data);

      // Extraer negocios únicos
      const map = new Map<
        number,
        { negocio_id: number; nombre_comercial: string }
      >();
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
  if (!cashRegisterToOpen || openingAmount === "" || openingAmount <= 0) {
    setAlert({
      type: "error",
      message: "Selecciona una caja y un monto válido.",
    });
    return;
  }

  setLoading(true);
  setAlert(null);

  try {
    const res = await fetch(
      `${API_URL}/api/v1/cash-registers/open/${cashRegisterToOpen.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cashRegisterToOpen.id, //  enviar id en body también
          user_id: userId,
          opening_amount: openingAmount,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error al abrir la caja.");
    }

    setCashRegisters((prev) =>
      prev.map((c) => (c.id === data.data.id ? data.data : c))
    );

    mostrarAlerta("success", `Caja #${data.data.id} abierta correctamente`);
    setModalOpen(false);
    setCashRegisterToOpen(null);
    setOpeningAmount("");
  } catch (err: any) {
    setAlert({ type: "error", message: err.message });
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
    // 🔹 Si no hay negocio seleccionado, tabla vacía
    if (!selectedBusiness) return false;

    let matchBusiness = true;
    let matchDate = true;

    if (selectedBusiness) {
      const branch = branches.find((b) => b.sucursal_id === c.sucursal_id);
      const negocioId = branch?.business?.negocio_id;
      matchBusiness = negocioId === selectedBusiness;
    }

    if (startDate) {
      matchDate =
        matchDate &&
        new Date(c.opened_at || 0).getTime() >= new Date(startDate).getTime();
    }
    if (endDate) {
      matchDate =
        matchDate &&
        new Date(c.opened_at || 0).getTime() <= new Date(endDate).getTime();
    }

    return matchBusiness && matchDate;
  });

  useEffect(() => {
    if (!selectedBusiness) return; // nada que hacer si no hay negocio seleccionado

    const hasCashRegisters = cashRegisters.some((c) => {
      const branch = branches.find((b) => b.sucursal_id === c.sucursal_id);
      return branch?.business?.negocio_id === selectedBusiness;
    });

    if (!hasCashRegisters) {
      setAlert({
        type: "error",
        message: "No hay cajas registradas para el negocio seleccionado.",
      });
    } else {
      setAlert(null);
    }
  }, [selectedBusiness, cashRegisters, branches]);

  // dentro de tu componente CashRegisterPage
  const [emptyModalOpen, setEmptyModalOpen] = useState(false);
  const [selectedBranchEmpty, setSelectedBranchEmpty] = useState<number | null>(
    null
  );

  const handleCreateEmptyCashRegister = async () => {
    if (!selectedBranchEmpty) {
      setAlert({ type: "error", message: "Selecciona una sucursal." });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const res = await fetch(`${API_URL}/api/v1/cash-registers/create-empty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sucursal_id: selectedBranchEmpty,
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error al crear caja vacía");

      setCashRegisters((prev) => [...prev, data.data]);
      setEmptyModalOpen(false);
      setSelectedBranchEmpty(null);

      mostrarAlerta("success", "Caja vacía creada correctamente");
    } catch (err: any) {
      mostrarAlerta("error", err.message || "Error al crear caja vacía");
    } finally {
      setLoading(false);
    }
  };

  const tableContent = filteredCashRegisters.map((c) => {
    // Normalizar montos: si es null, undefined o 0 string, lo convertimos a 0 numérico
    const opening = Number(c.opening_amount) || 0;
    const available = Number(c.available_amount) || 0;
    const closing = Number(c.closing_amount) || 0;

    // Detecta caja vacía solo por montos
    const isEmpty =
      opening === 0 && available === 0 && closing === 0 && !c.closed_at;

    return {
      ID: c.id,
      Sucursal: c.branch?.nombre ?? "-",
      Usuario: c.user?.name ?? "-",
      "Monto apertura": opening.toLocaleString(undefined, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      "Monto cierre": c.closed_at
        ? closing.toLocaleString(undefined, {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })
        : "-",
      ...(!c.closed_at && {
        Disponible: available.toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
      }),
      Abierta: formatDateSafe(c.opened_at),
      Cerrada: c.closed_at ? formatDateSafe(c.closed_at) : "-",
      Acciones: (
        <div className="flex gap-2">
         {isEmpty && (
            <Button
              style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => {
                setCashRegisterToOpen(c); //  guarda la caja seleccionada
                setSelectedBranch(c.sucursal_id);
                setModalOpen(true);
              }}
              disabled={loading}
            >
              Abrir Caja
            </Button>
          )}

          {!c.closed_at && !isEmpty && (
            <Button
              style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => {
                setCashRegisterToClose(c);
                setCloseModalOpen(true);
              }}
              disabled={loading}
            >
              Cerrar
            </Button>
          )}
          {c.closed_at && (
            <Button
              style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-2 py-1 rounded text-sm cursor-pointer"
              onClick={() => {
                setCashRegisterToClose(c);
                setReopenModalOpen(true);
              }}
              disabled={loading}
            >
              Reabrir
            </Button>
          )}
        </div>
      ),
    };
  });

  // Auto-cerrar alertas después de 5 segundos
  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => setAlert(null), 5000); // 5000 ms = 5 segundos
    return () => clearTimeout(timer); // limpiar si cambia alert antes de tiempo
  }, [alert]);

  useEffect(() => {
    if (!closeModalAlert) return;

    const timer = setTimeout(() => setCloseModalAlert(null), 5000);
    return () => clearTimeout(timer);
  }, [closeModalAlert]);

  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "vendedor"]}>
      <Container
        page={
          <div className="flex">
            <SideBar role={userRole} />
            <div className="w-full pl-10 pt-10">
              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestionar Cajas
              </h1>

              {/* Filtros */}
              <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div>
                  <label className="block font-semibold mb-1">Negocio</label>
                  <select
                    value={selectedBusiness ?? ""}
                    onChange={(e) =>
                      setSelectedBusiness(Number(e.target.value) || null)
                    }
                    className="border rounded-lg px-3 py-2 cursor-pointer"
                  >
                    <option value="">Selecciona un negocio</option>
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
                    className="border rounded-lg px-3 py-2 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Hasta</label>
                  <input
                    type="date"
                    value={endDate ?? ""}
                    onChange={(e) => setEndDate(e.target.value || null)}
                    className="border rounded-lg px-3 py-2 cursor-pointer"
                  />
                </div>
                <div>
                  <Button
                    style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-4 py-2 rounded cursor-pointer"
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

              <Button
                style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-2 px-4 rounded cursor-pointer"
                onClick={() => setEmptyModalOpen(true)}
              >
                Crear nueva caja
              </Button>

              <TableInformation headers={headers} tableContent={tableContent} />

              {/* Modal Abrir Caja */}
              {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                     <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      aria-label="Cerrar"
                      className="absolute top-4 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer"
                      style={{ zIndex: 10 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-[var(--color-rojo-oscuro)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <h2 className="text-xl font-bold mb-4 text-center">
                      Abrir Caja
                    </h2>

                    <div className="flex flex-col gap-4 mb-4">
                      <div>
                        <label className="block font-semibold mb-1">
                          Sucursal
                        </label>
                        <p className="w-full border rounded-lg px-3 py-2 bg-gray-50">
                          {branches.find(
                            (b) => b.sucursal_id === selectedBranch
                          )?.nombre || "Sin sucursal seleccionada"}
                        </p>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">
                          Monto de apertura
                        </label>
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
                              setAlert({
                                type: "error",
                                message: `El monto no puede poseer más de 8 dígitos`,
                              });
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

              {/* Modal Crear Caja Vacía */}
              <SimpleModal
                open={emptyModalOpen}
                onClose={() => setEmptyModalOpen(false)}
                title="Crear caja nueva"
              >
                <div className="flex flex-col gap-4">

                  <div>
                    <label className="block font-semibold mb-1">Sucursal</label>
                    <select
                      value={selectedBranchEmpty ?? ""}
                      onChange={(e) =>
                        setSelectedBranchEmpty(Number(e.target.value))
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
                      Usuario creador
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="font-semibold">Montos</label>
                    <input
                      type="text"
                      value="0.00"
                      readOnly
                      className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      style="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={handleCreateEmptyCashRegister}
                      disabled={loading}
                    >
                      {loading ? "Creando..." : "Crear caja Nueva"}
                    </Button>

                    <Button
                      style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={() => setEmptyModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </SimpleModal>

              {/* Modal Reabrir Caja */}
              <SimpleModal
                open={reopenModalOpen}
                onClose={() => setReopenModalOpen(false)}
                title={`Reabrir Caja #${cashRegisterToClose?.id}`}
              >
                <div className="flex flex-col gap-4">
                  <p className="text-gray-700 text-sm">
                    ¿Deseas reabrir la caja <b>#{cashRegisterToClose?.id}</b>?
                    Se mantendrán los montos actuales y el usuario será
                    actualizado al actual (<b>{user.name}</b>).
                  </p>

                  <div className="flex gap-4 justify-end mt-4">
                    <Button
                      style="bg-verde-claro hover:bg-verde-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={async () => {
                        if (!cashRegisterToClose) return;

                        try {
                          setLoading(true);
                          const res = await fetch(
                            `${API_URL}/api/v1/cash-registers/reopen/${cashRegisterToClose.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ user_id: userId }),
                            }
                          );

                          const data = await res.json();

                          if (!res.ok) {
                            // Si el backend devuelve error (como "usuario ya tiene caja activa")
                            throw new Error(
                              data.message || "Error al reabrir la caja"
                            );
                          }

                          // Mostrar alerta de éxito
                          mostrarAlerta(
                            "success",
                            `Caja #${data.data.id} reabierta correctamente`
                          );

                          // Actualizar lista local
                          setCashRegisters((prev) =>
                            prev.map((c) =>
                              c.id === data.data.id ? data.data : c
                            )
                          );

                          // Cerrar modal después de mostrar éxito
                          setTimeout(() => setReopenModalOpen(false), 1000);
                        } catch (err: any) {
                          console.error(err);
                          // Mostrar el mensaje de error que venga del backend
                          mostrarAlerta(
                            "error",
                            err.message ||
                              "No se pudo reabrir la caja. Intenta nuevamente."
                          );
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? "Reabriendo..." : "Reabrir Caja"}
                    </Button>

                    <Button
                      style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={() => setReopenModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </SimpleModal>

              {/* Modal Cerrar Caja */}
              {alert && (
                <div
                  onClick={() => setAlert(null)} // click en cualquier lugar cierra
                  className="fixed inset-0 z-50 flex items-start justify-center p-4"
                >
                  <div
                    className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                      alert.type === "success"
                        ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro"
                        : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-oscuro"
                    }`}
                    onClick={(e) => e.stopPropagation()} // click dentro NO cierra
                  >
                    {alert.message}
                    <button
                      className="ml-2 font-bold"
                      onClick={() => setAlert(null)}
                    >
                      X
                    </button>
                  </div>
                </div>
              )}

              <SimpleModal
                open={closeModalOpen}
                onClose={() => {
                  setCloseModalOpen(false);
                  setCloseModalAlert(null); // limpiar alerta al cerrar modal
                }}
                title={`Cerrar Caja #${cashRegisterToClose?.id}`}
              >
                <div className="flex flex-col gap-4">
                  {/* ⚠️ Alerta local del modal */}
                  {closeModalAlert && (
                    <div
                      className={`px-4 py-2 rounded-lg text-center font-semibold ${
                        closeModalAlert.type === "success"
                          ? "bg-verde-ultra-claro text-verde-oscuro border border-verde-claro"
                          : "bg-rojo-ultra-claro text-rojo-oscuro border border-rojo-oscuro"
                      } flex justify-between items-center`}
                    >
                      {closeModalAlert.message}
                      <button
                        className="ml-2 font-bold text-lg"
                        onClick={() => setCloseModalAlert(null)}
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <label className="font-semibold">
                    Monto disponible al cerrar:
                  </label>
                  <input
                    type="text"
                    value={
                      cashRegisterToClose?.available_amount
                        ? Number(
                            cashRegisterToClose.available_amount
                          ).toLocaleString("es-CR", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"
                    }
                    readOnly
                    className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />

                  <div className="flex justify-end gap-4 mt-4">
                    <Button
                      style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={async () => {
                        if (!cashRegisterToClose) return;

                        // ⚠️ Validación: solo el usuario que abrió la caja puede cerrarla
                        if (cashRegisterToClose.user?.id !== userId) {
                          setCloseModalAlert({
                            type: "error",
                            message:
                              "No puedes cerrar esta caja. Solo el usuario que la abrió puede hacerlo.",
                          });

                          //  Cerrar modal automáticamente después de 2 segundos
                          setTimeout(() => {
                            setCloseModalOpen(false);
                            setCloseModalAlert(null);
                          }, 2000);
                          return;
                        }

                        try {
                          setLoading(true);

                          const res = await fetch(
                            `${API_URL}/api/v1/cash-registers/close/${cashRegisterToClose.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ user_id: userId }),
                            }
                          );

                          const data = await res.json();

                          if (!res.ok) {
                            setCloseModalAlert({
                              type: "error",
                              message:
                                data.message || "Error al cerrar la caja.",
                            });
                            return;
                          }

                          //  Éxito
                          setCloseModalAlert({
                            type: "success",
                            message: `Caja #${data.data.id} cerrada correctamente.`,
                          });

                          //  Actualizar lista local
                          setCashRegisters((prev) =>
                            prev.map((c) =>
                              c.id === data.data.id ? data.data : c
                            )
                          );

                          //  Esperar un poco y cerrar modal
                          setTimeout(() => {
                            setCloseModalOpen(false);
                            setCloseModalAlert(null);
                          }, 1000);
                        } catch (error) {
                          console.error(error);
                          setCloseModalAlert({
                            type: "error",
                            message: "Ocurrió un error al cerrar la caja.",
                          });
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                    >
                      {loading ? "Cerrando..." : "Cerrar Caja"}
                    </Button>

                    <Button
                      style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                      onClick={() => {
                        setCloseModalOpen(false);
                        setCloseModalAlert(null); // limpiar alerta al cancelar
                      }}
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
