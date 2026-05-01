import type {
  TimelineStore,
  Asset,
  Clip,
  Layer,
  TimelineStoreActions,
} from "./types";
import type { StoreApi } from "zustand";

type SetState = StoreApi<TimelineStore>["setState"];
type GetState = StoreApi<TimelineStore>["getState"];

export const createTimelineActions = (
  set: SetState,
  get: GetState,
): TimelineStoreActions => ({
  addAsset: (assetInput) => {
    const assetId = crypto.randomUUID();
    const asset: Asset = {
      ...assetInput,
      id: assetId,
    };

    set((state) => ({
      assets: {
        ...state.assets,
        [assetId]: asset,
      },
    }));

    return assetId;
  },

  addLayer: (timelineId, layerInput) => {
    const state = get();
    const timeline = state.timelines[timelineId];
    if (!timeline) return null;

    const layerId = crypto.randomUUID();

    const layer: Layer = {
      ...layerInput,
      id: layerId,
      timelineId,
    };

    set((state) => {
      const currentTimeline = state.timelines[timelineId];
      if (!currentTimeline) return state;

      const nextLayerIds = [...currentTimeline.layerIds, layerId];

      return {
        layers: {
          ...state.layers,
          [layerId]: layer,
        },
        timelines: {
          ...state.timelines,
          [timelineId]: {
            ...currentTimeline,
            layerIds: nextLayerIds,
          },
        },
      };
    });

    return layerId;
  },

  addClip: (layerId, clipToAdd) => {
    const state = get();
    const layer = state.layers[layerId];
    if (!layer) return null;

    const clipId = crypto.randomUUID();

    const clip: Clip = {
      ...clipToAdd,
      id: clipId,
      layerId,
    };

    set((state) => {
      const currentLayer = state.layers[layerId];
      if (!currentLayer) return state;

      const nextClipIds = [...currentLayer.clipIds, clipId];

      return {
        clips: {
          ...state.clips,
          [clipId]: clip,
        },
        layers: {
          ...state.layers,
          [layerId]: {
            ...currentLayer,
            clipIds: nextClipIds,
          },
        },
      };
    });

    return clipId;
  },

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

      const nextSelectedClipIds = state.selectedClipIds.filter(
        (id) => id !== clipId,
      );

      const layer = state.layers[clip.layerId];
      if (!layer) {
        return {
          clips: nextClips,
          selectedClipIds: nextSelectedClipIds,
        };
      }

      return {
        clips: nextClips,
        layers: {
          ...state.layers,
          [clip.layerId]: {
            ...layer,
            clipIds: layer.clipIds.filter((id) => id !== clipId),
          },
        },
        selectedClipIds: nextSelectedClipIds,
      };
    }),

  selectClips: (clipIds) => set({ selectedClipIds: clipIds }),
});
