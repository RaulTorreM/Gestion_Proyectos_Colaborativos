import React from 'react';

const VersionList = ({ versions, searchTerm, setSearchTerm, selectedVersion, setSelectedVersion, theme }) => {
  const filteredVersions = (versions || [])
    .filter(version => {
      if (!version || !version.name) return false;
      return version.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <div className={`rounded-xl p-4 h-full ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white border border-gray-200'}`}>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar versiones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full px-3 py-2 rounded-lg ${
            theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
          } border`}
        />
      </div>

      <div className="space-y-2 max-h-[calc(100%-50px)] overflow-y-auto">
        {filteredVersions.length > 0 ? (
          filteredVersions.map(version => (
            <div
              key={version._id}
              onClick={() => setSelectedVersion(version)}
              className={`p-3 rounded-lg cursor-pointer ${
                selectedVersion?._id === version._id
                  ? theme === 'dark' 
                    ? 'bg-blue-800/50' 
                    : 'bg-blue-100'
                  : theme === 'dark' 
                    ? 'hover:bg-gray-800' 
                    : 'hover:bg-gray-50'
              }`}
            >
              <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {version.name || 'Sin versión'}
              </p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {version.status} • {version.startDate ? new Date(version.startDate).toLocaleDateString() : 'Sin fecha'}
              </p>
            </div>
          ))
        ) : (
          <p className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            No se encontraron versiones
          </p>
        )}
      </div>
    </div>
  );
};

export default VersionList;
