// src/api/services/versionsService.js
import api from '../axiosInstance';

const VersionsService = {
  getVersionsByIds: async (versionIds) => {
    try {
      const response = await api.post('/versions/bulk/ids', { ids: versionIds });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  },

  getVersionsByProject: async (projectId) => {
    try {
      console.log('VersionsService: Fetching versions for project:', projectId);
      
      // Hacer la petición a la API
      const response = await api.get(`/versions`);
      console.log('VersionsService: Full response:', response);
      console.log('VersionsService: Response.data:', response.data);
      console.log('VersionsService: Response.data type:', typeof response.data);
      console.log('VersionsService: Response.data isArray:', Array.isArray(response.data));
      
      // Obtener los datos de la respuesta
      const data = response.data || response || [];
      console.log('VersionsService: Extracted data:', data);
      
      // Verificar que sea un array
      if (!Array.isArray(data)) {
        console.log('VersionsService: Data is not an array, converting or returning empty');
        return [];
      }
      
      // Filtrar por projectId
      const filteredVersions = data.filter(version => {
        if (!version) return false;
        
        console.log('VersionsService: Checking version:', version.name, 'projectId:', version.projectId);
        
        // Manejar tanto string directo como objeto con _id
        const versionProjectId = version.projectId?._id || version.projectId;
        const matches = versionProjectId === projectId;
        
        console.log('VersionsService: Version projectId:', versionProjectId, 'Target:', projectId, 'Matches:', matches);
        
        return matches;
      });
      
      console.log('VersionsService: Filtered versions:', filteredVersions);
      return filteredVersions;
      
    } catch (error) {
      console.error('Error fetching project versions:', error);
      console.error('Error details:', error.response?.data || error.message);
      return [];
    }
  },

  createVersion: async (versionData) => {
    try {
      console.log('Creating version with data:', versionData);
      const response = await api.post('/versions', versionData);

      // Log para debugging
      console.log('=== RESPONSE DEBUG ===');
      console.log('Full response:', response);
      console.log('Response has data property:', 'data' in response);
      console.log('Response.data:', response?.data);
      console.log('======================');

      // La respuesta puede venir directamente o en response.data
      // Primero intentamos response.data (comportamiento normal de axios)
      let responseData = response.data;

      // Si response.data no existe, la respuesta directa es el objeto
      if (!responseData) {
        responseData = response;
      }

      console.log('Using responseData:', responseData);

      // Verificar que tengamos una respuesta válida
      if (!responseData) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // Extraer la versión de la respuesta
      let version = null;

      if (responseData.version) {
        // Caso: { message: "...", version: {...} }
        console.log('Found version in responseData.version');
        version = responseData.version;
      } else if (responseData._id) {
        // Caso: la versión viene directamente
        console.log('Found version directly in responseData');
        version = responseData;
      } else {
        console.error('Estructura de respuesta no reconocida:', responseData);
        throw new Error('Estructura de respuesta del servidor no reconocida');
      }

      console.log('Extracted version:', version);

      // Validar ID
      if (!version || (!version._id && !version.id)) {
        console.error('Version object is invalid or has no ID:', version);
        throw new Error('La versión creada no tiene un ID válido');
      }

      return version;

    } catch (error) {
      console.error('Error creating version:', error);

      // Log detallado del error
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      throw error;
    }
  },

  updateVersion: async (versionId, versionData) => {
    try {
      console.log('Updating version:', versionId, 'with data:', versionData);
      const response = await api.put(`/versions/${versionId}`, versionData);
      console.log('Update version response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating version:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  deleteVersion: async (versionId) => {
    try {
      const response = await api.delete(`/versions/${versionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting version:', error);
      throw error;
    }
  },

  getVersion: async (versionId) => {
    try {
      const response = await api.get(`/versions/${versionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching version:', error);
      throw error;
    }
  }
};

export default VersionsService;
