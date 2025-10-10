import React from "react";
import Button from "../../ui/Button";
import SimpleModal from "../../ui/SimpleModal";

interface CategoryModalsProps {
  categoryModalOpen: boolean;
  setCategoryModalOpen: (value: boolean) => void;
  categoryEditMode: boolean;
  setCategoryEditMode: (value: boolean) => void;
  categoryForm: { nombre: string; descripcion?: string };
  setCategoryForm: React.Dispatch<React.SetStateAction<{ nombre: string; descripcion?: string }>>;
  categorySearchModal: string;
  setCategorySearchModal: (value: string) => void;
  categories: { nombre: string; descripcion?: string }[];
  openEditCategory: (cat: { nombre: string; descripcion?: string }) => void;
  categoryLoadingForm: boolean;
  saveCategory: () => void;
  categoryToDelete: string | null;
  setCategoryToDelete: (value: string | null) => void;
  alertMessage: string | null;
  setAlertMessage: (msg: string | null) => void;
  setCategoryOriginalNombre: (value: string | null) => void;
  deleteCategory?: (nombre: string) => Promise<void>;
}

export default function CategoryModals({
  categoryModalOpen,
  setCategoryModalOpen,
  categoryEditMode,
  setCategoryEditMode,
  categoryForm,
  setCategoryForm,
  categorySearchModal,
  setCategorySearchModal,
  categories,
  openEditCategory,
  categoryLoadingForm,
  saveCategory,
  categoryToDelete,
  setCategoryToDelete,
  alertMessage,
  setAlertMessage,
  setCategoryOriginalNombre,
  deleteCategory,
}: CategoryModalsProps) {
  return (
    <>
      {/* Modal Agregar / Editar */}
      {categoryModalOpen && (
        <SimpleModal
          open
          onClose={() => {
            setCategoryModalOpen(false);
            setCategoryEditMode(false);
          }}
          className={`max-w-lg ${categoryEditMode ? "bg-orange-50" : "bg-blue-50"}`}
          title={categoryEditMode ? "Editar Categoría" : "Gestionar Categorías"}
        >
          <button
            type="button"
            onClick={() => {
              setCategoryModalOpen(false);
              setCategoryEditMode(false);
            }}
            className="absolute top-3 right-4 rounded-full p-1 bg-[var(--color-rojo-ultra-claro)] hover:bg-[var(--color-rojo-claro)] transition cursor-pointer"
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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!categoryForm.nombre.trim() || !categoryForm.descripcion?.trim()) {
                setAlertMessage("Por favor, completa todos los campos antes de guardar.");
                return;
              }
              saveCategory();
            }}
            className="relative bg-white rounded-2xl w-full p-8 overflow-y-auto"
          >
            {/* Búsqueda de categorías */}
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Categorías existentes</h3>
              <input
                type="text"
                placeholder="Buscar categoría..."
                value={categorySearchModal}
                onChange={(e) => setCategorySearchModal(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-4"
              />
              {categorySearchModal.trim() !== "" && (
                <ul className="max-h-64 overflow-y-auto border rounded-lg">
                  {categories
                    .filter((cat) =>
                      cat.nombre.toLowerCase().includes(categorySearchModal.toLowerCase())
                    )
                    .map((cat) => (
                      <li
                        key={cat.nombre}
                        className="flex justify-between items-center py-2 px-3 border-b last:border-b-0"
                      >
                        <div>
                          <span className="font-semibold">{cat.nombre}</span>{" "}
                          <span className="text-gray-500">{cat.descripcion}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="bg-azul-medio hover:bg-azul-hover text-white px-4 py-1 rounded-lg font-semibold transition"
                            onClick={() => openEditCategory(cat)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="bg-rojo-claro hover:bg-rojo-oscuro text-white px-4 py-1 rounded-lg font-semibold transition"
                            onClick={() => setCategoryToDelete(cat.nombre)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Formulario */}
            <div className="flex flex-col gap-4 mt-10">
              <label className="w-full font-bold">
                {categoryEditMode
                  ? "Edita los datos de la categoría"
                  : "Digite los datos de la nueva categoría"}
              </label>
              <label className="font-semibold">
                Nombre
                <input
                  name="nombre"
                  value={categoryForm.nombre}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9]/g, "");
                    setCategoryForm((f) => ({ ...f, nombre: value }));
                  }}
                  placeholder="Nombre de la categoría"
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </label>
              <label className="font-semibold">
                Descripción
                <textarea
                  name="descripcion"
                  value={categoryForm.descripcion}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[0-9]/g, "");
                    setCategoryForm((f) => ({ ...f, descripcion: value }));
                  }}
                  placeholder="Descripción de la categoría"
                  className="w-full border rounded-lg px-3 py-2 min-h-[60px]"
                  required
                />
              </label>
            </div>

            {/* Botones */}
            <div className="flex gap-4 justify-end mt-6">
              <button
                type="submit"
                disabled={categoryLoadingForm}
                className={`font-bold rounded-lg shadow-md transition w-40 h-12 cursor-pointer ${
                  categoryEditMode
                    ? "bg-amarillo-claro hover:bg-amarillo-oscuro text-white"
                    : "bg-azul-medio hover:bg-azul-hover text-white"
                }`}
              >
                {categoryLoadingForm
                  ? "Guardando..."
                  : categoryEditMode
                  ? "Guardar cambios"
                  : "Agregar"}
              </button>

              {categoryEditMode && (
                <button
                  type="button"
                  className="bg-verde-claro hover:bg-verde-oscuro text-white font-bold rounded-lg shadow-md transition w-40 h-12"
                  onClick={() => {
                    setCategoryForm({ nombre: "", descripcion: "" });
                    setCategoryEditMode(false);
                    setCategoryOriginalNombre(null);
                  }}
                >
                  Volver
                </button>
              )}
            </div>
          </form>
        </SimpleModal>
      )}

      {/* Confirmación eliminación */}
      {categoryToDelete && deleteCategory && (
        <SimpleModal open onClose={() => setCategoryToDelete(null)} title="Eliminar categoría">
          <p className="mb-6 text-center">
            ¿Seguro que deseas eliminar la categoría <b>{categoryToDelete}</b>? Esto no se puede deshacer.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              text="Eliminar"
              style="px-6 py-2 bg-rojo-claro hover:bg-rojo-oscuro text-white font-bold rounded-lg cursor-pointer"
              onClick={async () => {
                try {
                  await deleteCategory(categoryToDelete);
                } catch {
                  setAlertMessage("No se pudo eliminar la categoría.");
                } finally {
                  setCategoryToDelete(null);
                }
              }}
            />
            <Button
              text="Cancelar"
              style="bg-gris-claro hover:bg-gris-oscuro text-white font-bold px-6 py-2 rounded-lg shadow-md transition cursor-pointer"
              onClick={() => setCategoryToDelete(null)}
            />
          </div>
        </SimpleModal>
      )}

      {/* Alerta */}
      {alertMessage && (
        <SimpleModal open onClose={() => setAlertMessage(null)} title="Atención">
          <p className="text-center">{alertMessage}</p>
          <div className="flex justify-center mt-6">
            <button
              type="button"
              className="bg-azul-medio hover:bg-azul-hover text-white font-bold px-6 py-2 rounded-lg"
              onClick={() => setAlertMessage(null)}
            >
              Aceptar
            </button>
          </div>
        </SimpleModal>
      )}
    </>
  );
}
