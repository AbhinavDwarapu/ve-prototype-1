import {
  getAssetTypeFromFile,
  type FileSystemDirectoryHandleLike,
  type PersistedFileFolderAsset,
} from "../types";
import { ASSETS_STORE, OPFS_UPLOADS_DIR } from "./constants";
import { getDb } from "./db";
import { fileHandleToAsset, materializeAssets } from "./file-assets";

type StorageManagerWithOpfs = StorageManager & {
  getDirectory?: () => Promise<FileSystemDirectoryHandleLike>;
};

type DirectoryHandleWithDirectoryCreation = FileSystemDirectoryHandleLike & {
  getDirectoryHandle?: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<FileSystemDirectoryHandleLike>;
};

export function canUseOpfs() {
  return (
    typeof navigator !== "undefined" &&
    typeof (navigator.storage as StorageManagerWithOpfs | undefined)
      ?.getDirectory === "function"
  );
}

async function getOpfsRootDirectory() {
  const storage = navigator.storage as StorageManagerWithOpfs | undefined;
  const rootDirectory = await storage?.getDirectory?.();

  if (!rootDirectory?.getFileHandle) {
    throw new Error("OPFS is not supported in this browser.");
  }

  return rootDirectory;
}

async function createUploadsDirectory(rootDirectory: FileSystemDirectoryHandleLike) {
  const directory = rootDirectory as DirectoryHandleWithDirectoryCreation;
  return directory.getDirectoryHandle?.(OPFS_UPLOADS_DIR, { create: true });
}

async function getOpfsUploadsDirectory() {
  const opfsRoot = await getOpfsRootDirectory();
  const uploadsDirectory = await createUploadsDirectory(opfsRoot);

  return uploadsDirectory ?? opfsRoot;
}

function getSafeOpfsFileName(file: File) {
  return `${crypto.randomUUID()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
}

async function copyFileToOpfs(
  file: File,
  uploadsDirectory: FileSystemDirectoryHandleLike,
) {
  if (!uploadsDirectory.getFileHandle) {
    throw new Error("OPFS file handles are not available in this browser.");
  }

  const fileName = getSafeOpfsFileName(file);
  const handle = await uploadsDirectory.getFileHandle(fileName, {
    create: true,
  });
  const writable = await handle.createWritable?.();

  if (!writable) {
    throw new Error("Unable to write uploaded file to OPFS.");
  }

  await writable.write(file);
  await writable.close();

  return handle;
}

async function importSingleFileToOpfs(
  file: File,
  uploadsDirectory: FileSystemDirectoryHandleLike,
) {
  const type = getAssetTypeFromFile(file);
  if (!type) return null;

  const handle = await copyFileToOpfs(file, uploadsDirectory);
  return fileHandleToAsset(handle, "upload-files", file.name);
}

export async function importFilesToOpfs(files: File[]) {
  const uploadsDirectory = await getOpfsUploadsDirectory();
  const db = await getDb();
  const assets: PersistedFileFolderAsset[] = [];

  for (const file of files) {
    const asset = await importSingleFileToOpfs(file, uploadsDirectory);
    if (asset) {
      assets.push(asset);
      await db.put(ASSETS_STORE, asset);
    }
  }

  return materializeAssets(assets);
}
