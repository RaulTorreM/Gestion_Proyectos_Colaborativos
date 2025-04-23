const ProjectDocuments = ({ documents }) => {
  return (
    <div className="bg-black-800 p-4 rounded-lg border border-gray-700 mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Documentos</h3>
      <p className="text-sm text-gray-400 mb-4">Documentación del proyecto</p>
      
      <div className="space-y-3">
        {documents?.map(doc => (
          <div key={doc._id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-medium text-white">{doc.name}</p>
              <p className="text-xs text-gray-400">
                Actualizado {new Date(doc.updatedAt).toLocaleDateString()} por {doc.updatedBy?.name || 'Usuario'}
              </p>
            </div>
            <button className="px-3 py-1 bg-gray-600 text-sm text-white rounded hover:bg-gray-500">
              Descargar
            </button>
          </div>
        )) || (
          <p className="text-gray-400 text-sm">No hay documentos aún</p>
        )}
      </div>
      
      <div className="mt-4">
        <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Subir Documento
        </button>
      </div>
    </div>
  );
};

export default ProjectDocuments;