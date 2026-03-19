import type {
  TimelineStore,
  Clip,
  Layer,
  ID,
  TimelineStoreActions,
} from "./types";
import type { StoreApi } from "zustand";

type SetState = StoreApi<TimelineStore>["setState"];
type GetState = StoreApi<TimelineStore>["getState"];

export const createTimelineActions = (
  set: SetState,
  _get: GetState,
): TimelineStoreActions => ({
  addLayer: (timelineId: ID, layer: Layer) =>
    set((state) => {
      const timeline = state.timelines[timelineId];
      if (!timeline || layer.timelineId !== timelineId) return state;

      const nextLayerIds = timeline.layerIds.includes(layer.id)
        ? timeline.layerIds
        : [...timeline.layerIds, layer.id];

      return {
        layers: {
          ...state.layers,
          [layer.id]: layer,
        },
        timelines: {
          ...state.timelines,
          [timelineId]: {
            ...timeline,
            layerIds: nextLayerIds,
          },
        },
      };
    }),

  addClip: (layerId: ID, clip: Clip) =>
    set((state) => {
      const layer = state.layers[layerId];
      if (!layer) return state;

      const nextClip = clip.layerId === layerId ? clip : { ...clip, layerId };
      const nextClipIds = layer.clipIds.includes(nextClip.id)
        ? layer.clipIds
        : [...layer.clipIds, nextClip.id];

      return {
        clips: {
          ...state.clips,
          [nextClip.id]: nextClip,
        },
        layers: {
          ...state.layers,
          [layerId]: {
            ...layer,
            clipIds: nextClipIds,
          },
        },
      };
    }),

  updateClip: (clipId, patch) =>
    set((state) => {
      const currentClip = state.clips[clipId];
      if (!currentClip) return state;

      const nextClip = { ...currentClip, ...patch };
      const nextLayerId = patch.layerId;

      if (!nextLayerId || nextLayerId === currentClip.layerId) {
        return {
          clips: {
            ...state.clips,
            [clipId]: nextClip,
          },
        };
      }

      const fromLayer = state.layers[currentClip.layerId];
      const toLayer = state.layers[nextLayerId];
      if (!fromLayer || !toLayer) return state;

      const fromLayerClipIds = fromLayer.clipIds.filter((id) => id !== clipId);
      const toLayerClipIds = toLayer.clipIds.includes(clipId)
        ? toLayer.clipIds
        : [...toLayer.clipIds, clipId];

      return {
        clips: {
          ...state.clips,
          [clipId]: nextClip,
        },
        layers: {
          ...state.layers,
          [currentClip.layerId]: {
            ...fromLayer,
            clipIds: fromLayerClipIds,
          },
          [nextLayerId]: {
            ...toLayer,
            clipIds: toLayerClipIds,
          },
        },
      };
    }),

  deleteClip: (clipId) =>
    set((state) => {
      const clip = state.clips[clipId];
      if (!clip) return state;

      const nextClips = { ...state.clips };
      delete nextClips[clipId];

      const layer = state.layers[clip.layerId];
      if (!layer) return { clips: nextClips };

      return {
        clips: nextClips,
        layers: {
          ...state.layers,
          [clip.layerId]: {
            ...layer,
            clipIds: layer.clipIds.filter((id) => id !== clipId),
          },
        },
      };
    }),

  selectClips: (clipIds) => set({ selectedClipIds: clipIds }),
});
