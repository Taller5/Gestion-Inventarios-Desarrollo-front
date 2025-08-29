import { useEffect, useState } from "react";
import ProtectedRoute from "../services/ProtectedRoute";
import SideBar from "../ui/SideBar";
import Button from "../ui/Button";
import TableInformation from "../ui/TableInformation";
import Container from "../ui/Container";

type Location = {
    id: number;
    name: string;
    address: string;
};

type Business = {
    id: number;
    name: string;
    description: string;
    phone: string;
    locationId: number;  // Reference to the selected location ID
};

const headers = ["id", "name", "description", "phone", "address", "actions"];

export default function Businesses() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user.role || "";

    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [businessToEdit, setBusinessToEdit] = useState<Business | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    // Datos de ejemplo para visualización
    useEffect(() => {
        // Simular carga de ubicaciones desde la base de datos
        const mockLocations: Location[] = [
            { id: 1, name: "Local Central", address: "Calle Principal #123" },
            { id: 2, name: "Oficinas Corporativas", address: "Avenida Empresarial #202" },
            { id: 3, name: "Planta de Producción", address: "Zona Industrial #456" }
        ];
        setLocations(mockLocations);

        // Simular carga de negocios
        const mockBusinesses: Business[] = [
            {
                id: 1,
                name: "Negocio Ejemplo 1",
                description: "Descripción del negocio 1",
                phone: "12345678",
                locationId: 1
            },
            {
                id: 2,
                name: "Negocio Ejemplo 2",
                description: "Descripción del negocio 2",
                phone: "87654321",
                locationId: 2
            }
        ];
        setBusinesses(mockBusinesses);
    }, []);

    const handleDelete = async () => {
        if (selectedBusinessId === null) return;
        // Aquí iría la llamada al backend
        setBusinesses(businesses.filter(business => business.id !== selectedBusinessId));
        setShowModal(false);
        setSelectedBusinessId(null);
    };

    const getActions = (business: Business) => [
        <Button
            text="Editar"
            style="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setBusinessToEdit(business);
                setShowEditModal(true);
            }}
        />,
        <Button
            text="Eliminar"
            style="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded m-1 cursor-pointer"
            onClick={() => {
                setSelectedBusinessId(business.id);
                setShowModal(true);
            }}
        />
    ];

    const tableContent = businesses.map(business => {
        const businessLocation = locations.find(loc => loc.id === business.locationId);
        return {
            id: business.id,
            name: business.name,
            description: business.description,
            phone: business.phone,
            address: businessLocation ? `${businessLocation.name} - ${businessLocation.address}` : 'No asignada',
            actions: getActions(business)
        };
    });

    const handleBusinessAdded = (business: Business) => {
        setBusinesses(prev => [...prev, business]);
    };

    const handleBusinessEdited = (updatedBusiness: Business) => {
        setBusinesses(prev =>
            prev.map(business => 
                business.id === updatedBusiness.id ? updatedBusiness : business
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
                            <h1 className="text-2xl font-bold h-5">Administrar Negocios</h1>
                            <Button
                                text="Añadir Negocio"
                                style="bg-azul-fuerte hover:bg-azul-claro text-white font-bold py-2 px-4 mr-10 rounded m-1 cursor-pointer"
                                onClick={() => {
                                    setBusinessToEdit(null);
                                    setShowEditModal(true);
                                }}
                            />
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
                                    <p className="mb-6">¿Está seguro que desea eliminar este negocio?</p>
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
                                            {businessToEdit ? 'Editar Negocio' : 'Nuevo Negocio'}
                                        </h2>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.currentTarget);
                                            const locationId = parseInt(formData.get('locationId') as string);
                                            const selectedLocation = locations.find(loc => loc.id === locationId);
                                            
                                            if (!selectedLocation) {
                                                alert("Por favor seleccione una ubicación válida");
                                                return;
                                            }

                                            const newBusiness = {
                                                id: businessToEdit?.id || Date.now(),
                                                name: formData.get('name') as string,
                                                description: formData.get('description') as string,
                                                phone: formData.get('phone') as string,
                                                locationId: selectedLocation.id
                                            };
                                            
                                            if (businessToEdit) {
                                                handleBusinessEdited(newBusiness);
                                            } else {
                                                handleBusinessAdded(newBusiness);
                                            }
                                            setShowEditModal(false);
                                        }}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                                                    Nombre del Negocio
                                                </label>
                                                <input
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    defaultValue={businessToEdit?.name || ''}
                                                    required
                                                />
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    id="description"
                                                    name="description"
                                                    rows={3}
                                                    defaultValue={businessToEdit?.description || ''}
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
                                                    defaultValue={businessToEdit?.locationId || ''}
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
                                                    type="text"
                                                    defaultValue={businessToEdit?.phone || ''}
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
                                                    {businessToEdit ? 'Guardar Cambios' : 'Crear Negocio'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }/>
        </ProtectedRoute>
    );
}
