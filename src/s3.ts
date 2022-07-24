// import { map, filter, toArray } from '@lumino/algorithm';

// import { PathExt } from '@jupyterlab/coreutils';

import { Contents, ServerConnection } from "@jupyterlab/services";

import { URLExt } from "@jupyterlab/coreutils";

export async function copyFile(
  oldPath: string,
  newPath: string
): Promise<Contents.IModel> {
  // pass
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", newPath),
      { method: "PUT", headers: { "X-Custom-S3-Copy-Src": oldPath } },
      settings
    )
  ).json();
  return response;
  // TODO: error handling
}

export async function moveFile(
  oldPath: string,
  newPath: string
): Promise<Contents.IModel> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", newPath),
      { method: "PUT", headers: { "X-Custom-S3-Move-Src": oldPath } },
      settings
    )
  ).json();
  return response;
  // TODO: error handling
}

export async function deleteFile(path: string): Promise<any> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "DELETE" },
      settings
    )
  ).json();

  return response;
}

export async function writeFile(
  path: string,
  content: string
): Promise<Contents.IModel> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "PUT", body: JSON.stringify({ content }) },
      settings
    )
  ).json();
  return response;
}

export async function createDirectory(path: string): Promise<Contents.IModel> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "PUT", headers: { "X-Custom-S3-Is-Dir": "true" } },
      settings
    )
  ).json();

  return {
    type: "directory",
    path: path.trim(),
    name: "Untitled",
    format: "json",
    content: [],
    created: "",
    writable: true,
    last_modified: "",
    mimetype: "",
  };
  // return await ls(path);
}

export async function get(
  path: string,
  isDirectory: boolean
): Promise<Contents.IModel> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "GET" },
      settings
    )
  ).json();
  return response;
}

function s3ToJupyterContents(s3Content: any): Contents.IModel {
  const result = {
    name: s3Content.name,
    path: s3Content.path,
    format: "json", // this._registry.getFileType('text').fileFormat,
    type: s3Content.type,
    created: "",
    writable: true,
    last_modified: "",
    mimetype: s3Content.mimetype,
    content: s3Content.content,
  } as Contents.IModel;
  return result;
}

export async function ls(path: string): Promise<Contents.IModel> {
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = await (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "GET", headers: { "X-Custom-S3-Is-Dir": "true" } },
      settings
    )
  ).json();
  const contents: Contents.IModel = {
    type: "directory",
    path: path.trim(),
    name: "",
    format: "json",
    content: response.map((s3Content: any) => {
      return s3ToJupyterContents(s3Content);
    }),
    created: "",
    writable: true,
    last_modified: "",
    mimetype: "",
  };
  return contents;
}

export async function read(path: string): Promise<Contents.IModel> {
  // pass
  const settings = ServerConnection.makeSettings(); // can be stored as class var
  const response = (
    await ServerConnection.makeRequest(
      URLExt.join(settings.baseUrl, "jupyterlab_s3_browser/files", path),
      { method: "GET" },
      settings
    )
  ).json();
  return response;
  // TODO: error handling
}
