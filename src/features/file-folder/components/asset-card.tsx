import { FileAudio, FileVideo, ImageIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { FileFolderAsset } from "../types";
import {
  formatAssetMetadata,
  formatAssetType,
  formatBytes,
} from "../utils";

export type AssetCardProps = {
  asset: FileFolderAsset;
  selected: boolean;
  onSelect: () => void;
};

function AssetIcon({ type }: Pick<FileFolderAsset, "type">) {
  if (type === "audio") return <FileAudio className="size-4" />;
  if (type === "video") return <FileVideo className="size-4" />;
  return <ImageIcon className="size-4" />;
}

export function AssetCard({ asset, selected, onSelect }: AssetCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border border-editor-outline bg-editor-surface p-3 text-left text-card-foreground transition",
        "hover:border-editor-outline-strong hover:bg-editor-surface-variant focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        selected &&
          "border-editor-primary bg-editor-primary-container text-editor-on-primary-container shadow-sm",
      )}
      aria-pressed={selected}
    >
      <span className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground",
            selected && "bg-primary/20 text-editor-on-primary-container",
          )}
        >
          <AssetIcon type={asset.type} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {asset.name}
          </span>
          <span
            className={cn(
              "mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground",
              selected && "text-editor-on-primary-container/75",
            )}
          >
            <span>{formatAssetType(asset.type)}</span>
            <span>{formatAssetMetadata(asset)}</span>
            <span>{formatBytes(asset.size)}</span>
          </span>
        </span>
      </span>
    </button>
  );
}
