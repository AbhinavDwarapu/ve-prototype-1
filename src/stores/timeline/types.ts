import type { Clip as LibraryClip } from "timeline-as-library";

export type ID = string;
export type ValidAssetType = "video" | "audio" | "image" | "element";

export type Asset = {
  id: ID;
  type: ValidAssetType;
  name: string;
  src: string;
};

export type Clip = LibraryClip & {
  assetId: ID;
  kind: ValidAssetType;
};

export type Layer = {
  id: ID;
  timelineId: ID;
  type: ValidAssetType;
  name: string;
  clipIds: ID[];
};

export type Timeline = {
  id: ID;
  name: string;
  layerIds: ID[];
  fps: number;
  duration: number;
};

export type TimelineStoreItems = {
  assets: Record<ID, Asset>;
  layers: Record<ID, Layer>;
  clips: Record<ID, Clip>;
  timelines: Record<ID, Timeline>;
  currentTimelineId: ID | null;

  currentTime: number;
  selectedClipIds: ID[];
};

export type TimelineStoreActions = {
  addAsset: (asset: Omit<Asset, "id">) => ID;
  addLayer: (
    timelineId: ID,
    layer: Omit<Layer, "id" | "timelineId">,
  ) => ID | null;
  addClip: (layerId: ID, clip: Omit<Clip, "id" | "layerId">) => ID | null;
  updateClip: (clipId: ID, patch: Partial<Omit<Clip, "id">>) => void;
  deleteClip: (clipId: ID) => void;
  selectClips: (clipIds: ID[]) => void;
};

export type TimelineStore = TimelineStoreItems & TimelineStoreActions;
