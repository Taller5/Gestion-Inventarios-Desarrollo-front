import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
// Types
    type Branch = {
    sucursal_id: number;
    negocio_id: number;
    nombre: string;
    provincia: string;
    canton: string;
    telefono: string;
    negocio?: {
        nombre: string;
    };
    };
    type Business = {
    nombre_comercial: string;
    negocio_id: number;
    nombre_legal: string;
    logo: string;
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
    
export default function DashboardInformation() {

     const user = JSON.parse(localStorage.getItem("user") || "{}");
     const token = localStorage.getItem("token");
    
      // State
     const [branches, setBranches] = useState<Branch[]>([]);
     const [businesses, setBusinesses] = useState<Business[]>([]);
     const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
         const fetchData = async () => {
           try {
             // Fetch businesses
             const businessesRes = await fetch(`${API_URL}/api/v1/businesses`, {
               headers: {
                 Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json",
                 Accept: "application/json",
               },
             });
     
             if (!businessesRes.ok) throw new Error("Error loading businesses");
             const businessesData: Business[] = await businessesRes.json();
             setBusinesses(businessesData);
     
             // Fetch branches
             const branchesRes = await fetch(`${API_URL}/api/v1/branches`, {
               headers: {
                 Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json",
                 Accept: "application/json",
               },
             });
     
             if (!branchesRes.ok) throw new Error("Error loading branches");
             const branchesData: Branch[] = await branchesRes.json();
     
             // Enriquecer cada sucursal con el nombre del negocio usando show
             const enrichedBranches = await Promise.all(
               branchesData.map(async (branch) => {
                 if (branch.negocio_id) {
                   const res = await fetch(
                     `${API_URL}/api/v1/businesses/${branch.negocio_id}`,
                     {
                       headers: {
                         Authorization: `Bearer ${token}`,
                         "Content-Type": "application/json",
                         Accept: "application/json",
                       },
                     }
                   );
                   if (res.ok) {
                     const negocio = await res.json();
                     branch.negocio = { nombre: negocio.nombre_comercial };
                   }
                 }
                 return branch;
               })
             );

            const cashRegisterRes = await fetch(`${API_URL}/api/v1/cash-registers`, {
               headers: {
                 Authorization: `Bearer ${token}`,
                 "Content-Type": "application/json",
                 Accept: "application/json",
               },
             });

             if (!cashRegisterRes.ok) throw new Error("Error loading branches");
             const cashRegistersData: CashRegister[] = await cashRegisterRes.json();
             setCashRegisters(cashRegistersData);
     
             setBranches(enrichedBranches);
           } catch (error) {
             console.error("Error loading data:", error);
           } finally {
             setLoading(false);
           }
         };
     
         fetchData();
       }, [token]);


       const getUserInformation = () => {
        if (!user?.id) return null;

        // Buscar la caja asociada al usuario
        const userCashRegister = cashRegisters.find(
            (register) => register.user_id === user.id
        );
        if (!userCashRegister) return null;

        // Buscar la sucursal asociada a la caja
        const branch = branches.find(
            (b) => b.sucursal_id === userCashRegister.sucursal_id
        );
        if (!branch) return null;

        // Buscar el negocio asociado a la sucursal
        const business = businesses.find(
            (b) => b.negocio_id === branch.negocio_id
        );
        if (!business) return null;

        // Retornar la información completa
        return {
            user: userCashRegister.user,
            cashRegister: userCashRegister,
            branch,
            business,
        };
    };

    return(
        <div>
            <h2 className="text-2xl font-bold">Información del usuario</h2>
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    {getUserInformation() && (
                        <div>
                            <p className="mt-4">Nombre: {getUserInformation()?.user.name}</p>
                            <p className="mt-4">Caja: {getUserInformation()?.cashRegister.id}</p>
                            <p className="mt-4">Sucursal: {getUserInformation()?.branch.nombre}</p>
                            <p className="mt-4">Negocio: {getUserInformation()?.business.nombre_comercial}</p>
                            <img src="" alt="" />
                        </div>
                    )}
                            
                            
                </div>
            )}
        </div>
    );
}