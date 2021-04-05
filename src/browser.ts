import { PanelLayout, Widget } from '@lumino/widgets';

import { FileBrowser } from '@jupyterlab/filebrowser';

import { S3Drive } from './contents';

import { IDocumentManager } from '@jupyterlab/docmanager';

import { h, VirtualDOM } from '@lumino/virtualdom';

import { ServerConnection } from '@jupyterlab/services';

import { URLExt } from '@jupyterlab/coreutils';

import { showErrorMessage } from '@jupyterlab/apputils';

/**
 * Widget for authenticating against
 * an s3 object storage instance.
 */
let s3AuthenticationForm: any;

/**
 * Widget for hosting the S3 filebrowser.
 */
export class S3FileBrowser extends Widget {
  constructor(browser: FileBrowser, drive: S3Drive, manager: IDocumentManager) {
    super();
    this.addClass('jp-S3Browser');
    this.layout = new PanelLayout();

    /**
     * Function to handle setting credentials that are read
     * from the s3AuthenticationForm widget.
     */
    const s3AuthenticationFormSubmit = () => {
      const form = document.querySelector('#s3form') as HTMLFormElement;
      const formData = new FormData(form);
      const formDataJSON: any = {};
      (formData as any).forEach((value: string, key: string) => {
        formDataJSON[key] = value;
      });
      const settings = ServerConnection.makeSettings();
      ServerConnection.makeRequest(
        URLExt.join(settings.baseUrl, 'jupyterlab_s3_browser/auth'),
        {
          method: 'POST',
          body: JSON.stringify(formDataJSON)
        },
        settings
      ).then(response => {
        response.json().then(data => {
          if (data.success) {
            (this.layout as PanelLayout).removeWidget(s3AuthenticationForm);
            (this.layout as PanelLayout).addWidget(browser);
            browser.model.refresh();
          } else {
            let errorMessage = data.message;
            if (errorMessage.includes('InvalidAccessKeyId')) {
              errorMessage = 'The access key ID you entered was invalid.';
            } else if (errorMessage.includes('SignatureDoesNotMatch')) {
              errorMessage = 'The secret access key you entered was invalid';
            }
            void showErrorMessage(
              'S3 Authentication Error',
              Error(errorMessage)
            );
          }
        });
      });
    };

    /**
     * Check if the user needs to authenticate.
     * Render the browser if they don't,
     * render the auth widget if they do.
     */
    Private.checkIfAuthenicated().then(authenticated => {
      // console.log('Checking if authenticated');
      if (authenticated) {
        (this.layout as PanelLayout).addWidget(browser);
        // console.log('refreshing...');
        // not sure why this timeout is necessary
        setTimeout(() => {
          browser.model.refresh();
        }, 1000);
      } else {
        s3AuthenticationForm = new Widget({
          node: Private.createS3AuthenticationForm(s3AuthenticationFormSubmit)
        });
        (this.layout as PanelLayout).addWidget(s3AuthenticationForm);
      }
    });
  }
}

namespace Private {
  /**
   * Creates an s3AuthenticationForm widget
   * @param onSubmit A function to be called when the
   * submit button is clicked.
   */
  export function createS3AuthenticationForm(onSubmit: any): HTMLElement {
    return VirtualDOM.realize(
      h.div(
        { className: 's3form' },
        h.h4('S3 Object Storage Browser'),
        h.div(
          'This extension allows you to browse S3-compatible object storage instances, such as AWS S3 and IBM Cloud Object Storage.'
        ),
        h.br(),
        h.form(
          { id: 's3form', method: 'post' },
          h.p(
            h.label({}, 'Endpoint URL'),
            h.br(),
            h.input({ type: 'url', name: 'endpoint_url' })
          ),
          h.br(),
          h.p(
            h.label({}, 'Access Key ID'),
            h.br(),
            h.input({ type: 'text', name: 'client_id' })
          ),
          h.br(),
          h.p(
            h.label({}, 'Secret Access Key'),
            h.br(),
            h.input({ type: 'password', name: 'client_secret' })
          ),
          h.br(),
          h.p(
            h.label({}, '(Optional) Session Token'),
            h.br(),
            h.input({ type: 'password', name: 'session_token' })
          )
        ),
        h.br(),
        h.p(
          { className: 's3-connect' },
          h.button(
            {
              onclick: onSubmit,
              className: 'jp-mod-accept jp-mod-styled'
            },
            'Connect'
          )
        )
      )
    );
  }

  /**
   * Returns true if the user is already authenticated
   * against an s3 object storage instance.
   */
  export function checkIfAuthenicated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const settings = ServerConnection.makeSettings();
      ServerConnection.makeRequest(
        URLExt.join(settings.baseUrl, 'jupyterlab_s3_browser/auth'),
        {
          method: 'GET'
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
