import { useState, useEffect, useRef } from "react";
import { IoSearch } from "react-icons/io5";

interface SearchProps<T> {
  data: T[];
  displayField: keyof T;
  searchFields?: (keyof T)[];
  placeholder?: string;
  onSelect: (item: T) => void;
  onNotFound?: (query: string) => void;
  onResultsChange?: (results: T[]) => void;
  onClearAlert?: () => void; // <-- prop opcional
  numericPrefixStartsWith?: boolean; //Si true y la query es numérica pura, se usa startsWith en lugar de includes 
  // Formateador opcional para mostrar cada item en la lista de resultados 
  resultFormatter?: (item: T) => string;
  value?: string;
  onInputChange?: (value: string) => void;
}

export function SearchBar<T extends Record<string, any>>({
  data,
  displayField,
  searchFields,
  placeholder = "Buscar...",
  onSelect,
  onNotFound,
  onResultsChange,
  onClearAlert,
  numericPrefixStartsWith,
  resultFormatter,
  value,
  onInputChange,
}: SearchProps<T>) {
  const [query, setQuery] = useState(value ?? "");
  const [results, setResults] = useState<T[]>([]);
  const [open, setOpen] = useState(false); // <-- estado para controlar dropdown
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSignatureRef = useRef<string>("");

  useEffect(() => {
     // Función auxiliar para notificar solo si cambia la firma
    const maybeNotify = (list: T[]) => {
      const first = list[0] ? String(list[0][displayField]) : "";
      const last = list.length > 1 ? String(list[list.length - 1][displayField]) : first;
      const signature = `${list.length}|${first}|${last}`;
      if (signature !== lastSignatureRef.current) {
        lastSignatureRef.current = signature;
        onResultsChange?.(list);
      }
    };
    if (!query.trim()) {
      setResults(data);
      // Notificamos solo si cambia realmente
      maybeNotify(data);
      setOpen(false);
      return;
    }
     const lcQuery = query.toLowerCase();
    const isNumeric = numericPrefixStartsWith && /^\d+$/.test(query.trim());
    const fields = (searchFields && searchFields.length ? searchFields : [displayField]);

   const filtered = data.filter(item => fields.some(field => {
      const raw = item[field];
      if (raw == null) return false;
      const val = String(raw).toLowerCase();
      if (isNumeric) {
        return val.startsWith(lcQuery);
      }
      return val.includes(lcQuery);
    }));
    setResults(filtered);
    maybeNotify(filtered);
    setOpen(true); // Abrir dropdown al escribir
  }, [query, data, displayField, searchFields, numericPrefixStartsWith]);

  const handleSearch = () => {
    const exactMatch = data.find(
      item => String(item[displayField]).toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      setResults([exactMatch]);
      onResultsChange?.([exactMatch]);
      onSelect(exactMatch);
      setOpen(false); // cerrar dropdown al seleccionar
    } else {
      setResults([]);
      onResultsChange?.([]);
      onNotFound?.(query);
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        onClearAlert?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClearAlert]);

  // Sincroniza el estado interno con el valor externo
  useEffect(() => {
    if (typeof value === "string" && value !== query) {
      setQuery(value);
    }
  }, [value]);

  // Cuando el usuario escribe, actualiza ambos estados
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onInputChange?.(e.target.value);
  };

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 focus:outline-none"
          onClick={() => setOpen(true)}
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 flex items-center justify-center cursor-pointer"
        >
          <IoSearch />
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
          {results.map((item, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(item);
                setQuery(String(item[displayField] ?? ""));
                setOpen(false); // cerrar dropdown al seleccionar
              }}
            >
             {resultFormatter ? resultFormatter(item) : 
             (displayField ? String(item[displayField] ?? "") : JSON.stringify(item))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
