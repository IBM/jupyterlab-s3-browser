// describe('The extension is properly installed', () => {
// beforeEach(() => {
// cy.openJupyterLab();
// });
// it('Object Storage Browser Tab exists', () => {
// cy.visit('/');
// cy.get('[title="Object Storage Browser"]').should('exist');
// });
// });

describe('The s3 browser works', () => {
  beforeEach(() => {
    cy.clearS3();
    cy.openJupyterLab();
  });
  // it('Object Storage Browser Tab exists', () => {
  // cy.visit('/');
  // cy.get('[title="Object Storage Browser"]').should('exist');
  // });
  it('Can create and delete a bucket', () => {
    cy.visit('/');
    cy.get('[title="Object Storage Browser"]').click();
    cy.get(
      '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
    ).rightclick();
    cy.get('[data-command="filebrowser:create-new-directory"]').click();
    cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content');
    cy.get('.jp-DirListing-item').should('exist');
    // clear focus
    cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content').click();
    cy.get('.jp-DirListing-item').rightclick();
    cy.get('[data-command="filebrowser:delete"]').click();
    cy.get('.jp-mod-accept').click();
    cy.wait(1000);
    cy.get(
      '#s3-filebrowser > .jp-Toolbar > :nth-child(3) > .bp3-button'
    ).click(); // TODO: why is this necessary?
    cy.get('.jp-DirListing-item').should('not.exist');
  });
});
