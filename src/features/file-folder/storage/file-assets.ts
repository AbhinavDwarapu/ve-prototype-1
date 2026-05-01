import { extractAssetMetadata } from "../metadata";
import {
  getAssetTypeFromFile,
  type FileFolderAsset,
  type FileFolderMode,
  type FileSystemFileHandleLike,
  type PersistedFileFolderAsset,
} from "../types";
import { ASSETS_STORE } from "./constants";
import { getDb } from "./db";
import { ensureHandlePermission } from "./permissions";

export async function fileHandleToAsset(
  handle: FileSystemFileHandleLike,
  mode: FileFolderMode,
  nameOverride?: string,
): Promise<PersistedFileFolderAsset | null> {
  if (!(await ensureHandlePermission(handle))) {
    return null;
  }

  const file = await handle.getFile();
  const type = getAssetTypeFromFile(file);
  if (!type) return null;

  return {
    id: crypto.randomUUID(),
    mode,
    type,
    name: nameOverride ?? file.name,
    size: file.size,
    lastModified: file.lastModified,
    handle,
    metadata: await extractAssetMetadata(file, type),
    importedAt: Date.now(),
  };
}

export function revokeAssetUrls(assets: FileFolderAsset[]) {
  for (const asset of assets) {
    URL.revokeObjectURL(asset.src);
  }
}

async function persistedAssetToRuntimeAsset(
  persistedAsset: PersistedFileFolderAsset,
) {
  if (!(await ensureHandlePermission(persistedAsset.handle))) {
    return null;
  }

  try {
    const file = await persistedAsset.handle.getFile();
    return {
      ...persistedAsset,
      size: file.size,
      lastModified: file.lastModified,
      src: URL.createObjectURL(file),
    };
  } catch {
    return null;
  }
}

async function deleteInvalidPersistedAssets(assetIds: string[]) {
  if (assetIds.length === 0) return;

  const db = await getDb();
  await Promise.all(assetIds.map((id) => db.delete(ASSETS_STORE, id)));
}

export async function materializeAssets(
  persistedAssets: PersistedFileFolderAsset[],
) {
  const assets: FileFolderAsset[] = [];
  const invalidAssetIds: string[] = [];

  for (const persistedAsset of persistedAssets) {
    const runtimeAsset = await persistedAssetToRuntimeAsset(persistedAsset);

    if (!runtimeAsset) {
      invalidAssetIds.push(persistedAsset.id);
      continue;
    }

    assets.push(runtimeAsset);
  }

  await deleteInvalidPersistedAssets(invalidAssetIds);

  return assets;
}
