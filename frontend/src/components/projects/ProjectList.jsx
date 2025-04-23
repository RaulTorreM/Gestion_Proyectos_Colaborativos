import ProjectListView from './ProjectListView';

const ProjectList = ({ projects, onProjectClick }) => {
  return (
    <div className="bg-black-900 rounded-lg border border-gray-700 overflow-visible shadow-lg">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-black-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Progreso</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Fecha Inicio</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Fecha Fin</th>
            <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Miembros</th>
          </tr>
        </thead>
        <tbody className="bg-black-900 divide-y divide-gray-800">
          {projects.map((project) => (
            <ProjectListView 
              key={project._id} 
              project={project} 
              onClick={() => onProjectClick(project)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectList;