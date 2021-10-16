describe('Works with a local minio instance and environment variable configuration', () => {
  beforeEach(() => {
    cy.openJupyterLab();
  });
  it('Object Storage Browser Tab exists', () => {
    cy.visit('/');
    cy.get('[title="Object Storage Browser"]').should('exist');
  });
});
