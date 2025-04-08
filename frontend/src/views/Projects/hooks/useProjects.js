import { useState, useEffect } from 'react';

/**
 * Custom Hook para manejar la lógica de obtención de proyectos
 * 
 * Conexión Backend:
 * - Reemplazar la mock data con una llamada real a tu API
 * - Ejemplo con fetch:
 * 
 * useEffect(() => {
 *   const fetchProjects = async () => {
 *     try {
 *       const response = await fetch('/api/projects');
 *       const data = await response.json();
 *       setProjects(data);
 *     } catch (err) {
 *       setError(err);
 *     } finally {
 *       setIsLoading(false);
 *     }
 *   };
 *   fetchProjects();
 * }, []);
 */
const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Mock data - Eliminar cuando se conecte al backend
    const mockProjects = [
      {
        id: 1,
        name: 'Sistema de Gestión',
        description: 'Desarrollo de un sistema integral para gestión de clientes y ventas.',
        startDate: '2023-01-15',
        endDate: '2023-06-30',
        progress: 65,
        members: [
          { name: 'Ana López', avatar: '' },
          { name: 'Carlos Ruiz', avatar: '' }
        ]
      },
    
    ];

    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 1000);
  }, []);

  return { projects, loading, error };
};

export default useProjects;