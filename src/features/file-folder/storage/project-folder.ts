import type {
  FileSystemDirectoryHandleLike,
  FileSystemFileHandleLike,
  PersistedFileFolderAsset,
} from "../types";
import {
  ASSETS_STORE,
  PROJECT_FOLDER_KEY,
  PROJECT_FOLDER_STORE,
} from "./constants";
import { getDb } from "./db";
import { fileHandleToAsset, materializeAssets } from "./file-assets";
import { ensureHandlePermission } from "./permissions";

function getDirectoryPicker() {
  return (
    window as typeof window & {
      showDirectoryPicker?: () => Promise<FileSystemDirectoryHandleLike>;
    }
  ).showDirectoryPicker;
}

async function* scanDirectoryForFiles(
  directoryHandle: FileSystemDirectoryHandleLike,
): AsyncGenerator<FileSystemFileHandleLike> {
  if (!directoryHandle.entries) {
    return;
  }

  for await (const [, handle] of directoryHandle.entries()) {
    if (handle.kind === "file") {
      yield handle;
      continue;
    }

    yield* scanDirectoryForFiles(handle);
  }
}

export function canOpenProjectFolder() {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

async function scanProjectFolder(directoryHandle: FileSystemDirectoryHandleLike) {
  const assets: PersistedFileFolderAsset[] = [];

  for await (const fileHandle of scanDirectoryForFiles(directoryHandle)) {
    const asset = await fileHandleToAsset(fileHandle, "project-folder");
    if (asset) {
      assets.push(asset);
    }
  }

  return assets;
}

async function replacePersistedProjectFolderAssets(
  assets: PersistedFileFolderAsset[],
) {
  const db = await getDb();
  await db.clear(ASSETS_STORE);
  await Promise.all(assets.map((asset) => db.put(ASSETS_STORE, asset)));
}

export async function chooseProjectFolder() {
  const picker = getDirectoryPicker();

  if (!picker) {
    throw new Error("Project folder selection is not supported in this browser.");
  }

  const directoryHandle = await picker();
  if (!(await ensureHandlePermission(directoryHandle))) {
    throw new Error("Permission to read the selected folder was denied.");
  }

  const db = await getDb();
  await db.put(PROJECT_FOLDER_STORE, {
    id: PROJECT_FOLDER_KEY,
    handle: directoryHandle,
  });

  const assets = await scanProjectFolder(directoryHandle);
  await replacePersistedProjectFolderAssets(assets);

  return materializeAssets(assets);
}

export async function refreshProjectFolderAssets() {
  const db = await getDb();
  const projectFolder = await db.get(PROJECT_FOLDER_STORE, PROJECT_FOLDER_KEY);

  if (!projectFolder) {
    throw new Error("No project folder has been opened yet.");
  }

  if (!(await ensureHandlePermission(projectFolder.handle))) {
    throw new Error("Permission to read the selected folder was denied.");
  }

  const assets = await scanProjectFolder(projectFolder.handle);
  await replacePersistedProjectFolderAssets(assets);

  return materializeAssets(assets);
}
