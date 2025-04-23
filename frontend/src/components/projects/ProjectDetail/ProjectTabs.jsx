const ProjectTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'details', name: 'Detalles' },
    { id: 'performance', name: 'Rendimiento' },
    { id: 'documents', name: 'Documentos' }
  ];

  return (
    <div className="border-b border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProjectTabs;