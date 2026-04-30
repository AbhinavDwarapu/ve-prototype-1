import { Audio, type AudioProps } from "@remotion/media";

export type ClipAudioProps = AudioProps;

export function ClipAudio(props: ClipAudioProps) {
  return <Audio {...props} />;
}
