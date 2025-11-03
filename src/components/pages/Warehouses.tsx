import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";

import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";
import { IoAddCircle } from "react-icons/io5";
import { RiEdit2Fill } from "react-icons/ri";
import { FaTrash } from "react-icons/fa";
import { SearchBar } from "../ui/SearchBar";
import InfoIcon from "../ui/InfoIcon";

const API_URL = import.meta.env.VITE_API_URL;

type Warehouse = {
  bodega_id: number;
  codigo: string;
  sucursal_id: number;
  branch: {
    nombre: string;
    business: {
      nombre_comercial: string;
    };
  };
};

type Branch = {
  sucursal_id: number;
  nombre: string;
  business: {
    nombre: string;
  };
};

const headers = ["ID", "Código", "Sucursal", "Negocio", "Acciones"];

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [warehousesFiltered, setWarehousesFiltered] = useState<Warehouse[]>([]);
  useEffect(() => {
    setWarehousesFiltered(warehouses);
  }, [warehouses]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [warehouseToEdit, setWarehouseToEdit] =
    useState<Partial<Warehouse> | null>(null);

  // Fetch warehouses and branches on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [warehousesRes, branchesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/warehouses`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
          fetch(`${API_URL}/api/v1/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => res.json()),
        ]);

        setWarehouses(warehousesRes);
        setBranches(branchesRes);
      } catch (err) {
        setError("Error al cargar los datos. Por favor, intente de nuevo.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async () => {
    if (selectedWarehouseId === null) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/v1/warehouses/${selectedWarehouseId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setWarehouses(
        warehouses.filter((w) => w.bodega_id !== selectedWarehouseId)
      );
      setShowModal(false);
    } catch (err) {
      setError("Error al eliminar la bodega. Por favor, intente de nuevo.");
      console.error("Error deleting warehouse:", err);
    }
  };

  const handleWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const warehouseData = {
      sucursal_id: parseInt(formData.get("sucursal_id") as string),
      codigo: formData.get("codigo") as string,
    };

    try {
      const token = localStorage.getItem("token");
      let response: Warehouse;

      if (warehouseToEdit?.bodega_id) {
        // Update existing warehouse
        response = await fetch(
          `${API_URL}/api/v1/warehouses/${warehouseToEdit.bodega_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(warehouseData),
          }
        ).then((res) => res.json());

        setWarehouses(
          warehouses.map((w) =>
            w.bodega_id === warehouseToEdit.bodega_id ? response : w
          )
        );
      } else {
        // Create new warehouse
        response = await fetch(`${API_URL}/api/v1/warehouses`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(warehouseData),
        }).then((res) => res.json());

        setWarehouses([...warehouses, response]);
      }

      setShowEditModal(false);
      setWarehouseToEdit(null);
    } catch (err: any) {
      const errorMessage =
        "Error al guardar la bodega. Por favor, intente de nuevo.";
      setError(errorMessage);
      console.error("Error saving warehouse:", err);
    }
  };

  const tableContent = warehousesFiltered.map((warehouse) => ({
    ID: warehouse.bodega_id,
    Código: warehouse.codigo,
    Sucursal: warehouse.branch?.nombre || "N/A",
    Negocio: warehouse.branch?.business?.nombre_comercial || "N/A",
    Acciones: (
      <div className="flex">
        <Button
          style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
          onClick={() => {
            setWarehouseToEdit(warehouse);
            setShowEditModal(true);
          }}
        >
          <RiEdit2Fill />
          Editar
        </Button>

        <Button
          style="bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold py-1 px-2 rounded m-1 cursor-pointer flex items-center gap-2"
          onClick={() => {
            setSelectedWarehouseId(warehouse.bodega_id);
            setShowModal(true);
          }}
        >
          <FaTrash />
          Eliminar
        </Button>
      </div>
    ),
  }));

  if (error) return <div className="text-rojo-claro p-4">{error}</div>;

  // Get user role for protected route



  return (
    <ProtectedRoute allowedRoles={["administrador", "supervisor", "bodeguero"]}>
      <Container
        page={
        <div className="w-full flex justify-center px-2 md:px-10 pt-10 overflow-x-hidden">
           
       <div className="w-full pl-2 md:pl-10 pt-10">


              <h1 className="text-2xl font-bold mb-6 text-left">
                Gestionar Bodegas
                <InfoIcon
                  title="Gestionar Bodegas"
                  description="Aquí puedes gestionar las bodegas de tu inventario.
                   Puedes añadir nuevas bodegas, editar las existentes o eliminarlas según sea necesario.
                    Añade una bodega una vez hayas creado un negocio y una sucursal."
                />
              </h1>
               <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-6">
              <div className="w-full h-10">
                  <SearchBar<Warehouse>
                    data={warehouses}
                    displayField="bodega_id"
                    searchFields={["bodega_id", "codigo"]}
                    placeholder="Buscar por ID o código..."
                    onResultsChange={(results) => {
                      setWarehousesFiltered(results);
                      if (results.length > 0) setAlert(null); // Quita la alerta si hay resultados
                    }}
                    onSelect={(item) => setWarehousesFiltered([item])}
                    onNotFound={(q) => {
                      if (!q || q.trim() === "") {
                        setAlert({
                          type: "error",
                          message:
                            "Por favor digite un ID o código para buscar.",
                        });
                      } else {
                        setWarehousesFiltered([]);
                        setAlert({
                          type: "error",
                          message: `No existe ninguna bodega con el ID o código "${q}".`,
                        });
                      }
                    }}
                    onClearAlert={() => {
                      setAlert(null); // Quita la alerta
                      
                    }}
                  />

                  {/* Mostrar solo un alert de búsqueda */}
                  {alert && (
                    <div
                      className={`mb-4 px-4 py-2 rounded-lg text-center font-semibold ${
                        alert.type === "success"
                          ? "bg-verde-ultra-claro text-verde-oscuro border-verde-claro border"
                          : "bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border"
                      }`}
                    >
                      {alert.message}
                    </div>
                  )}
                </div>
                <div className="relative group">
                  <Button
                     style="bg-azul-medio hover:bg-azul-hover text-white font-bold py-4 px-3 cursor-pointer rounded flex items-center gap-2 w-full sm:w-auto sm:mr-20"
                    onClick={() => {
                      setWarehouseToEdit(null);
                      setShowEditModal(true);
                    }}
                    disabled={branches.length === 0}
                  >
                    <IoAddCircle className="w-6 h-6 flex-shrink-0" />
                    <span className="whitespace-nowrap text-base">
                      Añadir Bodega
                    </span>
                  </Button>

                  {branches.length === 0 && (
                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Primero debe crear una sucursal
                    </div>
                  )}
                </div>
              </div>

              <TableInformation
                headers={headers}
                tableContent={tableContent}
                loading={loading}
                skeletonRows={8}
              />

              {/* Delete Confirmation Modal */}
              {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto"
                    style={{
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      width: "32rem",
                      maxHeight: "90vh",
                    }}
                  >
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-6">
                        Confirmar eliminación
                      </h2>
                      <p className="mb-6">
                        ¿Está seguro que desea eliminar esta bodega?
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          type="button"
                          className="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
                          onClick={handleDelete}
                        >
                          Eliminar
                        </button>
                        <button
                          type="button"
                          className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                          onClick={() => setShowModal(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add/Edit Warehouse Modal */}
              {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-xs"></div>
                  <div
                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto"
                    style={{
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      width: "32rem",
                      maxHeight: "90vh",
                    }}
                  >
                     <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
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
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-3">
                        {warehouseToEdit ? "Editar Bodega" : "Nueva Bodega"}
                      </h2>
                      <hr className="pb-3" />
                      {error && (
                        <div className="mb-4 px-4 py-2 rounded text-center font-semibold bg-rojo-ultra-claro text-rojo-oscuro border-rojo-claro border">
                          {error}
                        </div>
                      )}
                      <form
                        onSubmit={handleWarehouseSubmit}
                        className="flex flex-col gap-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código
                          </label>
                          <input
                            name="codigo"
                            defaultValue={warehouseToEdit?.codigo || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                            maxLength={4}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sucursal
                          </label>
                          <select
                            name="sucursal_id"
                            defaultValue={warehouseToEdit?.sucursal_id || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-smcursor-pointer"
                            required
                          >
                            <option value="">Seleccione una sucursal</option>
                            {branches.map((branch) => (
                              <option
                                key={branch.sucursal_id}
                                value={branch.sucursal_id}
                              >
                                {branch.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-azul-medio hover:bg-azul-hover text-white font-bold rounded-lg cursor-pointer"
                          >
                            {warehouseToEdit
                              ? "Guardar Cambios"
                              : "Crear Bodega"}
                          </button>
                          <button
                            type="button"
                            className="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
                            onClick={() => {
                              setShowEditModal(false);
                              setWarehouseToEdit(null);
                              setError(null);
                            }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
