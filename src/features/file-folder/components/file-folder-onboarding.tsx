import { FolderOpen, HardDriveUpload } from "lucide-react";
import { canOpenProjectFolder, canUseOpfs } from "../storage";
import type { StorageEstimate } from "../types";
import { formatRemainingStorage } from "../utils";
import { SourceChoiceCard } from "./source-choice-card";

export type FileFolderOnboardingProps = {
  isLoading: boolean;
  storageEstimate: StorageEstimate | null;
  onOpenProjectFolder: () => void;
  onUploadFiles: () => void;
};

export function FileFolderOnboarding({
  isLoading,
  storageEstimate,
  onOpenProjectFolder,
  onUploadFiles,
}: FileFolderOnboardingProps) {
  const projectFolderSupported = canOpenProjectFolder();
  const opfsSupported = canUseOpfs();

  return (
    <div className="flex flex-col gap-3">
      <SourceChoiceCard
        title="Open Project Folder"
        description="Recommended. Uses original files and persists handles."
        helper={
          projectFolderSupported
            ? "Chrome only. You may be asked to restore permission after reload."
            : "Not supported in this browser. Use Chrome, Edge or Opera instead."
        }
        icon={<FolderOpen className="size-5" />}
        disabled={!projectFolderSupported || isLoading}
        onClick={onOpenProjectFolder}
      />
      <SourceChoiceCard
        title="Upload File(s)"
        description="Copies files into browser storage for this project."
        helper={
          opfsSupported
            ? formatRemainingStorage(storageEstimate)
            : "OPFS is not supported in this browser."
        }
        icon={<HardDriveUpload className="size-5" />}
        disabled={!opfsSupported || isLoading}
        onClick={onUploadFiles}
      />
    </div>
  );
}
