import "./App.css";
import { useState } from "react";
import PlayerPage from "./features/player";
import { Timeline, type Clip } from "timeline-as-library";
import { useCurrentPlayerFrame } from "./remotion/hooks/use-current-player-frame";
import { useRemotionPlayerStore } from "./stores/remotion-player/store";

const FPS = 60;

function App() {
  const [clips, setClips] = useState<Clip[]>([
    { id: "clip-1", layerId: "1", startPx: 0, widthPx: 140 },
    { id: "clip-2", layerId: "2", startPx: 170, widthPx: 120 },
  ]);
  const player = useRemotionPlayerStore((s) => s.player);
  const seekTo = useRemotionPlayerStore((s) => s.seekTo);
  const currentFrame = useCurrentPlayerFrame(player);
  const currentTimeSec = currentFrame / FPS;

  return (
    <main className="flex flex-col items-center justify-center w-full h-screen p-2">
      <PlayerPage />
      <Timeline
        number_of_layers={3}
        clips={clips}
        setClips={setClips}
        pixelsPerSecond={80}
        durationSec={60}
        currentTimeSec={currentTimeSec}
        onSeek={(timeSec) => seekTo(Math.round(timeSec * FPS))}
        classNames={{
          root: "absolute bottom-0 my-2 w-[calc(100%-1rem)] overflow-x-auto overflow-y-hidden rounded-sm bg-neutral-900 shadow-lg demo-timeline",
          layer:
            "relative h-full w-full rounded-md bg-neutral-800/60 flex items-center px-2 text-xs text-neutral-400",
          clip: "h-full w-full rounded-md bg-indigo-500 shadow ring-1 ring-indigo-300/40",
          moveable: "demo-moveable",
          playhead: "demo-playhead",
          ticks: "demo-ticks",
          tick: "demo-tick",
          majorTick: "demo-tick-major",
          tickLabel: "demo-tick-label",
          playheadHead: "demo-playhead-head",
        }}
      />
    </main>
  );
}

export default App;
