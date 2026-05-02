import type { CompositionSettingsStore } from "./types";
import type { StoreApi } from "zustand";

type SetState = StoreApi<CompositionSettingsStore>["setState"];

export const createCompositionSettingsActions = (
  set: SetState,
): Pick<
  CompositionSettingsStore,
  | "setFps"
  | "setDurationSec"
  | "setDimensions"
  | "setPixelsPerSecond"
  | "updateCompositionSettings"
> => ({
  setFps: (fps) => set({ fps }),
  setDurationSec: (durationSec) => set({ durationSec }),
  setDimensions: (width, height) => set({ width, height }),
  setPixelsPerSecond: (pixelsPerSecond) => set({ pixelsPerSecond }),
  updateCompositionSettings: (settings) => set(settings),
});
