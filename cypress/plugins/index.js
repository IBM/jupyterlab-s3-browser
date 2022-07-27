/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
const fs = require("fs");
const util = require("util");
const readdir = util.promisify(fs.readdir);
const rmdir = util.promisify(fs.rmdir);

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  //
  on("task", {
    async emptyDirectory(directory) {
      try {
        const filesToIgnore = [".minio.sys"];
        const files = await readdir(directory);
        const filesToDelete = files.filter(
          (item) => !filesToIgnore.includes(item)
        );
        const rmdirPromises = filesToDelete.map((filename) => {
          rmdir(`${directory}/${filename}`, { recursive: true });
        });
        return Promise.all(rmdirPromises);
        return true;
      } catch (err) {
        console.log(err);
      }
    },
  });
};
