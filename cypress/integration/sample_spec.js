const navigateToRoot = () => {
  cy.get('#s3-filebrowser > .jp-BreadCrumbs > .jp-BreadCrumbs-home').click();
  cy.wait(500);
};

const refreshFileBrowser = () => {
  // TODO: why is this ever necessary?
  cy.get('#s3-filebrowser [title="Refresh File List"]').click();
};
const createTestBucket = () => {
  navigateToRoot();
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get('[data-command="filebrowser:create-new-directory"]').click();
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content');
  cy.get('.jp-DirListing-item').should('exist');
  cy.get('.jp-DirListing-editor').type(`{enter}`);
  return 'untitled';
};

const deleteTestBucket = () => {
  navigateToRoot();
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains('untitled')
    .rightclick();
  cy.get('[data-command="filebrowser:delete"]').click();
  cy.get('.jp-mod-accept').click();
  refreshFileBrowser();
};

const navigateTo = path => {
  // cy.get('[title="Object Storage Browser"]').click();
  navigateToRoot();
  // cy.contains(path).dblclick();
  console.log('??????');
  if (path === '/') {
    return;
  } else {
    path
      .split('/')
      .slice(1)
      .forEach(prefix => {
        cy.wait(500);
        console.log(`going to ${prefix}`);
        cy.get('.jp-DirListing-content').contains(prefix).dblclick();
      });
  }
  // cy.get('[title="Object Storage Browser"]').click();
};

const createFile = path => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get(
    '[data-command="filebrowser:create-new-file"] > .lm-Menu-itemLabel'
  ).click();
  cy.get('.jp-DirListing-editor').type(`${file}{enter}`);
};

const renameFile = (path, newFileName) => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:rename"] > .lm-Menu-itemLabel').click();
  cy.get('.jp-DirListing-editor').type(`${newFileName}{enter}`);
};

const createDirectory = path => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const directory = path.split('/').slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${directory}`);
  navigateTo(prefix);
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get(
    '[data-command="filebrowser:create-new-directory"] > .lm-Menu-itemLabel'
  ).click();
  cy.get('.jp-DirListing-editor').type(`${directory}{enter}`);
};

const deleteDirectory = path => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const directory = path.split('/').slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${directory}`);
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(directory)
    .rightclick();
  cy.get('[data-command="filebrowser:delete"] > .lm-Menu-itemLabel').click();
  cy.get('.jp-mod-accept').click();
  refreshFileBrowser();
};

const deleteFile = path => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:delete"]').click();
  cy.get('.jp-mod-accept').click();
};

const writeToFile = (path, content) => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(file)
    .dblclick();
  cy.get('[style="position: relative; top: 0px;"] > .CodeMirror-lines').type(
    `${content}{enter}`
  );
  cy.get('.jp-mod-current [data-icon="ui-components:close"]').click();
  cy.get(':nth-child(3) > .jp-Dialog-buttonLabel').click();
};

const duplicateFile = path => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:duplicate"]').click();
};

