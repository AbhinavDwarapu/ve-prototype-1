import { describe, it, beforeEach, expect, assert } from "vitest";
import { useTimelineStore } from "../../src/stores/timeline/store";
import type {
  TimelineStoreItems,
  ValidAssetType,
} from "../../src/stores/timeline/types";

const initialState: TimelineStoreItems = {
  assets: {
    "asset-1": {
      id: "asset-1",
      type: "video",
      name: "B-roll clip",
      src: "/fixtures/broll.mp4",
    },
    "asset-2": {
      id: "asset-2",
      type: "audio",
      name: "Voiceover",
      src: "/fixtures/voiceover.mp3",
    },
  },
  layers: {
    "layer-1": {
      id: "layer-1",
      timelineId: "timeline-1",
      type: "video",
      name: "Video Layer",
      clipIds: ["clip-1"],
    },
    "layer-2": {
      id: "layer-2",
      timelineId: "timeline-1",
      type: "audio",
      name: "Audio Layer",
      clipIds: [],
    },
  },
  clips: {
    "clip-1": {
      id: "clip-1",
      layerId: "layer-1",
      startPx: 0,
      widthPx: 200,
      assetId: "asset-1",
      kind: "video",
    },
  },
  timelines: {
    "timeline-1": {
      id: "timeline-1",
      name: "Main Timeline",
      layerIds: ["layer-1", "layer-2"],
      fps: 30,
      duration: 600,
    },
  },
  currentTimelineId: "timeline-1",
  currentTime: 0,
  selectedClipIds: [],
};

describe("Timeline Store Tests", () => {
  beforeEach(() => {
    useTimelineStore.setState(structuredClone(initialState));
  });

  it("should create a timeline store", () => {
    const state = useTimelineStore.getState();
    expect(state).toBeDefined();
  });

  it("should add a layer to the timeline", () => {
    const timelineId = "timeline-1";
    const layerId = useTimelineStore.getState().addLayer(timelineId, {
      type: "video" as ValidAssetType,
      name: "Layer 1",
      clipIds: [],
    });
    expect(layerId).not.toBeNull();
    // for type checker
    assert(layerId);
    const state = useTimelineStore.getState();
    expect(state.layers[layerId]).toBeDefined();
    expect(state.layers[layerId].name).toBe("Layer 1");
    expect(state.layers[layerId].clipIds).toEqual([]);
    expect(state.timelines[timelineId].layerIds).toContain(layerId);
  });

  it("should add a clip to the target layer", () => {
    const layerId = "layer-2";
    const clipId = useTimelineStore.getState().addClip(layerId, {
      startPx: 0,
      widthPx: 100,
      assetId: "asset-2",
      kind: "audio" as ValidAssetType,
    });
    expect(clipId).not.toBeNull();
    // for type checker
    assert(clipId);
    const state = useTimelineStore.getState();
    expect(state.clips[clipId].id).toBe(clipId);
    expect(state.clips[clipId].layerId).toBe(layerId);
    expect(state.layers[layerId].clipIds).toContain(clipId);
  });

  it("should update clip fields in place", () => {
    useTimelineStore
      .getState()
      .updateClip("clip-1", {
        startPx: 45,
        widthPx: 180,
        playbackRate: 1.25,
        volume: 0.5,
        trimBefore: 12,
        trimAfter: 120,
      });

    const state = useTimelineStore.getState();
    expect(state.clips["clip-1"].startPx).toBe(45);
    expect(state.clips["clip-1"].widthPx).toBe(180);
    expect(state.clips["clip-1"].playbackRate).toBe(1.25);
    expect(state.clips["clip-1"].volume).toBe(0.5);
    expect(state.clips["clip-1"].trimBefore).toBe(12);
    expect(state.clips["clip-1"].trimAfter).toBe(120);
    expect(state.layers["layer-1"].clipIds).toContain("clip-1");
  });

  it("should persist player layout updates on clips", () => {
    useTimelineStore.getState().updateClip("clip-1", {
      playerLayout: {
        left: 24,
        top: 32,
        width: 320,
        height: 180,
      },
    });

    const state = useTimelineStore.getState();
    expect(state.clips["clip-1"].playerLayout).toEqual({
      left: 24,
      top: 32,
      width: 320,
      height: 180,
    });
  });

  it("should move clip references when changing layerId", () => {
    useTimelineStore.getState().updateClip("clip-1", { layerId: "layer-2" });

    const state = useTimelineStore.getState();
    expect(state.clips["clip-1"].layerId).toBe("layer-2");
    expect(state.layers["layer-1"].clipIds).not.toContain("clip-1");
    expect(state.layers["layer-2"].clipIds).toContain("clip-1");
  });

  it("should delete a clip and remove it from layer clipIds", () => {
    useTimelineStore.getState().selectClips(["clip-1", "clip-2"]);
    useTimelineStore.getState().deleteClip("clip-1");

    const state = useTimelineStore.getState();
    expect(state.clips["clip-1"]).toBeUndefined();
    expect(state.layers["layer-1"].clipIds).not.toContain("clip-1");
    expect(state.selectedClipIds).toEqual(["clip-2"]);
  });

  it("should select clips", () => {
    useTimelineStore.getState().selectClips(["clip-2"]);

    const state = useTimelineStore.getState();
    expect(state.selectedClipIds).toEqual(["clip-2"]);
  });
});
