// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// cypress/support/commands.js

// cypress/support/commands.js

Cypress.Commands.add('login', (email = 'raul@example.com', password = 'raul123') => {
  cy.session([email, password], () => {
    // 1. Mockear la respuesta del backend
    cy.intercept('POST', 'http://localhost:4000/api/auth/login', {
      statusCode: 200,
      body: {
        accessToken: 'mock-access-token-raul',
        refreshToken: 'mock-refresh-token-raul',
        user: {
          _id: 'raul-user-id',
          name: 'Raúl',
          email: 'raul@example.com',
          role: 'admin'
        }
      }
    }).as('loginRequest');

    // 2. Mockear la verificación del usuario
    cy.intercept('GET', 'http://localhost:4000/api/auth/verify', {
      statusCode: 200,
      body: {
        _id: 'raul-user-id',
        name: 'Raúl',
        email: 'raul@example.com',
        role: 'admin'
      }
    }).as('verifyUser');

    // 3. Realizar el login programático
    cy.request({
      method: 'POST',
      url: 'http://localhost:4000/api/auth/login',
      body: {
        email: email,
        password: password
      },
      failOnStatusCode: false // Para manejar errores manualmente
    }).then((response) => {
      if (response.status === 200) {
        window.localStorage.setItem('accessToken', response.body.accessToken);
        window.localStorage.setItem('refreshToken', response.body.refreshToken);
        window.localStorage.setItem('user', JSON.stringify(response.body.user));
      } else {
        throw new Error(`Login failed with status: ${response.status}`);
      }
    });
  });
});

Cypress.Commands.add('mockAuth', () => {
  // Mock para el usuario Raúl
  cy.intercept('GET', 'http://localhost:4000/api/auth/verify', {
    statusCode: 200,
    body: {
      _id: 'raul-user-id',
      name: 'Raúl',
      email: 'raul@example.com',
      role: 'admin'
    }
  }).as('verifyUser');
});