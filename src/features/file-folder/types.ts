import type { ValidAssetType } from "@/stores/timeline/types";

export type FileFolderMode = "project-folder" | "upload-files";
export type FileFolderAssetType = Extract<
  ValidAssetType,
  "video" | "audio" | "image"
>;

export type FileFolderMetadata =
  | {
      type: "video" | "audio";
      durationSec: number | null;
    }
  | {
      type: "image";
      width: number | null;
      height: number | null;
    };

export type FileSystemPermissionMode = "read" | "readwrite";

export type FileSystemHandleLike = {
  kind: "file" | "directory";
  name: string;
  queryPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<PermissionState>;
  requestPermission?: (descriptor?: {
    mode?: FileSystemPermissionMode;
  }) => Promise<PermissionState>;
};

export type FileSystemFileHandleLike = FileSystemHandleLike & {
  kind: "file";
  getFile: () => Promise<File>;
  createWritable?: () => Promise<{
    write: (data: BlobPart) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

export type FileSystemDirectoryHandleLike = FileSystemHandleLike & {
  kind: "directory";
  entries?: () => AsyncIterableIterator<
    [string, FileSystemFileHandleLike | FileSystemDirectoryHandleLike]
  >;
  getFileHandle?: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<FileSystemFileHandleLike>;
};

export type PersistedFileFolderAsset = {
  id: string;
  mode: FileFolderMode;
  type: FileFolderAssetType;
  name: string;
  size: number;
  lastModified: number;
  handle: FileSystemFileHandleLike;
  metadata: FileFolderMetadata;
  importedAt: number;
};

export type FileFolderAsset = PersistedFileFolderAsset & {
  src: string;
};

export type StorageEstimate = {
  usage: number | null;
  quota: number | null;
};

export const ACCEPTED_MEDIA_MIME_TYPES = [
  "audio/*",
  "image/*",
  "video/*",
] as const;

const SUPPORTED_EXTENSIONS = new Map<string, FileFolderAssetType>([
  ["aac", "audio"],
  ["aif", "audio"],
  ["aiff", "audio"],
  ["flac", "audio"],
  ["m4a", "audio"],
  ["mp3", "audio"],
  ["ogg", "audio"],
  ["opus", "audio"],
  ["wav", "audio"],
  ["webm", "video"],
  ["mp4", "video"],
  ["m4v", "video"],
  ["mov", "video"],
  ["avi", "video"],
  ["jpg", "image"],
  ["jpeg", "image"],
  ["png", "image"],
  ["gif", "image"],
  ["webp", "image"],
  ["avif", "image"],
  ["bmp", "image"],
  ["svg", "image"],
]);

export function getAssetTypeFromFile(file: File): FileFolderAssetType | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("image/")) return "image";

  const extension = file.name.split(".").pop()?.toLowerCase();
  return extension ? (SUPPORTED_EXTENSIONS.get(extension) ?? null) : null;
}

export function isSupportedMediaFile(file: File) {
  return getAssetTypeFromFile(file) !== null;
}
