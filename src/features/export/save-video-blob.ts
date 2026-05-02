type SaveFilePickerOptions = {
  suggestedName?: string;
  types?: Array<{
    description?: string;
    accept: Record<string, string[]>;
  }>;
};

type FilePickerHandle = {
  createWritable: () => Promise<FileSystemWritableFileStream>;
};

type WindowWithSavePicker = Window & {
  showSaveFilePicker?: (
    options?: SaveFilePickerOptions,
  ) => Promise<FilePickerHandle>;
};

export type VideoSaveTarget = {
  suggestedName: string;
  handle?: FilePickerHandle;
};

export function defaultExportFilename(): string {
  const stamp = new Date().toISOString().replaceAll(":", "-").slice(0, 19);
  return `export-${stamp}.mp4`;
}

function triggerAnchorDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function createVideoSaveTarget(
  suggestedName = defaultExportFilename(),
): Promise<VideoSaveTarget | null> {
  const win = window as WindowWithSavePicker;
  const picker = win.showSaveFilePicker;

  if (typeof picker !== "function") {
    return { suggestedName };
  }

  try {
    const handle = await picker({
      suggestedName,
      types: [
        {
          description: "MP4 video",
          accept: { "video/mp4": [".mp4"] },
        },
      ],
    });
    return { suggestedName, handle };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }
    if (
      error instanceof DOMException &&
      (error.name === "SecurityError" || error.name === "NotAllowedError")
    ) {
      return { suggestedName };
    }
    throw error;
  }
}

/**
 * Saves the blob via the File System Access API when supported (user picks path),
 * otherwise triggers a download with the given filename.
 */
export async function saveVideoBlob(
  blob: Blob,
  target: VideoSaveTarget,
): Promise<void> {
  if (target.handle) {
    const writable = await target.handle.createWritable();
    try {
      await writable.write(blob);
    } finally {
      await writable.close();
    }
    return;
  }

  triggerAnchorDownload(blob, target.suggestedName);
}
