import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
// Types
    export type Branch = {
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

    type Props = {
        onSucursalLoaded: (branch: Branch) => void;
    };

    
export default function DashboardInformation({ onSucursalLoaded }: Props) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [branches, setBranches] = useState<Branch[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        const branchesRes = await fetch(`${API_URL}/api/v1/branches`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!branchesRes.ok) throw new Error("Error loading branches");
        const branchesData: Branch[] = await branchesRes.json();

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

        if (!cashRegisterRes.ok) throw new Error("Error loading registers");
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

    const userCashRegister = cashRegisters.find(
      (register) => register.user_id === user.id
    );
    if (!userCashRegister) return null;

    const branch = branches.find(
      (b) => b.sucursal_id === userCashRegister.sucursal_id
    );
    if (!branch) return null;

    onSucursalLoaded(branch);

    const business = businesses.find(
      (b) => b.negocio_id === branch.negocio_id
    );
    if (!business) return null;

    return {
      user: userCashRegister.user,
      cashRegister: userCashRegister,
      branch,
      business,
    };
  };

  const info = getUserInformation();

  return (
    <div className="
      w-full max-w-full 
      bg-white border border-gris-ultra-claro 
      rounded-xl shadow-sm
      p-4 sm:p-6 
      flex flex-col gap-4
      transition-all

 
  min-w-0 
  overflow-x-hidden   /* NO scroll horizontal */
  overflow-y-auto     /* SÍ scroll vertical */
    ">
      <h2 className="text-xl sm:text-2xl font-bold text-azul-medio">
        Información del usuario
      </h2>

      <hr className="border-gray-200" />

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {info ? (
            <>
              <a href="/profile" className="hover:scale-[1.02] transition-transform">
                <p className="text-base sm:text-lg font-semibold">
                  Nombre:{" "}
                  <span className="text-azul-hover">{info.user.name}</span>
                </p>
              </a>

              <a href="/cashRegisterPage" className="hover:scale-[1.02] transition-transform">
                <p className="text-base sm:text-lg font-semibold">
                  Caja:{" "}
                  <span className="text-azul-hover">{info.cashRegister.id}</span>
                </p>
              </a>

              {user.role !== "vendedor" ? (
                <a href="/branches" className="hover:scale-[1.02] transition-transform">
                  <p className="text-base sm:text-lg font-semibold">
                    Sucursal:{" "}
                    <span className="text-azul-hover">{info.branch.nombre}</span>
                  </p>
                </a>
              ) : (
                <p className="text-base sm:text-lg font-semibold">
                  Sucursal:{" "}
                  <span className="text-azul-hover">{info.branch.nombre}</span>
                </p>
              )}

              {user.role !== "vendedor" ? (
                <a href="/businesses" className="hover:scale-[1.02] transition-transform">
                  <p className="text-base sm:text-lg font-semibold">
                    Negocio:{" "}
                    <span className="text-azul-hover">
                      {info.business.nombre_comercial}
                    </span>
                  </p>
                </a>
              ) : (
                <p className="text-base sm:text-lg font-semibold">
                  Negocio:{" "}
                  <span className="text-azul-hover">
                    {info.business.nombre_comercial}
                  </span>
                </p>
              )}

              {info.business.logo && (
                <div className="flex justify-center mt-4">
                  <img
                    src={info.business.logo}
                    alt="Logo del negocio"
                    className="
                      max-w-full 
                      w-28 h-28 sm:w-40 sm:h-40
                      object-contain 
                      rounded-md shadow-md
                    "
                  />
                </div>
              )}
            </>
          ) : (
            <a
              href="/cashRegisterPage"
              className="hover:scale-[1.02] transition-transform"
            >
              <p className="text-base sm:text-lg font-semibold text-gray-600">
                Debe crear una{" "}
                <span className="text-azul-hover font-bold">caja</span> para ver su
                información
              </p>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
