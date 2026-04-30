import { Video, type VideoProps } from "@remotion/media";
import { AbsoluteFill } from "remotion";

export type ClipVideoProps = VideoProps;

export function ClipVideo({ style, ...rest }: ClipVideoProps) {
  return (
    <AbsoluteFill>
      <Video
        {...rest}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          ...style,
        }}
      />
    </AbsoluteFill>
  );
}
