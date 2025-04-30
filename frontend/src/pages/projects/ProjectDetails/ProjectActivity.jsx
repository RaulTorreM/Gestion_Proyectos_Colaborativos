// src/pages/projects/ProjectDetails/ProjectActivity.jsx
import { useState } from 'react';

const ProjectActivity = ({ projectId, theme }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Carlos Pérez',
      avatar: 'CP',
      date: '2023-06-15 14:30',
      text: 'Hemos completado el módulo de autenticación. Falta revisar los tests.',
      isCurrentUser: false
    },
    {
      id: 2,
      author: 'Tú',
      avatar: 'YO',
      date: '2023-06-15 15:45',
      text: 'He revisado los tests y todo parece estar en orden. Buen trabajo equipo!',
      isCurrentUser: true
    }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim() === '') return;
    
    const comment = {
      id: comments.length + 1,
      author: 'Tú',
      avatar: 'YO',
      date: new Date().toISOString(),
      text: newComment,
      isCurrentUser: true
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className={`
      rounded-xl p-4 shadow-sm mt-6
      ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}
    `}>
      <h3 className={`font-medium mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
        Actividad Reciente
      </h3>

      <div className="space-y-4 mb-4">
        {comments.map(comment => (
          <div 
            key={comment.id} 
            className={`p-3 rounded-lg ${comment.isCurrentUser ? 
              theme === 'dark' ? 
                'bg-blue-900 bg-opacity-30' : 
                'bg-blue-100' : 
              theme === 'dark' ? 
                'bg-gray-700' : 
                'bg-gray-50'
            }`}
          >
            <div className="flex items-start">
              <div className={`w-8 h-8 rounded-full mr-3 flex-shrink-0 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
              }`}>
                <span className="text-xs">{comment.avatar}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-800'}`}>
                    {comment.author}
                  </p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    {comment.date}
                  </p>
                </div>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {comment.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Añadir un comentario..."
          className={`
            flex-1 p-2 rounded-l-lg border focus:outline-none
            ${theme === 'dark' ? 
              'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 
              'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}
          `}
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <button
          onClick={handleAddComment}
          className={`
            px-4 py-2 rounded-r-lg
            ${theme === 'dark' ? 
              'bg-blue-600 hover:bg-blue-700 text-white' : 
              'bg-blue-500 hover:bg-blue-600 text-white'}
          `}
        >
          Enviar
        </button>
      </div>
    </div>
  );
};

export default ProjectActivity;