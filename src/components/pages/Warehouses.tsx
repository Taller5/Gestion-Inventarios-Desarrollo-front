import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

type Warehouse = {
    id: number;
    name: string;
    branchId: number;
    branchName: string;
    businessName: string;
};

type Branch = {
    id: number;
    name: string;
    businessName: string;
};

const headers = ["id", "name", "branch", "business", "actions"];

export default function Warehouses() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "";

    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null);

    // Datos de ejemplo para visualización
    useEffect(() => {
        // Simular carga de sucursales
        const mockBranches: Branch[] = [
            { id: 1, name: "Sucursal Norte", businessName: "Negocio Ejemplo 1" },
            { id: 2, name: "Sucursal Sur", businessName: "Negocio Ejemplo 1" },
            { id: 3, name: "Sucursal Centro", businessName: "Negocio Ejemplo 2" }
        ];
        setBranches(mockBranches);

        // Simular carga de bodegas
        const mockWarehouses: Warehouse[] = [
            {
                id: 1,
                name: "Bodega Principal",
                branchId: 1,
                branchName: "Sucursal Norte",
                businessName: "Negocio Ejemplo 1"
            },
            {
                id: 2,
                name: "Bodega Secundaria",
                branchId: 1,
                branchName: "Sucursal Norte",
                businessName: "Negocio Ejemplo 1"
            }
        ];
        setWarehouses(mockWarehouses);
    }, []);

    const handleDelete = async () => {
        if (selectedWarehouseId === null) return;
        // Aquí iría la llamada al backend
        setWarehouses(warehouses.filter(warehouse => warehouse.id !== selectedWarehouseId));
        setShowModal(false);
        setSelectedWarehouseId(null);
    };

    const getActions = (warehouse: Warehouse) => [
        <Button
            key={`edit-${warehouse.id}`}
            text="Editar"
            style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setWarehouseToEdit(warehouse);
                setShowEditModal(true);
            }}
        />,
        <Button
            key={`delete-${warehouse.id}`}
            text="Eliminar"
            style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setSelectedWarehouseId(warehouse.id);
                setShowModal(true);
            }}
        />
    ];

    const tableContent = warehouses.map(warehouse => ({
        id: warehouse.id,
        name: warehouse.name,
        branch: warehouse.branchName,
        business: warehouse.businessName,
        actions: getActions(warehouse)
    }));

    const handleWarehouseAdded = (warehouse: Warehouse) => {
        setWarehouses(prev => [...prev, warehouse]);
    };

    const handleWarehouseEdited = (updatedWarehouse: Warehouse) => {
        setWarehouses(prev =>
            prev.map(warehouse => 
                warehouse.id === updatedWarehouse.id ? updatedWarehouse : warehouse
            )
        );
    };

    return (
        <ProtectedRoute allowedRoles={["administrador", "supervisor"]}>
            <Container page={
                <div className="flex">
                    <SideBar role={userRole}></SideBar>
                    <div className="w-full pl-10">
                        <div className="flex items-center justify-between pt-10">
                            <h1 className="text-2xl font-bold h-5">Administrar Bodegas</h1>
                            <div className="relative group">
                                <Button
                                    text="Añadir Bodega"
                                    style={`bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-4 mr-10 rounded m-1 cursor-pointer ${branches.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        if (branches.length === 0) {
                                            alert("No hay sucursales disponibles. Por favor, cree una sucursal primero.");
                                            return;
                                        }
                                        setWarehouseToEdit(null);
                                        setShowEditModal(true);
                                    }}
                                />
                                {branches.length === 0 && (
                                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Primero debe crear una sucursal
                                    </div>
                                )}
                            </div>
                        </div>
                        <TableInformation tableContent={tableContent} headers={headers} />
                        
                        {/* Modal de confirmación de eliminación */}
                        {showModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                                <div 
                                    className="relative bg-white p-6 rounded-lg shadow-lg pointer-events-auto
                                    animate-modalShow transition-all duration-300"
                                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)", width: "32rem" }}
                                >
                                    <h2 className="text-xl font-bold mb-4">Confirmar eliminación</h2>
                                    <p className="mb-6">¿Está seguro que desea eliminar esta bodega?</p>
                                    <div className="flex justify-end gap-4">
                                        <button
                                            type="button"
                                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            onClick={handleDelete}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Modal de edición/creación */}
                        {showEditModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center">
                                <div className="absolute inset-0 bg-transparent backdrop-blur-xs"></div>
                                <div 
                                    className="relative bg-white rounded-lg shadow-lg pointer-events-auto overflow-y-auto
                                    animate-modalShow transition-all duration-300"
                                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.15)", width: "32rem", maxHeight: "90vh" }}
                                >
                                    <div className="p-6">
                                        <h2 className="text-xl font-bold mb-6">
                                            {warehouseToEdit ? 'Editar Bodega' : 'Nueva Bodega'}
                                        </h2>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const selectedBranch = branches.find(
                                                b => b.id === parseInt(formData.get('branchId') as string)
                                            );
                                            
                                            if (!selectedBranch) {
                                                alert("Por favor seleccione una sucursal válida");
                                                return;
                                            }

                                            const newWarehouse = {
                                                id: warehouseToEdit?.id || Date.now(),
                                                name: formData.get('name') as string,
                                                branchId: selectedBranch.id,
                                                branchName: selectedBranch.name,
                                                businessName: selectedBranch.businessName
                                            };
                                            
                                            if (warehouseToEdit) {
                                                handleWarehouseEdited(newWarehouse);
                                            } else {
                                                handleWarehouseAdded(newWarehouse);
                                            }
                                            setShowEditModal(false);
                                        }}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="branchId">
                                                    Sucursal
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="branchId"
                                                    name="branchId"
                                                    defaultValue={warehouseToEdit?.branchId || ''}
                                                    required
                                                    disabled={!!warehouseToEdit}
                                                >
                                                    <option value="">Seleccione una sucursal</option>
                                                    {branches.map(branch => (
                                                        <option key={branch.id} value={branch.id}>
                                                            {branch.name} - {branch.businessName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                                                    Nombre de la Bodega
                                                </label>
                                                <input
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    defaultValue={warehouseToEdit?.name || ''}
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    onClick={() => setShowEditModal(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    {warehouseToEdit ? 'Guardar Cambios' : 'Crear Bodega'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            } />
        </ProtectedRoute>
    );
}
