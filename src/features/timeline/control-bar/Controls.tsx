import { Button } from "@/shared/components/ui/button";
import { Play, Rewind, FastForward, Pause } from "lucide-react";
import { useRemotionPlayerStore } from "@/stores/remotion-player/store";

export default function Controls() {
  return (
    <div className="flex items-center justify-center gap-2">
      <RewindButton />
      <PlayButton />
      <FastForwardButton />
    </div>
  );
}

function PlayButton() {
  const isPlaying = useRemotionPlayerStore((state) => state.isPlaying);
  const play = useRemotionPlayerStore((state) => state.play);
  const pause = useRemotionPlayerStore((state) => state.pause);

  return (
    <Button
      variant="outline"
      size="icon"
      className={"rounded-full"}
      onClick={() => (isPlaying ? pause() : play())}
    >
      {isPlaying ? <Pause /> : <Play />}
    </Button>
  );
}

function RewindButton() {
  return (
    <Button
      aria-label="Rewind"
      variant="outline"
      size="icon"
      className={"rounded-full"}
    >
      <Rewind />
    </Button>
  );
}

function FastForwardButton() {
  return (
    <Button
      aria-label="Fast forward"
      variant="outline"
      size="icon"
      className={"rounded-full"}
    >
      <FastForward />
    </Button>
  );
}
