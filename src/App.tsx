import { useEffect } from "react";
import "./App.css";
import FileFolderSidebar from "./features/file-folder";
import PlayerPage from "./features/player";
import SettingsPanel from "./features/settings";
import Timeline from "./features/timeline";
import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { useTimelineStore } from "@/stores/timeline/store";
import type { Layer, Timeline as TimelineModel } from "@/stores/timeline/types";

/** Temporary test seed: public sample media so the Remotion player can render clips from the store. */
function seedTestTimelineStore() {
  const { fps, durationSec } = useCompositionSettingsStore.getState();
  const durationInFrames = getDurationInFrames(fps, durationSec);

  const timelineId = "test-timeline";
  const layerVideoId = "test-layer-video";

  const timeline: TimelineModel = {
    id: timelineId,
    name: "Test timeline",
    layerIds: [layerVideoId],
    fps,
    duration: durationInFrames,
  };

  const layerVideo: Layer = {
    id: layerVideoId,
    timelineId,
    type: "video",
    name: "Video",
    clipIds: [],
  };

  useTimelineStore.setState({
    layers: {
      [layerVideoId]: layerVideo,
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
    <main className="relative flex h-screen w-full flex-col items-center p-2">
      <FileFolderSidebar />
      <SettingsPanel />
      <PlayerPage />
      <Timeline />
    </main>
  );
}

export default App;
