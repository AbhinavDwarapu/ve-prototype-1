import { RefreshCw, Upload } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { FileFolderAsset, StorageEstimate } from "../types";
import { formatRemainingStorage } from "../utils";
import { AssetCard } from "./asset-card";

export type FileFolderAssetListProps = {
  assets: FileFolderAsset[];
  isLoading: boolean;
  selectedAssetId: string | null;
  storageEstimate: StorageEstimate | null;
  onRefreshProjectFolder: () => void;
  onSelectAsset: (assetId: string) => void;
  onUploadFiles: () => void;
};

export function FileFolderAssetList({
  assets,
  isLoading,
  selectedAssetId,
  storageEstimate,
  onRefreshProjectFolder,
  onSelectAsset,
  onUploadFiles,
}: FileFolderAssetListProps) {
  const activeMode = assets[0]?.mode ?? null;
  const actionIsProjectFolder = activeMode === "project-folder";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{assets.length} assets</p>
          <p className="text-xs text-muted-foreground">
            {actionIsProjectFolder
              ? "Loaded from project folder"
              : formatRemainingStorage(storageEstimate)}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={actionIsProjectFolder ? onRefreshProjectFolder : onUploadFiles}
        >
          {actionIsProjectFolder ? <RefreshCw /> : <Upload />}
          {actionIsProjectFolder ? "Refresh" : "Upload"}
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            selected={asset.id === selectedAssetId}
            onSelect={() => onSelectAsset(asset.id)}
          />
        ))}
      </div>
    </div>
  );
}
