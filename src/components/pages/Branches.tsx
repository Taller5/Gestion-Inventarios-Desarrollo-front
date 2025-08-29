import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

type Branch = {
    id: number;
    businessId: number;
    businessName: string;
    name: string;
    phone: string;
    locationId: number;  // Reference to the selected location ID
};

type Business = {
    id: number;
    name: string;
};

type Location = {
    id: number;
    name: string;
    address: string;
};

const headers = ["id", "business", "name", "phone", "address", "actions"];

export default function Branches() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "";

    const [branches, setBranches] = useState<Branch[]>([]);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [branchToEdit, setBranchToEdit] = useState<Branch | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    // Datos de ejemplo para visualización
    useEffect(() => {
        // Simular carga de negocios
        const mockBusinesses: Business[] = [
            { id: 1, name: "Negocio Ejemplo 1" },
            { id: 2, name: "Negocio Ejemplo 2" }
        ];
        setBusinesses(mockBusinesses);

        // Simular carga de ubicaciones desde la base de datos
        const mockLocations: Location[] = [
            { id: 1, name: "Local Central", address: "Calle Principal #123" },
            { id: 2, name: "Sucursal Norte", address: "Avenida Norte #456" },
            { id: 3, name: "Sucursal Sur", address: "Carrera Sur #789" },
            { id: 4, name: "Bodega Principal", address: "Calle Bodegas #101" },
            { id: 5, name: "Oficinas Corporativas", address: "Avenida Empresarial #202" }
        ];
        setLocations(mockLocations);

        // Simular carga de sucursales
        const mockBranches: Branch[] = [
            {
                id: 1,
                businessId: 1,
                businessName: "Negocio Ejemplo 1",
                name: "Sucursal Norte",
                phone: "12345678",
                locationId: 2  // Reference to the location ID
            },
            {
                id: 2,
                businessId: 1,
                businessName: "Negocio Ejemplo 1",
                name: "Sucursal Sur",
                phone: "87654321",
                locationId: 3
            }
        ];
        setBranches(mockBranches);
    }, []);

    const handleDelete = async () => {
        if (selectedBranchId === null) return;
        // Aquí iría la llamada al backend
        setBranches(branches.filter(branch => branch.id !== selectedBranchId));
        setShowModal(false);
        setSelectedBranchId(null);
    };

    const getActions = (branch: Branch) => [
        <Button
            key={`edit-${branch.id}`}
            text="Editar"
            style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setBranchToEdit(branch);
                setShowEditModal(true);
            }}
        />,
        <Button
            key={`delete-${branch.id}`}
            text="Eliminar"
            style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setSelectedBranchId(branch.id);
                setShowModal(true);
            }}
        />
    ];

    const tableContent = branches.map(branch => {
        const branchLocation = locations.find(loc => loc.id === branch.locationId);
        return {
            id: branch.id,
            business: branch.businessName,
            name: branch.name,
            phone: branch.phone,
            address: branchLocation ? `${branchLocation.name} - ${branchLocation.address}` : 'No asignada',
            actions: getActions(branch)
        };
    });

    const handleBranchAdded = (branch: Branch) => {
        setBranches(prev => [...prev, branch]);
    };

    const handleBranchEdited = (updatedBranch: Branch) => {
        setBranches(prev =>
            prev.map(branch => 
                branch.id === updatedBranch.id ? updatedBranch : branch
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
                            <h1 className="text-2xl font-bold h-5">Administrar Sucursales</h1>
                            <div className="relative group">
                                <Button
                                    text="Añadir Sucursal"
                                    style={`bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-4 mr-10 rounded m-1 cursor-pointer ${businesses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        if (businesses.length === 0) {
                                            alert("No hay negocios disponibles. Por favor, cree un negocio primero.");
                                            return;
                                        }
                                        setBranchToEdit(null);
                                        setShowEditModal(true);
                                    }}
                                />
                                {businesses.length === 0 && (
                                    <div className="absolute bottom-full left-0 mb-1 w-64 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        Primero debe crear un negocio
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
                                    <p className="mb-6">¿Está seguro que desea eliminar esta sucursal?</p>
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
                                            {branchToEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}
                                        </h2>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const selectedBusiness = businesses.find(
                                                b => b.id === parseInt(formData.get('businessId') as string)
                                            );
                                            
                                            if (!selectedBusiness) {
                                                alert("Por favor seleccione un negocio válido");
                                                return;
                                            }

                                            const locationId = parseInt(formData.get('locationId') as string);
                                            const selectedLocation = locations.find(loc => loc.id === locationId);
                                            
                                            if (!selectedLocation) {
                                                alert("Por favor seleccione una ubicación válida");
                                                return;
                                            }

                                            const newBranch = {
                                                id: branchToEdit?.id || Date.now(),
                                                businessId: selectedBusiness.id,
                                                businessName: selectedBusiness.name,
                                                name: formData.get('name') as string,
                                                phone: formData.get('phone') as string,
                                                locationId: selectedLocation.id
                                            };
                                            
                                            if (branchToEdit) {
                                                handleBranchEdited(newBranch);
                                            } else {
                                                handleBranchAdded(newBranch);
                                            }
                                            setShowEditModal(false);
                                        }}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="businessId">
                                                    Negocio
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="businessId"
                                                    name="businessId"
                                                    defaultValue={branchToEdit?.businessId || ''}
                                                    required
                                                    disabled={!!branchToEdit}
                                                >
                                                    <option value="">Seleccione un negocio</option>
                                                    {businesses.map(business => (
                                                        <option key={business.id} value={business.id}>
                                                            {business.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                                                    Nombre de la Sucursal
                                                </label>
                                                <input
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    defaultValue={branchToEdit?.name || ''}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="locationId">
                                                    Ubicación
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="locationId"
                                                    name="locationId"
                                                    required
                                                    defaultValue={branchToEdit?.locationId || ''}
                                                >
                                                    <option value="">Seleccione una ubicación</option>
                                                    {locations.map(location => (
                                                        <option key={location.id} value={location.id}>
                                                            {location.name} - {location.address}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                                                    Teléfono
                                                </label>
                                                <input
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    defaultValue={branchToEdit?.phone || ''}
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end gap-4 mt-6">
                                                <button
                                                    type="button"
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                    onClick={() => setShowEditModal(false)}
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    {branchToEdit ? 'Guardar Cambios' : 'Crear Sucursal'}
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
