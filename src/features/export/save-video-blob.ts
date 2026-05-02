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

function triggerAnchorDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  URL.revokeObjectURL(url);
}

/**
 * Saves the blob via the File System Access API when supported (user picks path),
 * otherwise triggers a download with the given filename.
 */
export async function saveVideoBlob(
  blob: Blob,
  suggestedName: string,
): Promise<void> {
  const win = window as WindowWithSavePicker;
  const picker = win.showSaveFilePicker;

  if (typeof picker === "function") {
    const handle = await picker({
      suggestedName,
      types: [
        {
          description: "MP4 video",
          accept: { "video/mp4": [".mp4"] },
        },
      ],
    });
    const writable = await handle.createWritable();
    try {
      await writable.write(blob);
    } finally {
      await writable.close();
    }
    return;
  }

  triggerAnchorDownload(blob, suggestedName);
}
