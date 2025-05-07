import { FiX } from 'react-icons/fi';

const EditProjectModal = ({ onClose, project }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative dark:bg-zinc-800">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-300 hover:text-gray-200"
        >
          <FiX size={22} />
        </button>

        <h2 className="text-2xl font-bold mb-4 dark:text-white">Editar Proyecto</h2>

        <form className="space-y-4">
          <div>
            <label className="block font-medium text-sm mb-1 dark:text-gray-300">Nombre del proyecto</label>
            <input 
              type="text" 
              defaultValue={project.name}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-sm mb-1 dark:text-gray-300">Estado</label>
            <input 
              type="text" 
              defaultValue={project.status}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
            />
          </div>

          {/* Agrega más campos si deseas */}

          <div className="flex justify-end pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 mr-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
    </div>
  );
};

export default EditProjectModal;
