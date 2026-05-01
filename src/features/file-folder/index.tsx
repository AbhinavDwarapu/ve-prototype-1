import { useMemo, useRef, useState } from "react";
import { COMPOSITION_DURATION_SEC, PX_PER_SECOND } from "@/remotion/utils";
import { useTimelineStore } from "@/stores/timeline/store";
import { FileFolderAssetList } from "./components/file-folder-asset-list";
import { FileFolderError } from "./components/file-folder-error";
import { FileFolderFooter } from "./components/file-folder-footer";
import { FileFolderHiddenInput } from "./components/file-folder-hidden-input";
import { FileFolderOnboarding } from "./components/file-folder-onboarding";
import { useFileFolderAssets } from "./hooks/use-file-folder-assets";
import type { FileFolderAsset } from "./types";

const IMAGE_DEFAULT_DURATION_SEC = 5;

function getClipDurationSec(asset: FileFolderAsset) {
  const duration =
    asset.metadata.type === "image"
      ? IMAGE_DEFAULT_DURATION_SEC
      : (asset.metadata.durationSec ?? IMAGE_DEFAULT_DURATION_SEC);

  return Math.min(Math.max(duration, 1), COMPOSITION_DURATION_SEC);
}

export default function FileFolderSidebar() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const {
    assets,
    error,
    isLoading,
    openProjectFolder,
    storageEstimate,
    uploadFiles,
  } = useFileFolderAssets();

  const currentTimelineId = useTimelineStore((s) => s.currentTimelineId);
  const addAsset = useTimelineStore((s) => s.addAsset);
  const addLayer = useTimelineStore((s) => s.addLayer);
  const addClip = useTimelineStore((s) => s.addClip);

  const selectedAsset = useMemo(
    () => assets.find((asset) => asset.id === selectedAssetId) ?? null,
    [assets, selectedAssetId],
  );

  async function handleOpenProjectFolder() {
    const opened = await openProjectFolder();
    if (opened) {
      setSelectedAssetId(null);
    }
  }

  async function handleFilesSelected(files: FileList | null) {
    await uploadFiles(files);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleAddSelectedAsset() {
    if (!selectedAsset || !currentTimelineId) return;

    const assetId = addAsset({
      type: selectedAsset.type,
      name: selectedAsset.name,
      src: selectedAsset.src,
    });
    const layerId = addLayer(currentTimelineId, {
      type: selectedAsset.type,
      name: selectedAsset.name,
      clipIds: [],
    });

    if (!layerId) return;

    addClip(layerId, {
      startPx: 0,
      widthPx: getClipDurationSec(selectedAsset) * PX_PER_SECOND,
      assetId,
      kind: selectedAsset.type,
    });
  }

  return (
    <aside className="absolute top-2 bottom-72 left-2 z-10 flex w-80 flex-col rounded-2xl border bg-background/95 shadow-xl backdrop-blur">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">File Folder</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Add local video, audio, and image files to your timeline.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {assets.length === 0 ? (
          <FileFolderOnboarding
            isLoading={isLoading}
            storageEstimate={storageEstimate}
            onOpenProjectFolder={handleOpenProjectFolder}
            onUploadFiles={() => inputRef.current?.click()}
          />
        ) : (
          <FileFolderAssetList
            assets={assets}
            isLoading={isLoading}
            selectedAssetId={selectedAssetId}
            storageEstimate={storageEstimate}
            onOpenProjectFolder={handleOpenProjectFolder}
            onSelectAsset={setSelectedAssetId}
            onUploadFiles={() => inputRef.current?.click()}
          />
        )}

        <FileFolderError message={error} />
      </div>

      <FileFolderFooter
        canAddAsset={Boolean(selectedAsset)}
        hasTimeline={Boolean(currentTimelineId)}
        isLoading={isLoading}
        onAddAsset={handleAddSelectedAsset}
      />
      <FileFolderHiddenInput
        ref={inputRef}
        onFilesSelected={(files) => void handleFilesSelected(files)}
      />
    </aside>
  );
}
