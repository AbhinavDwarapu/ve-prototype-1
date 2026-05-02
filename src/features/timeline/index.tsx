import TimelineComponent from "./components/timeline";
import ControlBar from "./components/control-bar";

export default function Timeline() {
  return (
    <div className="absolute bottom-0 my-2 flex h-72 w-[calc(100%-1rem)] flex-col gap-2">
      <ControlBar />
      <TimelineComponent options={{ layerHeight: 64 }} />
    </div>
  );
}
