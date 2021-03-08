import { Signal, ISignal } from '@lumino/signaling';

import { URLExt } from '@jupyterlab/coreutils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import { Contents, ServerConnection } from '@jupyterlab/services';

import * as base64js from 'base64-js';

/**
 * A Contents.IDrive implementation for s3-api-compatible object storage.
 */
export class S3Drive implements Contents.IDrive {
  /**
   * Construct a new drive object.
   *
   * @param options - The options used to initialize the object.
   */
  constructor(registry: DocumentRegistry) {
    // this._serverSettings = ServerConnection.makeSettings();
    this._registry = registry;
  }

  public _registry: DocumentRegistry;

  /**
   * The name of the drive.
   */
  get name(): 'S3' {
    return 'S3';
  }

  /**
   * Settings for the notebook server.
   */
  readonly serverSettings: ServerConnection.ISettings;

  /**
   * A signal emitted when a file operation takes place.
   */
  get fileChanged(): ISignal<this, Contents.IChangedArgs> {
    return this._fileChanged;
  }

  /**
   * Test whether the manager has been disposed.
   */
  get isDisposed(): boolean {
    return this._isDisposed;
  }

  /**
   * Dispose of the resources held by the manager.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._isDisposed = true;
    Signal.clearData(this);
  }

  /**
   * Get a file or directory.
   *
   * @param path: The path to the file.
   *
   * @param options: The options used to fetch the file.
   *
   * @returns A promise which resolves with the file content.
   */
  get(
    path: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    return this.pathToJupyterContents(path);
  }

  /**
   * Get an encoded download url given a file path.
   *
   * @param path - An absolute POSIX file path on the server.
   *
   * #### Notes
   * It is expected that the path contains no relative paths,
   * use [[ContentsManager.getAbsolutePath]] to get an absolute
   * path if necessary.
   */
  getDownloadUrl(path: string): Promise<string> {
    console.log('not yet implemented');
    return Promise.reject('Not yet implemented');
  }

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   */
  newUntitled(options: Contents.ICreateOptions = {}): Promise<Contents.IModel> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * Delete a file.
   *
   * @param path - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   */
  delete(path: string): Promise<void> {
    // if this is a file
    return Promise.reject('Not yet implemented');
  }

  /**
   * Rename a file or directory.
   *
   * @param path - The original file path.
   *
   * @param newPath - The new file path.
   *
   * @returns A promise which resolves with the new file contents model when
   *   the file is renamed.
   */
  rename(path: string, newPath: string): Promise<Contents.IModel> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * Save a file.
   *
   * @param path - The desired file path.
   *
   * @param options - Optional overrides to the model.
   *
   * @returns A promise which resolves with the file content model when the
   *   file is saved.
   */
  save(
    path: string,
    options: Partial<Contents.IModel>
  ): Promise<Contents.IModel> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * Copy a file into a given directory.
   *
   * @param path - The original file path.
   *
   * @param toDir - The destination directory path.
   *
   * @returns A promise which resolves with the new contents model when the
   *  file is copied.
   */
  copy(fromFile: string, toDir: string): Promise<Contents.IModel> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * Create a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   */
  createCheckpoint(path: string): Promise<Contents.ICheckpointModel> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * List available checkpoints for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   */
  listCheckpoints(path: string): Promise<Contents.ICheckpointModel[]> {
    return Promise.resolve([]);
  }

  /**
   * Restore a file to a known checkpoint state.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to restore.
   *
   * @returns A promise which resolves when the checkpoint is restored.
   */
  restoreCheckpoint(path: string, checkpointID: string): Promise<void> {
    return Promise.reject('Not yet implemented');
  }

  /**
   * Delete a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @param checkpointID - The id of the checkpoint to delete.
   *
   * @returns A promise which resolves when the checkpoint is deleted.
   */
  deleteCheckpoint(path: string, checkpointID: string): Promise<void> {
    return Promise.reject('Read only');
  }

