import { create } from "zustand";
import { createTimelineActions } from "./actions";
import type { TimelineStore } from "./types";

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  assets: {},
  layers: {},
  clips: {},
  timelines: {},
  currentTimelineId: null,
  currentTime: 0,
  selectedClipIds: [],
  ...createTimelineActions(set, get),
}));
