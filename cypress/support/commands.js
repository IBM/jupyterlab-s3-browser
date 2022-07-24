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

Cypress.Commands.add("openJupyterLab", () => {
  // open jupyterlab with a clean workspace
  cy.visit("?reset");
  cy.visit("/");
  // make sure s3 browser is open
  cy.get('[data-id="filebrowser"]').click();
  cy.get('[data-id="s3-file-browser"]').click();
});

Cypress.Commands.add("clearS3", () => {
  const s3Folder = Cypress.env("S3_FOLDER") || "minio-data";
  cy.task("emptyDirectory", s3Folder);
});

Cypress.Commands.add("createTestBucket", (name) => {
  const s3Folder = Cypress.env("S3_FOLDER") || "minio-data";
  cy.writeFile(`${s3Folder}/${name}/.keep`, []);
});
