import { useEffect, useMemo, useState } from "react";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { useTimelineStore } from "@/stores/timeline/store";
import { ClipSettingsPanel } from "./components/clip-settings-panel";
import { ProjectSettingsPanel } from "./components/project-settings-panel";
import {
  clampNumber,
  getClipDraft,
  getProjectDraft,
  mediaTypes,
  roundToInt,
} from "./draft-utils";
import type { ClipDraft, ProjectDraft } from "./types";

export default function SettingsPanel() {
  const width = useCompositionSettingsStore((s) => s.width);
  const height = useCompositionSettingsStore((s) => s.height);
  const fps = useCompositionSettingsStore((s) => s.fps);
  const durationSec = useCompositionSettingsStore((s) => s.durationSec);
  const pixelsPerSecond = useCompositionSettingsStore((s) => s.pixelsPerSecond);
  const updateCompositionSettings = useCompositionSettingsStore(
    (s) => s.updateCompositionSettings,
  );

  const selectedClipIds = useTimelineStore((s) => s.selectedClipIds);
  const clips = useTimelineStore((s) => s.clips);
  const assets = useTimelineStore((s) => s.assets);
  const updateClip = useTimelineStore((s) => s.updateClip);
  const selectClips = useTimelineStore((s) => s.selectClips);

  const projectSettings = useMemo(
    () => ({ width, height, fps, durationSec, pixelsPerSecond }),
    [durationSec, fps, height, pixelsPerSecond, width],
  );
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(() =>
    getProjectDraft(projectSettings),
  );

  useEffect(() => {
    setProjectDraft(getProjectDraft(projectSettings));
  }, [projectSettings]);

  const selectedClipId = selectedClipIds.length === 1 ? selectedClipIds[0] : null;
  const selectedClip = selectedClipId ? clips[selectedClipId] : null;
  const selectedAsset = selectedClip ? assets[selectedClip.assetId] : null;
  const [clipDraft, setClipDraft] = useState<ClipDraft | null>(() =>
    selectedClip ? getClipDraft(selectedClip, fps, pixelsPerSecond) : null,
  );

  useEffect(() => {
    setClipDraft(
      selectedClip ? getClipDraft(selectedClip, fps, pixelsPerSecond) : null,
    );
  }, [fps, pixelsPerSecond, selectedClip]);

  const projectDirty =
    projectDraft.width !== projectSettings.width ||
    projectDraft.height !== projectSettings.height ||
    projectDraft.fps !== projectSettings.fps ||
    projectDraft.durationSec !== projectSettings.durationSec ||
    projectDraft.pixelsPerSecond !== projectSettings.pixelsPerSecond;

  const savedClipDraft =
    selectedClip != null ? getClipDraft(selectedClip, fps, pixelsPerSecond) : null;
  const clipDirty =
    clipDraft != null &&
    savedClipDraft != null &&
    (clipDraft.startFrame !== savedClipDraft.startFrame ||
      clipDraft.durationInFrames !== savedClipDraft.durationInFrames ||
      clipDraft.endFrame !== savedClipDraft.endFrame ||
      clipDraft.playbackRate !== savedClipDraft.playbackRate ||
      clipDraft.volume !== savedClipDraft.volume ||
      clipDraft.trimBefore !== savedClipDraft.trimBefore ||
      clipDraft.trimAfter !== savedClipDraft.trimAfter);

  const updateProjectDraft = (patch: Partial<ProjectDraft>) => {
    setProjectDraft((current) => ({ ...current, ...patch }));
  };

  const updateClipDraft = (patch: Partial<ClipDraft>) => {
    setClipDraft((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };

      if (patch.startFrame != null) {
        next.startFrame = roundToInt(patch.startFrame, current.startFrame, 0);
        next.endFrame = next.startFrame + next.durationInFrames;
      }
      if (patch.durationInFrames != null) {
        next.durationInFrames = roundToInt(
          patch.durationInFrames,
          current.durationInFrames,
          1,
        );
        next.endFrame = next.startFrame + next.durationInFrames;
      }
      if (patch.endFrame != null) {
        next.endFrame = Math.max(
          next.startFrame + 1,
          roundToInt(patch.endFrame, current.endFrame, 1),
        );
        next.durationInFrames = next.endFrame - next.startFrame;
      }

      next.playbackRate = clampNumber(next.playbackRate, current.playbackRate, 0.01);
      next.volume = clampNumber(next.volume, current.volume, 0);
      next.trimBefore = roundToInt(next.trimBefore, current.trimBefore, 0);
      next.trimAfter = roundToInt(next.trimAfter, current.trimAfter, 0);

      return next;
    });
  };

  const saveProjectSettings = () => {
    updateCompositionSettings({
      width: roundToInt(projectDraft.width, projectSettings.width, 1),
      height: roundToInt(projectDraft.height, projectSettings.height, 1),
      fps: roundToInt(projectDraft.fps, projectSettings.fps, 1),
      durationSec: clampNumber(
        projectDraft.durationSec,
        projectSettings.durationSec,
        0.1,
      ),
      pixelsPerSecond: roundToInt(
        projectDraft.pixelsPerSecond,
        projectSettings.pixelsPerSecond,
        1,
      ),
    });
  };

  const saveClipSettings = () => {
    if (!selectedClip || !clipDraft) return;

    const startFrame = roundToInt(clipDraft.startFrame, 0, 0);
    const durationInFrames = roundToInt(clipDraft.durationInFrames, 1, 1);
    const supportsMediaControls = mediaTypes.has(selectedClip.kind);

    updateClip(selectedClip.id, {
      startPx: (startFrame / fps) * pixelsPerSecond,
      widthPx: (durationInFrames / fps) * pixelsPerSecond,
      ...(supportsMediaControls
        ? {
            playbackRate: clampNumber(clipDraft.playbackRate, 1, 0.01),
            volume: clampNumber(clipDraft.volume, 1, 0),
            trimBefore: roundToInt(clipDraft.trimBefore, 0, 0),
            trimAfter: roundToInt(clipDraft.trimAfter, 0, 0),
          }
        : {}),
    });
  };

  return (
    <aside className="absolute top-2 right-2 bottom-72 z-10 flex w-80 flex-col rounded-2xl border bg-background/95 shadow-xl backdrop-blur">
      {selectedClip && clipDraft ? (
        <ClipSettingsPanel
          clip={selectedClip}
          draft={clipDraft}
          assetName={selectedAsset?.name ?? selectedClip.id}
          isDirty={clipDirty}
          onDraftChange={updateClipDraft}
          onClose={() => selectClips([])}
          onSave={saveClipSettings}
        />
      ) : (
        <ProjectSettingsPanel
          draft={projectDraft}
          isDirty={projectDirty}
          onDraftChange={updateProjectDraft}
          onSave={saveProjectSettings}
        />
      )}
    </aside>
  );
}
