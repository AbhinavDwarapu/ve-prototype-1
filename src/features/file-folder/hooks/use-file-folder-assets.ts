import { useCallback, useEffect, useRef, useState } from "react";
import {
  chooseProjectFolder,
  getStorageEstimate,
  importFilesToOpfs,
  loadPersistedAssets,
  revokeAssetUrls,
} from "../storage";
import type { FileFolderAsset, StorageEstimate } from "../types";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function isPickerAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useFileFolderAssets() {
  const [assets, setAssets] = useState<FileFolderAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageEstimate, setStorageEstimate] =
    useState<StorageEstimate | null>(null);
  const assetsRef = useRef<FileFolderAsset[]>([]);

  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  const refreshStorageEstimate = useCallback(async () => {
    setStorageEstimate(await getStorageEstimate());
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreAssets() {
      setIsLoading(true);

      try {
        const [persistedAssets, estimate] = await Promise.all([
          loadPersistedAssets(),
          getStorageEstimate(),
        ]);

        if (!cancelled) {
          setAssets(persistedAssets);
          setStorageEstimate(estimate);
        }
      } catch (restoreError) {
        if (!cancelled) {
          setError(
            getErrorMessage(restoreError, "Unable to restore saved files."),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void restoreAssets();

    return () => {
      cancelled = true;
      revokeAssetUrls(assetsRef.current);
    };
  }, []);

  const openProjectFolder = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextAssets = await chooseProjectFolder();
      setAssets((currentAssets) => {
        revokeAssetUrls(currentAssets);
        return nextAssets;
      });
      await refreshStorageEstimate();
      return true;
    } catch (openError) {
      if (!isPickerAbort(openError)) {
        setError(
          getErrorMessage(openError, "Unable to open project folder."),
        );
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [refreshStorageEstimate]);

  const uploadFiles = useCallback(
    async (files: FileList | File[] | null) => {
      const filesToUpload = files ? [...files] : [];
      if (filesToUpload.length === 0) return false;

      setIsLoading(true);
      setError(null);

      try {
        const importedAssets = await importFilesToOpfs(filesToUpload);
        setAssets((currentAssets) => [...currentAssets, ...importedAssets]);
        await refreshStorageEstimate();
        return importedAssets.length > 0;
      } catch (uploadError) {
        setError(
          getErrorMessage(uploadError, "Unable to upload selected files."),
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshStorageEstimate],
  );

  return {
    assets,
    error,
    isLoading,
    openProjectFolder,
    storageEstimate,
    uploadFiles,
  };
}
