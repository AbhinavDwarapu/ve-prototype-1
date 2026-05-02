import { Download, FastForward, Pause, Play, Rewind } from "lucide-react";
import { lazy, Suspense, useState } from "react";
import { useCurrentPlayerFrame } from "@/remotion/hooks/use-current-player-frame";
import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";
import { Button } from "@/shared/components/ui/button";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";
import { useHoldToSeek } from "../hooks/use-hold-to-seek";

const ExportVideoDialog = lazy(() =>
  import("@/features/export/export-video-dialog").then((m) => ({
    default: m.ExportVideoDialog,
  })),
);

const SKIP_SECONDS = 5;

const formatTime = (totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default function ControlBar() {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportDialogKey, setExportDialogKey] = useState(0);
  const player = useRemotionPlayerStore((s) => s.player);
  const isPlaying = useRemotionPlayerStore((s) => s.isPlaying);
  const play = useRemotionPlayerStore((s) => s.play);
  const pause = useRemotionPlayerStore((s) => s.pause);
  const fps = useCompositionSettingsStore((s) => s.fps);
  const durationSec = useCompositionSettingsStore((s) => s.durationSec);
  const durationInFrames = getDurationInFrames(fps, durationSec);

  const currentFrame = useCurrentPlayerFrame(player);
  const currentSec = currentFrame / fps;
  const totalSec = durationInFrames / fps;

  const seekConfig = {
    fps,
    durationFrames: durationInFrames,
    skipSeconds: SKIP_SECONDS,
  } as const;
  const backwardHandlers = useHoldToSeek({ direction: -1, ...seekConfig });
  const forwardHandlers = useHoldToSeek({ direction: 1, ...seekConfig });

  const togglePlay = () => {
    if (isPlaying) pause();
    else play();
  };

  return (
    <>
      <Suspense fallback={null}>
        <ExportVideoDialog
          key={exportDialogKey}
          open={exportOpen}
          onOpenChange={setExportOpen}
        />
      </Suspense>
    <div className="flex items-center justify-between h-10 px-3 bg-neutral-900 rounded-lg text-neutral-200">
      <div className="flex items-center gap-3 font-mono text-xs tabular-nums min-w-[180px]">
        <span>
          {formatTime(currentSec)} / {formatTime(totalSec)}
        </span>
        <span className="text-neutral-500">
          {currentFrame} / {durationInFrames}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Fast backward"
          {...backwardHandlers}
        >
          <Rewind />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={togglePlay}
        >
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Fast forward"
          {...forwardHandlers}
        >
          <FastForward />
        </Button>
      </div>

      <div className="flex min-w-[180px] justify-end">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Export video"
          onClick={() => {
            setExportDialogKey((k) => k + 1);
            setExportOpen(true);
          }}
        >
          <Download />
        </Button>
      </div>
    </div>
    </>
  );
}
