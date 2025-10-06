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
  onClearAlert?: () => void; // <-- nuevo prop opcional para limpiar alerta
}

export function SearchBar<T extends Record<string, any>>({
  data,
  displayField,
  searchFields,
  placeholder = "Buscar...",
  onSelect,
  onNotFound,
  onResultsChange,
  onClearAlert, // <-- recibimos el prop
}: SearchProps<T>) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<T[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults(data);
      onResultsChange?.(data);
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
  }, [query, data, displayField]);

  const handleSearch = () => {
    const exactMatch = data.find(
      item => String(item[displayField]).toLowerCase() === query.toLowerCase()
    );

    if (exactMatch) {
      setResults([exactMatch]);
      onResultsChange?.([exactMatch]);
      onSelect(exactMatch);
    } else {
      setResults([]);
      onResultsChange?.([]);
      onNotFound?.(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Limpiar alerta al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 flex items-center justify-center cursor-pointer"
        >
          <IoSearch />
        </button>
      </div>

      {results.length > 0 && query && (
        <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto z-50 shadow-lg">
          {results.map((item, idx) => (
            <li
              key={idx}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(item);
                setQuery(String(item[displayField] ?? ""));
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
