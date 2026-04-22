import TimelineComponent from "./components/timeline";
import ControlBar from "./components/control-bar";

export default function Timeline() {
  return (
    <div className="absolute bottom-0 my-2 w-[calc(100%-1rem)] flex flex-col gap-2">
      <ControlBar />
      <TimelineComponent />
    </div>
  );
}
