export type CompositionSettingsState = {
  fps: number;
  durationSec: number;
  width: number;
  height: number;
  pixelsPerSecond: number;
};

export type CompositionSettingsActions = {
  setFps: (fps: number) => void;
  setDurationSec: (durationSec: number) => void;
  setDimensions: (width: number, height: number) => void;
  setPixelsPerSecond: (pixelsPerSecond: number) => void;
  updateCompositionSettings: (
    settings: Partial<CompositionSettingsState>,
  ) => void;
};

export type CompositionSettingsStore = CompositionSettingsState &
  CompositionSettingsActions;
