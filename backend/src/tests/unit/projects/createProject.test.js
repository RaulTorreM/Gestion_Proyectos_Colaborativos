const User = require('../../../models/Project'); 
const mongoose = require('mongoose'); 
const { mockProjectHelpers } = require('../../setup/mocks'); 

describe('POST /api/projects', () => { 
	// 1. POST crear proyecto - forzar error de validación 
	test('should handle validation middleware error', async () => { 
		const response = await global.request 
			.post('/api/projects') 
			.set('Authorization', 'valid_token') 
			.set('X-Test-Force-Validation-Error', 'true') 
			.send({ 
				name: 'Test User', 
				description: 'test@test.com', 
				startDate: '2025-06-11T14:00:00.000Z',
				dueDate: '2025-06-30T14:00:00.000Z',
				projectType: 'Test project type',
			}); 
 
		expect(response.status).toBe(400); 
	}); 
 
	// 2. POST crear usuario - caso exitoso 
	test('should create a new project with valid token and data', async () => { 
		const newProjectData = { 
			name: 'Test User', 
			description: 'test@test.com', 
			startDate: '2025-06-11T14:00:00.000Z',
			dueDate: '2025-06-30T14:00:00.000Z',
			projectType: 'Test project type',
		}; 
 
		mockProjectHelpers.setupCreateMock(newProjectData); 
 
		const response = await global.request 
			.post('/api/users') 
			.set('Authorization', 'valid_token') 
			.send({ 
				name: 'Test User', 
				description: 'test@test.com', 
				startDate: '2025-06-11T14:00:00.000Z',
				dueDate: '2025-06-30T14:00:00.000Z',
				projectType: 'Test project type',
			}); 
 
		expect(response.status).toBe(201); 
	}); 
});