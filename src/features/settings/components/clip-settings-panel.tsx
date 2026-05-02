import { X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { Clip } from "@/stores/timeline/types";
import { mediaTypes } from "../draft-utils";
import type { ClipDraft } from "../types";
import { NumberField } from "./number-field";
import { SettingsFooter } from "./settings-footer";

export function ClipSettingsPanel({
  clip,
  draft,
  assetName,
  isDirty,
  onDraftChange,
  onClose,
  onSave,
}: {
  clip: Clip;
  draft: ClipDraft;
  assetName: string;
  isDirty: boolean;
  onDraftChange: (patch: Partial<ClipDraft>) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const supportsMediaControls = mediaTypes.has(clip.kind);

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-editor-outline bg-editor-panel-strong/45 p-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Clip Settings
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {assetName} · {clip.kind}
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Close clip settings"
          onClick={onClose}
        >
          <X />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <NumberField
          label="Start Frame"
          value={draft.startFrame}
          min={0}
          onChange={(startFrame) => onDraftChange({ startFrame })}
        />
        <NumberField
          label="Duration"
          value={draft.durationInFrames}
          min={1}
          onChange={(durationInFrames) => onDraftChange({ durationInFrames })}
          help="Frames on the timeline"
        />
        <NumberField
          label="End Frame"
          value={draft.endFrame}
          min={1}
          onChange={(endFrame) => onDraftChange({ endFrame })}
          help="Exclusive end frame"
        />

        {supportsMediaControls && (
          <div className="space-y-4 border-t border-editor-outline pt-4">
            <NumberField
              label="Playback Rate"
              value={draft.playbackRate}
              min={0.01}
              step={0.01}
              onChange={(playbackRate) => onDraftChange({ playbackRate })}
            />
            <NumberField
              label="Volume"
              value={draft.volume}
              min={0}
              step={0.01}
              onChange={(volume) => onDraftChange({ volume })}
              help="0 is silent, 1 is original volume"
            />
            <NumberField
              label="Trim Before"
              value={draft.trimBefore}
              min={0}
              onChange={(trimBefore) => onDraftChange({ trimBefore })}
              help="Frames skipped from the source media"
            />
            <NumberField
              label="Trim After"
              value={draft.trimAfter}
              min={0}
              onChange={(trimAfter) => onDraftChange({ trimAfter })}
              help="Source frame to stop at; 0 disables the trim"
            />
          </div>
        )}
      </div>

      <SettingsFooter disabled={!isDirty} onSave={onSave} />
    </>
  );
}
