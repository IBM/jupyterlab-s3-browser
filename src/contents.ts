import { Signal, ISignal } from "@lumino/signaling";

import { PathExt } from "@jupyterlab/coreutils";

import { DocumentRegistry } from "@jupyterlab/docregistry";

import { Contents, ServerConnection } from "@jupyterlab/services";

import * as base64js from "base64-js";

import * as s3 from "./s3";

import { Dialog, showDialog } from "@jupyterlab/apputils";

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
  get name(): "S3" {
    return "S3";
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
  async get(
    path: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    if (options.type === "file" || options.type === "notebook") {
      const s3Contents = await s3.read(path);
      const types = this._registry.getFileTypesForPath(path);
      const fileType =
        types.length === 0 ? this._registry.getFileType("text")! : types[0];
      const mimetype = fileType.mimeTypes[0];
      const format = fileType.fileFormat;
      let parsedContent;
      switch (format) {
        case "text":
          parsedContent = Private.b64DecodeUTF8(s3Contents.content);
          break;
        case "base64":
          parsedContent = s3Contents.content;
          break;
        case "json":
          parsedContent = JSON.parse(Private.b64DecodeUTF8(s3Contents.content));
          break;
        default:
          throw new Error(`Unexpected file format: ${fileType.fileFormat}`);
      }

      const contents: Contents.IModel = {
        type: "file",
        path,
        name: "",
        format,
        content: parsedContent,
        created: "",
        writable: true,
        last_modified: "",
        mimetype,
      };

      return contents;
    } else {
      return await s3.ls(path);
    }
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
  async getDownloadUrl(path: string): Promise<string> {
    await showDialog({
      title: "Sorry",
      body: "This feature is not yet implemented.",
      buttons: [Dialog.cancelButton({ label: "Cancel" })],
    });
    throw Error("Not yet implemented");
  }

  /**
   * Create a new untitled file or directory in the specified directory path.
   *
   * @param options: The options used to create the file.
   *
   * @returns A promise which resolves with the created file content when the
   *    file is created.
   */
  async newUntitled(
    options: Contents.ICreateOptions = {}
  ): Promise<Contents.IModel> {
    let s3contents;
    const basename = "untitled";
    let filename = basename;
    const existingFiles = await s3.ls(options.path);
    const existingFilenames = existingFiles.content.map(
      (content: Contents.IModel) => content.name
    );
    let uniqueSuffix = 0;
    while (existingFilenames.includes(filename)) {
      uniqueSuffix++;
      filename = basename + uniqueSuffix;
    }
    switch (options.type) {
      case "file":
        s3contents = await s3.writeFile(options.path + "/" + filename, "");
        break;
      case "directory":
        if (options.path === "") {
          throw new Error("Bucket creation is not currently supported.");
        }
        s3contents = await s3.createDirectory(options.path + "/" + filename);
        break;
      default:
        throw new Error(`Unexpected type: ${options.type}`);
    }
    const types = this._registry.getFileTypesForPath(s3contents.path);
    const fileType =
      types.length === 0 ? this._registry.getFileType("text")! : types[0];
    const mimetype = fileType.mimeTypes[0];
    const format = fileType.fileFormat;
    const contents: Contents.IModel = {
      type: options.type,
      path: options.path,
      name: filename,
      format,
      content: "",
      created: "",
      writable: true,
      last_modified: "",
      mimetype,
    };

    this._fileChanged.emit({
      type: "new",
      oldValue: null,
      newValue: contents,
    });
    return contents;
  }

  /**
   * Delete a file.
   *
   * @param path - The path to the file.
   *
   * @returns A promise which resolves when the file is deleted.
   */
  async delete(path: string): Promise<void> {
    const deletionRequest = await s3.deleteFile(path);
    if (deletionRequest.error && deletionRequest.error === "DIR_NOT_EMPTY") {
      throw new Error(
        `${path} is not empty. Deletion of non-empty directories is not currently supported.`
      );
    }
    this._fileChanged.emit({
      type: "delete",
      oldValue: { path },
      newValue: null,
    });
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
  async rename(path: string, newPath: string): Promise<Contents.IModel> {
    if (!path.includes("/")) {
      throw Error("Renaming of buckets is not currently supported.");
    }
    const content = await s3.moveFile(path, newPath);
    this._fileChanged.emit({
      type: "rename",
      oldValue: { path },
      newValue: content,
    });
    return content;
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
  async save(
    path: string,
    options: Partial<Contents.IModel>
  ): Promise<Contents.IModel> {
    let content = options.content;
    if (options.format === "base64") {
      content = Private.b64DecodeUTF8(options.content);
    } else if (options.format === "json") {
      content = JSON.stringify(options.content);
    }
    const s3contents = await s3.writeFile(path, content);
    const types = this._registry.getFileTypesForPath(s3contents.path);
    const fileType =
      types.length === 0 ? this._registry.getFileType("text")! : types[0];
    const mimetype = fileType.mimeTypes[0];
    const format = fileType.fileFormat;
    const contents: Contents.IModel = {
      type: options.type,
      path: options.path,
      name: options.name,
      format,
      content,
      created: "",
      writable: true,
      last_modified: "",
      mimetype,
    };

    this._fileChanged.emit({
      type: "save",
      oldValue: null,
      newValue: contents,
    });
    return contents;
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
  async copy(fromFile: string, toDir: string): Promise<Contents.IModel> {
    let basename = PathExt.basename(fromFile).split(".")[0];
    basename += "-copy";
    const ext = PathExt.extname(fromFile);
    const name = "/" + toDir + "/" + basename + ext;
    const content = await s3.copyFile(fromFile, name);
    this._fileChanged.emit({
      type: "new",
      oldValue: null,
      newValue: content,
    });
    return content;
  }

  /**
   * Create a checkpoint for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with the new checkpoint model when the
   *   checkpoint is created.
   */
  async createCheckpoint(path: string): Promise<Contents.ICheckpointModel> {
    return;
  }

  /**
   * List available checkpoints for a file.
   *
   * @param path - The path of the file.
   *
   * @returns A promise which resolves with a list of checkpoint models for
   *    the file.
   */
  async listCheckpoints(path: string): Promise<Contents.ICheckpointModel[]> {
    return [];
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
  async restoreCheckpoint(path: string, checkpointID: string): Promise<void> {
    throw Error("Not yet implemented");
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
  async deleteCheckpoint(path: string, checkpointID: string): Promise<void> {
    return void 0;
  }

  private _isDisposed = false;
  private _fileChanged = new Signal<this, Contents.IChangedArgs>(this);
  // private _fileTypeForPath: (path: string) => DocumentRegistry.IFileType;
}

/**
 * Private namespace for utility functions.
 */
namespace Private {
  /**
   * Decoder from bytes to UTF-8.
   */
  const decoder = new TextDecoder("utf8");

  /**
   * Decode a base-64 encoded string into unicode.
   *
   * See https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#Solution_2_%E2%80%93_rewrite_the_DOMs_atob()_and_btoa()_using_JavaScript's_TypedArrays_and_UTF-8
   */
  export function b64DecodeUTF8(str: string): string {
    const bytes = base64js.toByteArray(str.replace(/\n/g, ""));
    return decoder.decode(bytes);
  }
}
