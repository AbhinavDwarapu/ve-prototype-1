import { useEffect } from "react";
import "./App.css";
import PlayerPage from "./features/player";
import Timeline from "./features/timeline";
import { useTimelineStore } from "@/stores/timeline/store";
import type {
  Asset,
  Clip,
  Layer,
  Timeline as TimelineModel,
} from "@/stores/timeline/types";

/** Temporary test seed: public sample media so the Remotion player can render clips from the store. */
function seedTestTimelineStore() {
  const timelineId = "test-timeline";
  const layerVideoId = "test-layer-video";
  const layerImageId = "test-layer-image";
  const assetVideoId = "test-asset-video";
  const assetImageId = "test-asset-image";
  const clipVideoId = "test-clip-video";
  const clipImageId = "test-clip-image";

  const timeline: TimelineModel = {
    id: timelineId,
    name: "Test timeline",
    layerIds: [layerVideoId, layerImageId],
    fps: 60,
    duration: 600,
  };

  const layerVideo: Layer = {
    id: layerVideoId,
    timelineId,
    type: "video",
    name: "Video",
    clipIds: [clipVideoId],
  };

  const layerImage: Layer = {
    id: layerImageId,
    timelineId,
    type: "image",
    name: "Image",
    clipIds: [clipImageId],
  };

  const assetVideo: Asset = {
    id: assetVideoId,
    type: "video",
    name: "Sample promo (Google)",
    src: "https://remotionlambda-gxzle4ynoh.s3-accelerate.amazonaws.com/bdf2c99d-6a3d-46b9-972f-e8a093b8b31a",
  };

  const assetImage: Asset = {
    id: assetImageId,
    type: "image",
    name: "Sample PNG (W3C)",
    src: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Falkland_Islands_map_from_CIA_World_Factbook.png",
  };

  const clipVideo: Clip = {
    id: clipVideoId,
    layerId: layerVideoId,
    startPx: 0,
    widthPx: 1000,
    assetId: assetVideoId,
    kind: "video",
  };

  const clipImage: Clip = {
    id: clipImageId,
    layerId: layerImageId,
    startPx: 300,
    widthPx: 250,
    assetId: assetImageId,
    kind: "image",
  };

  useTimelineStore.setState({
    assets: {
      [assetVideoId]: assetVideo,
      [assetImageId]: assetImage,
    },
    layers: {
      [layerVideoId]: layerVideo,
      [layerImageId]: layerImage,
    },
    clips: {
      [clipVideoId]: clipVideo,
      [clipImageId]: clipImage,
    },
    timelines: {
      [timelineId]: timeline,
    },
    currentTimelineId: timelineId,
  });
}

function App() {
  useEffect(() => {
    const isLocalhost = window.location.hostname === "localhost";

    if (isLocalhost) {
      seedTestTimelineStore();
    }
  }, []);

  return (
    <main className="flex flex-col items-center w-full h-screen p-2">
      <PlayerPage />
      <Timeline />
    </main>
  );
}

export default App;
