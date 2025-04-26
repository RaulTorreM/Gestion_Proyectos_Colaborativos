// Ejemplo de implementación para conectar con el backend
// Este servicio debe ser implementado por el desarrollador del backend

import api from '../utils/api'; // Asumiendo que tendrás un cliente API configurado

/**
 * Obtiene la lista de proyectos con opciones de filtrado
 * @param {Object} filters - Objeto con parámetros de filtrado
 * @returns {Promise<Array>} Lista de proyectos
 * 
 * Ejemplo de implementación esperada:
 * 
 * export const getProjects = async (filters = {}) => {
 *   try {
 *     const response = await api.get('/projects', { params: filters });
 *     return response.data;
 *   } catch (error) {
 *     console.error('Error fetching projects:', error);
 *     throw error;
 *   }
 * };
 */

/**
 * Obtiene los detalles de un proyecto específico
 * @param {string} projectId - ID del proyecto
 * @returns {Promise<Object>} Detalles del proyecto
 * 
 * Ejemplo de implementación esperada:
 * 
 * export const getProjectDetails = async (projectId) => {
 *   try {
 *     const response = await api.get(`/projects/${projectId}`);
 *     return response.data;
 *   } catch (error) {
 *     console.error('Error fetching project details:', error);
 *     throw error;
 *   }
 * };
 */

// Funciones adicionales que podrías necesitar (comentar para el desarrollador backend):

/**
 * Crea un nuevo proyecto
 * export const createProject = async (projectData) => {
 *   // Implementación
 * };
 * 
 * Actualiza un proyecto existente
 * export const updateProject = async (projectId, updateData) => {
 *   // Implementación
 * };
 * 
 * Elimina un proyecto
 * export const deleteProject = async (projectId) => {
 *   // Implementación
 * };
 * 
 * Obtiene las versiones de un proyecto
 * export const getProjectVersions = async (projectId) => {
 *   // Implementación
 * };
 */

// Exportamos funciones vacías para que el frontend no falle
// El desarrollador backend debe reemplazar estas implementaciones
export const getProjects = async () => {
  console.warn('getProjects no está implementado - usando datos de ejemplo');
  return [];
};

export const getProjectDetails = async () => {
  console.warn('getProjectDetails no está implementado');
  return null;
};

// IMPORTANTE: Para la implementación real, el backend debe proveer:
// 1. Endpoint GET /projects con parámetros de filtrado
// 2. Debe devolver un array de proyectos con esta estructura:
/*
  {
    _id: string,
    name: string,
    description: string,
    status: 'active'|'paused'|'inactive',
    startDate: ISOString,
    endDate: ISOString,
    completedTasks: number,
    totalTasks: number,
    createdBy: { _id: string, name: string, avatar?: string },
    members: Array<{ _id: string, name: string, avatar?: string }>,
    categories?: string[],
    epics?: Array<{ _id: string, title: string, status: string }>,
    versions?: Array<{ _id: string, name: string, status: string }>,
    createdAt: ISOString,
    updatedAt: ISOString
  }
*/