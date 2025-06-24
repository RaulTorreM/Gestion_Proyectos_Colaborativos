describe('Projects Page Happy Path', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/projects');
    cy.wait(1000);
  });

  it('should display the initial projects correctly', () => {
    cy.get('[data-cy="project-card"]').should('have.length', 2);
    cy.wait(500);

    cy.contains('Sistema de Gestión').should('exist');
    cy.wait(300);

    cy.contains('Portal Clientes').should('exist');
    cy.wait(300);

    cy.contains('Encargado: Josué García').should('exist');
    cy.wait(300);

    cy.contains('Encargado: Raúl Torre').should('exist');
    cy.wait(300);
  });

  it('should filter projects by name', () => {
    cy.get('input[placeholder="Buscar proyectos..."]').type('Sistema');
    cy.wait(500);

    cy.get('[data-cy="project-card"]').should('have.length', 1);
    cy.wait(300);

    cy.contains('Sistema de Gestión').should('exist');
    cy.contains('Portal Clientes').should('not.exist');
    cy.wait(500);

    cy.get('input[placeholder="Buscar proyectos..."]').clear();
    cy.wait(500);

    cy.get('[data-cy="project-card"]').should('have.length', 2);
  });

  it('should filter projects by description', () => {
    cy.get('input[placeholder="Buscar proyectos..."]').type('portal');
    cy.wait(500);

    cy.get('[data-cy="project-card"]').should('have.length', 1);
    cy.wait(300);

    cy.contains('Portal Clientes').should('exist');
    cy.contains('Sistema de Gestión').should('not.exist');
  });

  it('should open and close the new project form', () => {
    cy.contains('Crear Nuevo Proyecto').should('not.exist');
    cy.wait(300);

    cy.contains('+ Nuevo Proyecto').click();
    cy.wait(500);

    cy.contains('Crear Nuevo Proyecto').should('exist');
    cy.wait(500);

    cy.contains('Cancelar').click();
    cy.wait(500);

    cy.contains('Crear Nuevo Proyecto').should('not.exist');
  });

  it('should create a new project successfully', () => {
    cy.contains('+ Nuevo Proyecto').click();
    cy.wait(500);

    cy.get('input[name="projectType"]').type('Desarrollo de Software');
    cy.wait(300);

    cy.get('input[name="name"]').type('Nuevo Proyecto de Prueba');
    cy.wait(300);

    cy.get('textarea[name="description"]').type('Esta es una descripción de prueba para el nuevo proyecto');
    cy.wait(500);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    cy.get('input[name="startDate"]').type(startDate.toISOString().split('T')[0]);
    cy.wait(300);

    cy.get('input[name="dueDate"]').type(endDate.toISOString().split('T')[0]);
    cy.wait(300);

    cy.get('select[name="manager"]').select('David Contreras');
    cy.wait(300);

    cy.contains('label', 'Josué García').find('input[type="checkbox"]').check();
    cy.wait(200);
    cy.contains('label', 'Raúl Torre').find('input[type="checkbox"]').check();
    cy.wait(200);

    cy.contains('Crear Proyecto').click();
    cy.wait(1000);

    cy.get('[data-cy="project-card"]').should('have.length', 3);
    cy.contains('Nuevo Proyecto de Prueba').should('exist');
    cy.contains('Encargado: David Contreras').should('exist');
  });
});
