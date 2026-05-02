import { create } from "zustand";
import { compositionSettingsDefaults } from "./defaults";
import { createCompositionSettingsActions } from "./actions";
import type { CompositionSettingsStore } from "./types";

export const useCompositionSettingsStore = create<CompositionSettingsStore>(
  (set) => ({
    fps: compositionSettingsDefaults.fps,
    durationSec: compositionSettingsDefaults.durationSec,
    width: compositionSettingsDefaults.width,
    height: compositionSettingsDefaults.height,
    pixelsPerSecond: compositionSettingsDefaults.pixelsPerSecond,
    ...createCompositionSettingsActions(set),
  }),
);
