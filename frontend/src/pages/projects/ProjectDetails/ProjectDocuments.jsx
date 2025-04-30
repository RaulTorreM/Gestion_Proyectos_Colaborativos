// src/pages/projects/ProjectDetails/ProjectDocuments.jsx
import { useState } from 'react';

const ProjectDocuments = ({ projectId, theme }) => {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Requisitos del Proyecto.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'Carlos Pérez',
      date: '2023-05-20'
    },
    {
      id: 2,
      name: 'Diagrama de Arquitectura.docx',
      type: 'doc',
      size: '1.1 MB',
      uploadedBy: 'Ana Gómez',
      date: '2023-05-22'
    }
  ]);
  const [newDocument, setNewDocument] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const newDoc = {
        id: documents.length + 1,
        name: file.name,
        type: file.name.split('.').pop(),
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedBy: 'Tú',
        date: new Date().toISOString().split('T')[0]
      };
      setDocuments([...documents, newDoc]);
    }
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'doc':
      case 'docx': return '📝';
      case 'xls':
      case 'xlsx': return '📊';
      case 'ppt':
      case 'pptx': return '📑';
      default: return '📂';
    }
  };

  return (
    <div className={`
      rounded-xl p-4 shadow-sm
      ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
    `}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          Documentos del Proyecto
        </h3>
        <label className={`
          px-4 py-2 rounded-lg cursor-pointer
          ${theme === 'dark' ? 
            'bg-blue-600 hover:bg-blue-700 text-white' : 
            'bg-blue-500 hover:bg-blue-600 text-white'}
        `}>
          + Subir Documento
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </label>
      </div>

      <div className="space-y-3">
        {documents.map(doc => (
          <div 
            key={doc.id} 
            className={`
              p-3 rounded-lg flex items-center justify-between
              ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
            `}
          >
            <div className="flex items-center">
              <span className="text-xl mr-3">{getFileIcon(doc.type)}</span>
              <div>
                <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}>{doc.name}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  {doc.size} • Subido por {doc.uploadedBy} el {doc.date}
                </p>
              </div>
            </div>
            <button className={`
              px-3 py-1 rounded text-sm
              ${theme === 'dark' ? 
                'bg-gray-600 hover:bg-gray-500 text-blue-400' : 
                'bg-gray-200 hover:bg-gray-300 text-blue-600'}
            `}>
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDocuments;