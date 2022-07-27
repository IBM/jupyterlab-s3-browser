const CI = Cypress.env("CI") || false;

const navigateToRoot = () => {
  cy.get("#s3-filebrowser > .jp-BreadCrumbs > .jp-BreadCrumbs-home").click();
  cy.wait(500);
};

const refreshFileBrowser = () => {
  // TODO: why is this ever necessary?
  cy.get('#s3-filebrowser [title="Refresh File List"]').click({ force: true });
};
const createTestBucket = () => {
  const bucketName = "untitled";
  cy.createTestBucket(bucketName);
  refreshFileBrowser();
  return bucketName;
};

const deleteTestBucket = () => {
  navigateToRoot();
  cy.get(
    "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
  ).rightclick();
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains("untitled")
    .rightclick();
  cy.get('[data-command="filebrowser:delete"]').click();
  cy.get(".jp-mod-accept").click();
  refreshFileBrowser();
};

const navigateTo = (path) => {
  navigateToRoot();
  if (path === "/") {
    return;
  } else {
    path
      .split("/")
      .slice(1)
      .forEach((prefix) => {
        cy.wait(500);
        console.log(`going to ${prefix}`);
        cy.get(".jp-DirListing-content > .jp-DirListing-item[data-isdir=true]")
          .contains(prefix)
          .dblclick({ force: true });
      });
  }
};

const createFile = (path) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get(
    "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
  ).rightclick();
  cy.get(
    '[data-command="filebrowser:create-new-file"] > .lm-Menu-itemLabel'
  ).click();
  cy.get(".jp-DirListing-editor").type(`${file}{enter}`);
  cy.wait(500);
};

const renameFile = (path, newFileName) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:rename"] > .lm-Menu-itemLabel').click();
  cy.get(".jp-DirListing-editor").type(`${newFileName}{enter}`);
};

const createDirectory = (path) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const directory = path.split("/").slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${directory}`);
  navigateTo(prefix);
  cy.get(
    "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
  ).rightclick();
  cy.get(
    '[data-command="filebrowser:create-new-directory"] > .lm-Menu-itemLabel'
  ).click();
  cy.get(".jp-DirListing-editor").type(`${directory}{enter}`);
  cy.wait(500);
};

const deleteDirectory = (path) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const directory = path.split("/").slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${directory}`);
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(directory)
    .rightclick();
  cy.get('[data-command="filebrowser:delete"] > .lm-Menu-itemLabel').click();
  cy.get(".jp-mod-accept").click();
  refreshFileBrowser();
};

const deleteFile = (path) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  console.log(`navigating to ${prefix}, creating ${file}`);
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:delete"]').click();
  cy.get(".jp-mod-accept").click();
};

const writeToFile = (path, content) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(file)
    .dblclick();
  cy.get('[style="position: relative; top: 0px;"] > .CodeMirror-lines').type(
    `${content}{enter}`
  );
  cy.get('.jp-mod-current [data-icon="ui-components:close"]').click();
  cy.get(":nth-child(3) > .jp-Dialog-buttonLabel").click();
};

const duplicateFile = (path) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(file)
    .rightclick();
  cy.get('[data-command="filebrowser:duplicate"]').click();
};

const copyFile = (src, dest) => {
  const srcPrefix = "/" + src.split("/").slice(0, -1).join("/");
  const srcFile = src.split("/").slice(-1)[0];
  const destPrefix = "/" + dest.split("/").slice(0, -1).join("/");
  const destFile = dest.split("/").slice(-1)[0];
  console.log(`navigating to ${srcPrefix}`);
  navigateTo(srcPrefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(srcFile)
    .rightclick();
  cy.get('[data-command="filebrowser:copy"]').click();
  navigateTo(destPrefix);
  cy.get(
    "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
  ).rightclick();
  cy.get('[data-command="filebrowser:paste"]').click();
};

const moveFile = (src, dest) => {
  console.log(`moving ${src} -> ${dest}`);
  const srcPrefix = "/" + src.split("/").slice(0, -1).join("/");
  const srcFile = src.split("/").slice(-1)[0];
  const destPrefix = "/" + dest.split("/").slice(0, -1).join("/");
  const destFile = dest.split("/").slice(-1)[0];
  console.log(`navigating to ${srcPrefix}`);
  navigateTo(srcPrefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(srcFile)
    .rightclick();
  cy.get('[data-command="filebrowser:cut"]').click();
  navigateTo(destPrefix);
  cy.get(
    "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
  ).rightclick();
  cy.get('[data-command="filebrowser:paste"]').click();
};

const assertFileHasContent = (path, content) => {
  const prefix = "/" + path.split("/").slice(0, -1).join("/");
  const file = path.split("/").slice(-1)[0];
  navigateTo(prefix);
  cy.get("#s3-filebrowser > .jp-DirListing > .jp-DirListing-content")
    .contains(file)
    .dblclick();
  cy.get("#jp-top-panel").contains("File").click();
  cy.get('.lm-Menu-content > [data-command="docmanager:save"]').click();
  cy.get(":nth-child(1) > .CodeMirror-line > span").should(
    "have.text",
    content
  );
};

describe("The s3 browser works", () => {
  beforeEach(() => {
    cy.clearS3();
    cy.openJupyterLab();
  });

  it("Shows an error message when trying to create a bucket", () => {
    navigateToRoot();
    cy.get(
      "#s3-filebrowser > .jp-DirListing > .jp-DirListing-content"
    ).rightclick();
    cy.get('[data-command="filebrowser:create-new-directory"]').click();
    cy.get(".jp-Dialog-header").contains("Error").should("exist");
    cy.get(".jp-mod-accept").click();
  });

  if (!CI) {
    it("Can delete a bucket", () => {
      const bucketName = createTestBucket();
      cy.get(".jp-DirListing-content").contains(bucketName).should("exist");
      deleteTestBucket();
      cy.get(".jp-DirListing-content").contains(bucketName).should("not.exist");
    });
  }

  it("Fails to delete buckets with objects inside", () => {
    const bucketName = createTestBucket();
    const fileName = "test.txt";
    const fileLocation = `${bucketName}/${fileName}`;
    const fileContent = "test";
    createFile(fileLocation);
    deleteTestBucket();

    // error message should display
    cy.get(".jp-Dialog-header").contains("Failed").should("exist");
    cy.get(".jp-mod-accept").click();

    cy.get(".jp-DirListing-content").contains(bucketName).should("exist");
  });

  it("Can create files", () => {
    const bucketName = createTestBucket();
    const fileName = "test.txt";
    const fileLocation = `${bucketName}/${fileName}`;
    createFile(fileLocation);
    cy.get(".jp-DirListing-content").contains(fileName).should("exist");
  });

  it("Can edit files", () => {
    const bucketName = createTestBucket();
    const fileName = "test.txt";
    const fileLocation = `${bucketName}/${fileName}`;
    const fileContent = "test";
    createFile(fileLocation);
    writeToFile(fileLocation, fileContent);
    assertFileHasContent(fileLocation, fileContent);
  });

  it("Can delete files", () => {
    const bucketName = createTestBucket();
    const fileName = "test.txt";
    const fileLocation = `${bucketName}/${fileName}`;
    createFile(fileLocation);
    deleteFile(fileLocation);
    cy.get(".jp-DirListing-content").contains(fileName).should("not.exist");
  });

  it("Can duplicate files", () => {
    const bucketName = createTestBucket();
    const fileName = "test.txt";
    const copiedFileName = "test-copy.txt";
    const fileLocation = `${bucketName}/${fileName}`;
    const copiedFileLocation = `${bucketName}/${copiedFileName}`;
    const fileContent = "test";
    createFile(fileLocation);
    writeToFile(fileLocation, fileContent);
    duplicateFile(fileLocation);
    assertFileHasContent(copiedFileLocation, fileContent);
  });

  if (!CI) {
    it("Can copy files", () => {
      const bucketName = createTestBucket();
      const fileName = "test.txt";
      const copiedFileName = "test-copy.txt";
      const fileLocation = `${bucketName}/${fileName}`;
      const copyDestinationDirectory = `${bucketName}/test`;
      createDirectory(`${copyDestinationDirectory}`);
      const newFileLocation = `${copyDestinationDirectory}/${copiedFileName}`;
      const fileContent = "test";
      createFile(fileLocation);
      writeToFile(fileLocation, fileContent);
      copyFile(fileLocation, newFileLocation);
      assertFileHasContent(newFileLocation, fileContent);
    });

    it("Can move files", () => {
      const bucketName = createTestBucket();
      const fileName = "test.txt";
      const fileLocation = `${bucketName}/${fileName}`;
      const moveDestinationDirectory = `${bucketName}/test`;
      createDirectory(`${moveDestinationDirectory}`);
      const newFileLocation = `${moveDestinationDirectory}/${fileName}`;
      const fileContent = "test";
      createFile(fileLocation);
      writeToFile(fileLocation, fileContent);
      moveFile(fileLocation, newFileLocation);
      assertFileHasContent(newFileLocation, fileContent);
    });

    it("Can rename files", () => {
      const bucketName = createTestBucket();
      const fileName = "test.txt";
      const newFileName = "test2";
      const fileLocation = `${bucketName}/${fileName}`;
      createFile(fileLocation);
      renameFile(fileLocation, newFileName);
      cy.get(".jp-DirListing-content").contains(newFileName).should("exist");
    });

    it("Can create and delete prefixes/directories", () => {
      const bucketName = createTestBucket();
      const directoryName = "test";
      const directoryPath = `${bucketName}/${directoryName}`;
      createDirectory(directoryPath);
      cy.get(".jp-DirListing-content").contains(directoryName).should("exist");
      deleteDirectory(directoryPath);
      cy.get(".jp-DirListing-content")
        .contains(directoryName)
        .should("not.exist");
    });

    it("Fails to delete non-empty prefixes/directories", () => {
      const bucketName = createTestBucket();
      const directoryName = "test";
      const directoryPath = `${bucketName}/${directoryName}`;
      createDirectory(directoryPath);
      cy.get(".jp-DirListing-content").contains(directoryName).should("exist");
      createFile(`${directoryPath}/test`);
      deleteDirectory(directoryPath);
      cy.get(".jp-Dialog-header").contains("Failed").should("exist");
      cy.get(".jp-mod-accept").click();
      cy.get(".jp-DirListing-content").contains(directoryName).should("exist");
    });

    it("Fails to delete a non-empty bucket", () => {
      const bucketName = createTestBucket();
      const fileName = "test.txt";
      const filePath = `${bucketName}/${fileName}`;
      createFile(filePath);
      navigateToRoot();
      cy.get(".jp-DirListing-content").contains(bucketName).should("exist");
      deleteTestBucket();
      cy.get(".jp-DirListing-content").contains(bucketName).should("exist");
    });
  }
});
