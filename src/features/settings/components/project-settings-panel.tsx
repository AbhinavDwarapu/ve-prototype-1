import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { NumberField } from "./number-field";
import { SettingsFooter } from "./settings-footer";
import type { ProjectDraft } from "../types";

export function ProjectSettingsPanel({
  draft,
  isDirty,
  onDraftChange,
  onSave,
}: {
  draft: ProjectDraft;
  isDirty: boolean;
  onDraftChange: (patch: Partial<ProjectDraft>) => void;
  onSave: () => void;
}) {
  return (
    <>
      <div className="border-b border-editor-outline bg-editor-panel-strong/45 p-4">
        <h2 className="text-base font-semibold tracking-tight">
          Project Settings
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Update Remotion composition dimensions, duration, and timeline scale.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="Width"
            value={draft.width}
            min={1}
            onChange={(width) => onDraftChange({ width })}
          />
          <NumberField
            label="Height"
            value={draft.height}
            min={1}
            onChange={(height) => onDraftChange({ height })}
          />
        </div>

        <NumberField
          label="Total Duration"
          value={draft.durationSec}
          min={0.1}
          step={0.1}
          onChange={(durationSec) => onDraftChange({ durationSec })}
          help={`${getDurationInFrames(draft.fps, draft.durationSec)} frames`}
        />

        <NumberField
          label="Frame Rate"
          value={draft.fps}
          min={1}
          onChange={(fps) => onDraftChange({ fps })}
          help="Frames per second"
        />

        <NumberField
          label="Pixels Per Second"
          value={draft.pixelsPerSecond}
          min={1}
          onChange={(pixelsPerSecond) => onDraftChange({ pixelsPerSecond })}
          help="Timeline zoom density"
        />
      </div>

      <SettingsFooter disabled={!isDirty} onSave={onSave} />
    </>
  );
}