  private _isDisposed = false;
  private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);

  jupyterPathToS3Path(path: string, isDir: boolean): string {
    if (path === '') {
      path = '/';
    } else if (isDir) {
      path += '/';
    }
    return path;
  }

  s3ToJupyterContents(s3Content: any): Contents.IModel {
    const result = {
      name: s3Content.name,
      path: s3Content.path,
      format: 'json', // this._registry.getFileType('text').fileFormat,
      type: s3Content.type,
      created: '',
      writable: false,
      last_modified: '',
      mimetype: s3Content.mimetype,
      content: s3Content.content
    } as Contents.IModel;
    return result;
  }

  pathToJupyterContents(path: string): Promise<Contents.IModel> {
    if (
      path !== Private.currentPath && // if we're changing paths...
      Private.availableContentTypes[path] !== 'file' // it's not a file
    ) {
      if (Private.showingError) {
        Private.hideErrorMessage();
      }
      Private.showDirectoryLoadingSpinner();
    }
    let s3path: string;
    if (Private.availableContentTypes[path] !== 'file') {
      Private.currentPath = path;
      s3path = this.jupyterPathToS3Path(path, true);
    } else {
      s3path = this.jupyterPathToS3Path(path, false);
    }

    return new Promise((resolve, reject) => {
      const settings = ServerConnection.makeSettings(); // can be stored as class var
      // s3path = s3path.substring(1, s3path.length)

      ServerConnection.makeRequest(
        URLExt.join(settings.baseUrl, 'jupyterlab_s3_browser/files', s3path),
        {},
        settings
      ).then(response => {
        response
          .json()
          .then((content: any) => {
            if (content.error) {
              const errorMessage = `Server returned status code ${content.error}. Error message: ${content.message}.`;
              console.error(errorMessage);
              Private.showErrorMessage(errorMessage);
              reject(errorMessage);
              return [];
            }
            if (Array.isArray(content)) {
              // why is everything's name ''?
              Private.hideDirectoryLoadingSpinner();
              // why was this line here?
              // Private.availableContentTypes = {};
              content.forEach(i => {
                Private.availableContentTypes[i.path] = i.type;
              });
              resolve({
                type: 'directory',
                path: path.trim(),
                name: '',
                format: 'json',
                content: content.map(c => {
                  return this.s3ToJupyterContents(c);
                }),
                created: '',
                writable: false,
                last_modified: '',
                mimetype: ''
              });
            } else {
              const types = this._registry.getFileTypesForPath(path);
              const fileType =
                types.length === 0
                  ? this._registry.getFileType('text')!
                  : types[0];
              const mimetype = fileType.mimeTypes[0];
              const format = fileType.fileFormat;
              let parsedContent;
              switch (format) {
                case 'text':
                  parsedContent = Private.b64DecodeUTF8(content.content);
                  break;
                case 'base64':
                  parsedContent = content.content;
                  break;
                case 'json':
                  parsedContent = JSON.parse(
                    Private.b64DecodeUTF8(content.content)
                  );
                  break;
                default:
                  throw new Error(
                    `Unexpected file format: ${fileType.fileFormat}`
                  );
              }
              resolve({
                type: 'file',
                path,
                name: '',
                format,
                content: parsedContent,
                created: '',
                writable: false,
                last_modified: '',
                mimetype
              });
            }
          })
          .then((content: any) => {
            if (Private.currentPath === '') {
              document.querySelector('#s3-filebrowser')!.classList.add('root');
            } else {
              document
                .querySelector('#s3-filebrowser')!
                .classList.remove('root');
            }
            return content;
          });
      });
    });
  }
}

/**
 * Private namespace for utility functions.
 */
namespace Private {
  /**
   * Decoder from bytes to UTF-8.
   */
  const decoder = new TextDecoder('utf8');

  /**
   * Decode a base-64 encoded string into unicode.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
   */
  export function b64DecodeUTF8(str: string): string {
    const bytes = base64js.toByteArray(str.replace(/\n/g, ''));
    return decoder.decode(bytes);
  }

  export const availableContentTypes: any = {};
  export let currentPath: string;
  export let showingError = false;

  export function showErrorMessage(message: string): void {
    Private.hideDirectoryLoadingSpinner();
    const filebrowserListing = document.querySelector(
      '#s3-filebrowser > .jp-DirListing'
    ) as HTMLElement;
    if (!filebrowserListing) {
      return;
    }
    filebrowserListing.insertAdjacentHTML(
      'afterend',
      `<div class="s3-error"><p>${message}</p></div>`
    );
    filebrowserListing.style.display = 'none';
    Private.showingError = true;
  }

  export function hideErrorMessage(): void {
    const filebrowserListing = document.querySelector(
      '#s3-filebrowser > .jp-DirListing'
    ) as HTMLElement;
    filebrowserListing.style.display = 'block';
    if (document.querySelector('.s3-error')) {
      document.querySelector('.s3-error')!.remove();
    }
    Private.showingError = false;
  }

  export function showDirectoryLoadingSpinner(): void {
    if (document.querySelector('#s3-spinner')) {
      return;
    }
    (document.querySelector('#s3-filebrowser') as HTMLElement).classList.add(
      'loading'
    );

    const browserContent = document.querySelector(
      '#s3-filebrowser .jp-DirListing-content'
    );
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('jp-SpinnerContent');
    loadingSpinner.id = 's3-spinner';
    (browserContent as HTMLElement).appendChild(loadingSpinner);
  }

  export function hideDirectoryLoadingSpinner(): void {
    const loadingSpinner = document.querySelector('#s3-spinner');
    (document.querySelector('#s3-filebrowser') as HTMLElement).classList.remove(
      'loading'
    );
    if (loadingSpinner) {
      try {
        (loadingSpinner as HTMLElement).remove();
      } catch (err) {
        console.error(err);
      }
    }
  }
}
