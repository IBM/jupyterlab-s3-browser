import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import { S3Drive } from './contents';

import { S3FileBrowser } from './browser';

/**
 * S3 filebrowser plugin state namespace.
 */
const NAMESPACE = 's3-filebrowser';

/**
 * The ID for the plugin.
 */
const PLUGIN_ID = 'jupyterlab_s3_browser:drive';

/**
 * The JupyterLab plugin for the S3 Filebrowser.
 */
const fileBrowserPlugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  requires: [
    IDocumentManager,
    IFileBrowserFactory,
    ILayoutRestorer,
    ISettingRegistry
  ],
  activate: activateFileBrowser,
  autoStart: true
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
    state: null,
    refreshInterval: 300000
  });

  const s3Browser = new S3FileBrowser(browser, drive, manager);

  s3Browser.title.iconClass = 'jp-S3-icon jp-SideBar-tabIcon';
  s3Browser.title.caption = 'Object Storage Browser';

  s3Browser.id = 's3-file-browser';

  // Add the file browser widget to the application restorer.
  restorer.add(s3Browser, NAMESPACE);
  app.shell.add(s3Browser, 'left', { rank: 100 });

  return;
}

export default fileBrowserPlugin;
