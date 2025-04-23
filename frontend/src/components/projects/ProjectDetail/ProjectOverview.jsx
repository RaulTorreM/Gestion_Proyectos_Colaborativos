const ProjectOverview = ({ 
  description, 
  startDate, 
  endDate, 
  duration, 
  createdBy,
  categories 
}) => {
  return (
    <div className="bg-black-800 p-4 rounded-lg border border-gray-700">
      <h3 className="font-semibold text-white mb-3">Descripción</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-white">Fecha de inicio</p>
          <p className="text-gray-400">{new Date(startDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-medium text-white">Fecha límite</p>
          <p className="text-gray-400">{new Date(endDate).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="font-medium text-white">Duración</p>
          <p className="text-gray-400">{duration} días</p>
        </div>
        <div>
          <p className="font-medium text-white">Creado por</p>
          <p className="text-gray-400">{createdBy?.name || 'No especificado'}</p>
        </div>
        <div>
          <p className="font-medium text-white">Categorías</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {categories?.map((cat, index) => (
              <span key={index} className="px-2 py-1 bg-gray-700 text-xs rounded-full text-gray-300">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;