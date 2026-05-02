import { create } from "zustand";
import {
  compositionSettingsDefaults,
  getDurationInFrames,
} from "@/stores/composition-settings/defaults";
import { createTimelineActions } from "./actions";
import type { Layer, Timeline, TimelineStore } from "./types";

const defaultTimelineId = "test-timeline";
const defaultVideoLayerId = "test-layer-video";

const defaultTimeline: Timeline = {
  id: defaultTimelineId,
  name: "Test timeline",
  layerIds: [defaultVideoLayerId],
  fps: compositionSettingsDefaults.fps,
  duration: getDurationInFrames(
    compositionSettingsDefaults.fps,
    compositionSettingsDefaults.durationSec,
  ),
};

const defaultVideoLayer: Layer = {
  id: defaultVideoLayerId,
  timelineId: defaultTimelineId,
  type: "video",
  name: "Video",
  clipIds: [],
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  assets: {},
  layers: {
    [defaultVideoLayerId]: defaultVideoLayer,
  },
  clips: {},
  timelines: {
    [defaultTimelineId]: defaultTimeline,
  },
  currentTimelineId: defaultTimelineId,
  currentTime: 0,
  selectedClipIds: [],
  ...createTimelineActions(set, get),
}));
