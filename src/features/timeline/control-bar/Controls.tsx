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
  const player = useRemotionPlayerStore((state) => state.player);
  const isPlaying = useRemotionPlayerStore((state) => state.isPlaying);

  if (!player) return <div>No player</div>;

  return (
    <Button
      variant="outline"
      size="icon"
      className={"rounded-full"}
      onClick={() => (isPlaying ? player.pause() : player.play())}
    >
      {isPlaying ? <Pause /> : <Play />}
    </Button>
  );
}

function RewindButton() {
  return (
    <Button variant="outline" size="icon" className={"rounded-full"}>
      <Rewind />
    </Button>
  );
}

function FastForwardButton() {
  return (
    <Button variant="outline" size="icon" className={"rounded-full"}>
      <FastForward />
    </Button>
  );
}
