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
}: SearchProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const [open, setOpen] = useState(false); // <-- estado para controlar dropdown
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(data);
      onResultsChange?.(data);
      setOpen(false);
      return;
    }

    const filtered = data.filter(item =>
      (searchFields || [displayField]).some(
        field =>
          item[field] &&
          String(item[field]).toLowerCase().includes(query.toLowerCase())
      )
    );
    setResults(filtered);
    onResultsChange?.(filtered);
    setOpen(true); // Abrir dropdown al escribir
  }, [query, data, displayField]);

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

  return (
    <div ref={containerRef} className="w-full relative">
      <div className="flex border border-gray-300 rounded-md overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
              {displayField ? item[displayField] : JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
