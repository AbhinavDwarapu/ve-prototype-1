import { forwardRef } from "react";
import { ACCEPTED_MEDIA_MIME_TYPES } from "../types";

export type FileFolderHiddenInputProps = {
  onFilesSelected: (files: FileList | null) => void;
};

export const FileFolderHiddenInput = forwardRef<
  HTMLInputElement,
  FileFolderHiddenInputProps
>(function FileFolderHiddenInput({ onFilesSelected }, ref) {
  return (
    <input
      ref={ref}
      type="file"
      accept={ACCEPTED_MEDIA_MIME_TYPES.join(",")}
      multiple
      className="hidden"
      onChange={(event) => onFilesSelected(event.target.files)}
    />
  );
});
