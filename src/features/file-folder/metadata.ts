import type { FileFolderAssetType, FileFolderMetadata } from "./types";

function getMediaDuration(file: File, type: "audio" | "video") {
  return new Promise<number | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const element =
      type === "video"
        ? document.createElement("video")
        : document.createElement("audio");

    const cleanup = () => {
      element.removeAttribute("src");
      element.load();
      URL.revokeObjectURL(url);
    };

    element.preload = "metadata";
    element.onloadedmetadata = () => {
      const duration = Number.isFinite(element.duration)
        ? element.duration
        : null;
      cleanup();
      resolve(duration);
    };
    element.onerror = () => {
      cleanup();
      resolve(null);
    };
    element.src = url;
  });
}

function getImageDimensions(file: File) {
  return new Promise<{ width: number | null; height: number | null }>(
    (resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();

      const cleanup = () => {
        URL.revokeObjectURL(url);
      };

      image.onload = () => {
        const width = image.naturalWidth || null;
        const height = image.naturalHeight || null;
        cleanup();
        resolve({ width, height });
      };
      image.onerror = () => {
        cleanup();
        resolve({ width: null, height: null });
      };
      image.src = url;
    },
  );
}

export async function extractAssetMetadata(
  file: File,
  type: FileFolderAssetType,
): Promise<FileFolderMetadata> {
  if (type === "image") {
    return {
      type,
      ...(await getImageDimensions(file)),
    };
  }

  return {
    type,
    durationSec: await getMediaDuration(file, type),
  };
}
