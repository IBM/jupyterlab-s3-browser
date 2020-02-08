import { PanelLayout, Widget } from "@phosphor/widgets";
import { FileBrowser } from "@jupyterlab/filebrowser";
import { S3Drive } from "./contents";
import { IDocumentManager } from "@jupyterlab/docmanager";
//import { h, VirtualDOM } from "@phosphor/virtualdom";
import { ServerConnection } from "@jupyterlab/services";
import { URLExt } from "@jupyterlab/coreutils";
//import { showErrorMessage } from "@jupyterlab/apputils";

/**
 * Widget for authenticating against
 * an s3 object storage instance.
 */

// let s3AuthenticationForm: any;

/**
 * Widget for hosting the S3 filebrowser.
 */
export class S3FileBrowser extends Widget {
  constructor(browser: FileBrowser, drive: S3Drive, manager: IDocumentManager) {
    super();
    this.addClass("jp-S3Browser");
    this.layout = new PanelLayout();

    /**
     * Function to handle setting credentials that are read
     * from the s3AuthenticationForm widget.
     */
/*      
    const s3AuthenticationFormSubmit = () => {
      const settings = ServerConnection.makeSettings();
      ServerConnection.makeRequest(
        URLExt.join(settings.baseUrl, "s3/auth"),
        {
          method: "POST"
        },
        settings
      ).then(response => {
        response.json().then(data => {
          if (data.success) {
            //(this.layout as PanelLayout).removeWidget(s3AuthenticationForm);
            (this.layout as PanelLayout).addWidget(browser);
            browser.model.refresh();
          } else {
            let errorMessage = data.message;     
            void showErrorMessage(
              "S3 Authentication Error",
              Error(errorMessage)
            );
          }
        });
      });
    };
*/
    /**
     * Check if the user needs to authenticate.
     * Render the browser if they don't,
     * render the auth widget if they do.
     */
    Private.checkIfAuthenicated().then(authenticated => {
      if (authenticated) {
        (this.layout as PanelLayout).addWidget(browser);
        browser.model.refresh();
      } 
    });
  }
}

namespace Private {
  export function checkIfAuthenicated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = ServerConnection.makeSettings();
      ServerConnection.makeRequest(
        URLExt.join(settings.baseUrl, "s3/auth"),
        {
          method: "GET"
        },
        settings
      ).then(response => {
        response.json().then(res => {
          resolve(res.authenticated);
        });
      });
    });
  }
}