const copyFile = (src, dest) => {
  const srcPrefix = '/' + src.split('/').slice(0, -1).join('/');
  const srcFile = src.split('/').slice(-1)[0];
  const destPrefix = '/' + dest.split('/').slice(0, -1).join('/');
  const destFile = dest.split('/').slice(-1)[0];
  console.log(`navigating to ${srcPrefix}`);
  navigateTo(srcPrefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(srcFile)
    .rightclick();
  cy.get('[data-command="filebrowser:copy"]').click();
  navigateTo(destPrefix);
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get('[data-command="filebrowser:paste"]').click();
};

const moveFile = (src, dest) => {
  console.log(`moving ${src} -> ${dest}`);
  const srcPrefix = '/' + src.split('/').slice(0, -1).join('/');
  const srcFile = src.split('/').slice(-1)[0];
  const destPrefix = '/' + dest.split('/').slice(0, -1).join('/');
  const destFile = dest.split('/').slice(-1)[0];
  console.log(`navigating to ${srcPrefix}`);
  navigateTo(srcPrefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(srcFile)
    .rightclick();
  cy.get('[data-command="filebrowser:cut"]').click();
  navigateTo(destPrefix);
  cy.get(
    '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
  ).rightclick();
  cy.get('[data-command="filebrowser:paste"]').click();
};

const assertFileHasContent = (path, content) => {
  const prefix = '/' + path.split('/').slice(0, -1).join('/');
  const file = path.split('/').slice(-1)[0];
  navigateTo(prefix);
  cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content')
    .contains(file)
    .dblclick();
  cy.get('#jp-top-panel').contains('File').click();
  cy.get('.lm-Menu-content > [data-command="docmanager:save"]').click();
  cy.get(':nth-child(1) > .CodeMirror-line > span').should(
    'have.text',
    content
  );
};

describe('The s3 browser works', () => {
  beforeEach(() => {
    cy.clearS3();
    cy.openJupyterLab();
  });

  // it('Can create and delete a bucket', () => {
  // const bucketName = createTestBucket();
  // deleteTestBucket();
  // cy.get('.jp-DirListing-item').contains(bucketName).should('exist');
  // });

  // it('Fails to delete buckets with objects inside', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // const fileContent = 'test';
  // createFile(fileLocation);
  // deleteTestBucket();
  // cy.get('.jp-DirListing-item').contains(bucketName).should('exist');
  // });

  // it('Can create files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // createFile(fileLocation);
  // cy.get('.jp-DirListing-item').contains(fileName).should('exist');
  // });

  // it('Can edit files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // const fileContent = 'test';
  // createFile(fileLocation);
  // writeToFile(fileLocation, fileContent);
  // assertFileHasContent(fileLocation, fileContent);
  // });

  // it('Can delete files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // createFile(fileLocation);
  // deleteFile(fileLocation);
  // cy.get('.jp-DirListing-item').contains(fileName).should('not.exist');
  // });

  // it('Can duplicate files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const copiedFileName = 'test-copy.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // const copiedFileLocation = `${bucketName}/${copiedFileName}`;
  // const fileContent = 'test';
  // createFile(fileLocation);
  // writeToFile(fileLocation, fileContent);
  // duplicateFile(fileLocation);
  // assertFileHasContent(copiedFileLocation, fileContent);
  // });

  // it('Can copy files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const copiedFileName = 'test-copy.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // const copyDestinationDirectory = `${bucketName}/test`;
  // createDirectory(`${copyDestinationDirectory}`);
  // const newFileLocation = `${copyDestinationDirectory}/${copiedFileName}`;
  // const fileContent = 'test';
  // createFile(fileLocation);
  // writeToFile(fileLocation, fileContent);
  // copyFile(fileLocation, newFileLocation);
  // assertFileHasContent(newFileLocation, fileContent);
  // });

  // it('Can move files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const fileLocation = `${bucketName}/${fileName}`;
  // const moveDestinationDirectory = `${bucketName}/test`;
  // createDirectory(`${moveDestinationDirectory}`);
  // const newFileLocation = `${moveDestinationDirectory}/${fileName}`;
  // const fileContent = 'test';
  // createFile(fileLocation);
  // writeToFile(fileLocation, fileContent);
  // moveFile(fileLocation, newFileLocation);
  // assertFileHasContent(newFileLocation, fileContent);
  // });

  // it('Can rename files', () => {
  // const bucketName = createTestBucket();
  // const fileName = 'test.txt';
  // const newFileName = 'test2';
  // const fileLocation = `${bucketName}/${fileName}`;
  // createFile(fileLocation);
  // renameFile(fileLocation, newFileName);
  // cy.get('.jp-DirListing-item').contains(newFileName).should('exist');
  // });

  // it('Can create and delete prefixes/directories', () => {
  // const bucketName = createTestBucket();
  // const directoryName = 'test';
  // const directoryPath = `${bucketName}/${directoryName}`;
  // createDirectory(directoryPath);
  // cy.get('.jp-DirListing-item').contains(directoryName).should('exist');
  // deleteDirectory(directoryPath);
  // cy.get('.jp-DirListing-item').contains(directoryName).should('not.exist');
  // });

  // it('Fails to delete non-empty prefixes/directories', () => {
  // const bucketName = createTestBucket();
  // const directoryName = 'test';
  // const directoryPath = `${bucketName}/${directoryName}`;
  // createDirectory(directoryPath);
  // cy.get('.jp-DirListing-item').contains(directoryName).should('exist');
  // createFile(`${directoryPath}/test`);
  // deleteDirectory(directoryPath);
  // cy.get('.jp-DirListing-item').contains(directoryName).should('exist');
  // });

  it('Fails to delete a non-empty bucket', () => {
    const bucketName = createTestBucket();
    const fileName = 'test.txt';
    const filePath = `${bucketName}/${fileName}`;
    createFile(filePath);
    navigateToRoot();
    cy.get('.jp-DirListing-item').contains(bucketName).should('exist');
    deleteTestBucket();
    cy.get('.jp-DirListing-item').contains(bucketName).should('exist');
    // cy.get(
    // '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
    // ).rightclick();
    // cy.get('[data-command="filebrowser:create-new-directory"]').click();
    // cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content');
    // cy.get('.jp-DirListing-item').should('exist');
    // cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content').click(); // clear focus
    // const bucketName = createTestBucket();
    // deleteTestBucket();
    // navigateTo(`/${bucketName}`);
    // createFile(`/${bucketName}/test.txt`);
    // cy.get('.jp-DirListing-item').dblclick();
    // cy.get(
    // '#s3-filebrowser > .jp-DirListing > .jp-DirListing-content'
    // ).rightclick();
    // cy.get(
    // '[data-command="filebrowser:create-new-file"] > .lm-Menu-itemLabel'
    // ).click();
    // cy.get('.jp-DirListing-editor').type('{enter}');
    // cy.get('#s3-filebrowser > .jp-DirListing > .jp-DirListing-content').click(); // clear focus
    // cy.get('.jp-DirListing-itemText').type('{enter}');
    // cy.get('.jp-DirListing-itemText').dblclick();
    // cy.get('.jp-DirListing-item').rightclick();
    // cy.get('[data-command="filebrowser:delete"]').click();
    // cy.get('.jp-mod-accept').click();
    //
    //
    //
    // need to be able to run notebooks
  });
});
