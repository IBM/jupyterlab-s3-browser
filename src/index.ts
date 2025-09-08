import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
} from "@jupyterlab/application";

import { ISettingRegistry } from "@jupyterlab/settingregistry";

import { IDocumentManager } from "@jupyterlab/docmanager";

import { IFileBrowserFactory } from "@jupyterlab/filebrowser";

import { S3Drive } from "./contents";

import { S3FileBrowser } from "./browser";

import { logDebug } from "./debug";

/**
 * S3 filebrowser plugin state namespace.
 */
const NAMESPACE = "s3-filebrowser";

/**
 * The ID for the plugin.
 */
const PLUGIN_ID = "jupyterlab_s3_browser:drive";

/**
 * The JupyterLab plugin for the S3 Filebrowser.
 */
const fileBrowserPlugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  requires: [
    IDocumentManager,
    IFileBrowserFactory,
    ILayoutRestorer,
    ISettingRegistry,
  ],
  activate: activateFileBrowser,
  autoStart: true,
};

/**
 * Activate the file browser.
 */
function activateFileBrowser(
  app: JupyterFrontEnd,
  manager: IDocumentManager,
  factory: IFileBrowserFactory,
  restorer: ILayoutRestorer,
  settingRegistry: ISettingRegistry
): void {
  // Add the S3 backend to the contents manager.
  const drive = new S3Drive(app.docRegistry);
  manager.services.contents.addDrive(drive);

  const browser = factory.createFileBrowser(NAMESPACE, {
    driveName: drive.name,
    refreshInterval: 300000,
  });

  const s3Browser = new S3FileBrowser(browser, drive, manager);

  // For JupyterLab 3 and 4 compatibility
  s3Browser.title.iconClass = 'jp-S3-icon jp-SideBar-tabIcon';
  s3Browser.title.caption = "Object Storage Browser";

  s3Browser.id = "s3-file-browser";

  // Add the file browser widget to the application restorer.
  restorer.add(s3Browser, NAMESPACE);
  
  logDebug('Adding S3 Browser to the left sidebar...');
  
  // In JupyterLab 4, we need to make sure we're adding the widget properly
  if (app.shell.add) {
    // JupyterLab 4 syntax
    logDebug('Using JupyterLab 4 shell.add() method');
    app.shell.add(s3Browser, 'left', { rank: 501 });
  } else {
    // Fallback for compatibility
    logDebug('Using legacy addToLeftArea method');
    (app.shell as any).addToLeftArea(s3Browser, { rank: 501 });
  }

  logDebug('S3 Browser extension activated!');
  return;
}

export default fileBrowserPlugin;
