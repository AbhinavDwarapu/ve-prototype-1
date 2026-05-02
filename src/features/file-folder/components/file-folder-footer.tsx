import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export type FileFolderFooterProps = {
  canAddAsset: boolean;
  isLoading: boolean;
  hasTimeline: boolean;
  onAddAsset: () => void;
};

export function FileFolderFooter({
  canAddAsset,
  isLoading,
  hasTimeline,
  onAddAsset,
}: FileFolderFooterProps) {
  return (
    <div className="border-t border-editor-outline bg-editor-panel-strong/35 p-4">
      {!hasTimeline && (
        <p className="mb-2 text-xs text-muted-foreground">
          Create or load a timeline before adding assets.
        </p>
      )}
      <Button
        type="button"
        className="w-full"
        disabled={!canAddAsset || !hasTimeline || isLoading}
        onClick={onAddAsset}
      >
        <Plus />
        Add
      </Button>
    </div>
  );
}
