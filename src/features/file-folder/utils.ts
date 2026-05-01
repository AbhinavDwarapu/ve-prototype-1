import type { FileFolderAsset, StorageEstimate } from "./types";

export function formatBytes(bytes: number | null) {
  if (bytes === null || !Number.isFinite(bytes)) return "Unknown";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "Unknown length";

  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainder = totalSeconds % 60;

  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function formatAssetMetadata(asset: FileFolderAsset) {
  if (asset.metadata.type === "image") {
    const { width, height } = asset.metadata;
    return width && height ? `${width} x ${height}` : "Unknown resolution";
  }

  return formatDuration(asset.metadata.durationSec);
}

export function formatAssetType(type: FileFolderAsset["type"]) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function formatRemainingStorage(estimate: StorageEstimate | null) {
  if (!estimate?.quota) return "Storage remaining unknown";

  const remaining = Math.max(0, estimate.quota - (estimate.usage ?? 0));
  return `About ${formatBytes(remaining)} remaining`;
}
