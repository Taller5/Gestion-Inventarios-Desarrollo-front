import { useState, useEffect } from "react";

interface SearchProps<T> {
  /** Endpoint de la API donde buscar */
  url: string;
  /** Función que define cómo filtrar los resultados según el término */
  filterFn?: (item: T, query: string) => boolean;
  /** Campo que se muestra en la lista de resultados (opcional) */
  displayField?: keyof T;
  /** Callback que devuelve el resultado seleccionado */
  onSelect: (item: T) => void;
  /** Placeholder del input */
  placeholder?: string;
}

/**
 * Componente genérico de búsqueda
 */
export function SearchBar<T extends Record<string, any>>({
  url,
  filterFn,
  displayField,
  onSelect,
  placeholder = "Buscar...",
}: SearchProps<T>) {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<T[]>([]);
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        const json: T[] = await res.json();
        setData(json);
        setResults(json);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  useEffect(() => {
    if (!query) {
      setResults(data);
    } else {
      const filtered = data.filter(item =>
        filterFn ? filterFn(item, query) :
        // Por defecto filtra por string si displayField existe
        displayField ? String(item[displayField]).toLowerCase().includes(query.toLowerCase()) :
        false
      );
      setResults(filtered);
    }
  }, [query, data, filterFn, displayField]);

  return (
    <div className="w-full relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      {loading && <div className="absolute right-3 top-3 text-gray-500">Cargando...</div>}
      {results.length > 0 && query && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50">
          {results.map((item, idx) => (
            <li
              key={idx}
              onClick={() => {
                onSelect(item);
                setQuery(""); // limpiar búsqueda si quieres
              }}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {displayField ? item[displayField] : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
