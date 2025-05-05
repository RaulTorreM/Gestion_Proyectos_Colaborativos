// src/api/services/versionsService.js
import api from '../axiosInstance';

const VersionsService = {
  getVersionsByIds: async (versionIds) => {
    try {
      return await api.post('/versions/bulk/ids', { ids: versionIds });
    } catch (error) {
      console.error('Error fetching versions:', error);
      throw error;
    }
  }
};

export default VersionsService;