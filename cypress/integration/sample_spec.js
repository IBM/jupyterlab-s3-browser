describe('Works with a local minio instance and environment variable configuration', () => {
  beforeEach(() => {
    cy.openJupyterLab();
  });
  it('Can render a file from Object Storage', () => {
    cy.writeFile('./minio-data/test/test/test.md', 'hello world');
    cy.visit('/');

    cy.get('[title="Object Storage Browser"]').click();
    cy.get('.jp-DirListing-item').contains('test').dblclick();
    cy.get('.jp-DirListing-item').contains('test').dblclick();
    cy.contains('hello world').should('not.exist');
    cy.contains('test.md').dblclick();
    cy.contains('hello world');
  });
  it('Object Storage Browser Tab exists', () => {
    cy.visit('/');
    cy.get('[title="Object Storage Browser"]');
  });
});
