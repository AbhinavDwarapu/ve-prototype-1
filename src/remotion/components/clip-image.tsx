import type { ComponentProps } from "react";
import { AbsoluteFill, Img } from "remotion";

export type ClipImageProps = ComponentProps<typeof Img>;

export function ClipImage({ style, ...rest }: ClipImageProps) {
  return (
    <AbsoluteFill>
      <Img
        {...rest}
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
          ...style,
        }}
      />
    </AbsoluteFill>
  );
}
