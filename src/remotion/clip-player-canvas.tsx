import {
  useMemo,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AbsoluteFill } from "remotion";
import type { Clip } from "@/stores/timeline/types";
import { ClipImage, ClipVideo } from "./components";
import {
  useClipLayoutInteraction,
  type ResizeCorner,
} from "./hooks/use-clip-layout-interaction";

const HANDLE_SIZE = 8;
const OUTLINE_COLOR = "#0B84F3";

function renderVisualClip(clip: Clip, src: string) {
  const mediaProps = {
    playbackRate: clip.playbackRate ?? 1,
    volume: clip.volume ?? 1,
    trimBefore: clip.trimBefore || undefined,
    trimAfter: clip.trimAfter || undefined,
  };

  switch (clip.kind) {
    case "video":
      return <ClipVideo src={src} {...mediaProps} />;
    case "image":
      return <ClipImage src={src} />;
    default:
      return null;
  }
}

type ResizeHandleProps = {
  corner: ResizeCorner;
  scale: number;
  onResizePointerDown: (
    corner: ResizeCorner,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => void;
};

function ResizeHandle({
  corner,
  scale,
  onResizePointerDown,
}: ResizeHandleProps) {
  const size = Math.round(HANDLE_SIZE / scale);
  const borderSize = 1 / scale;
  const margin = -size / 2 - borderSize;

  const sizeStyle: CSSProperties = useMemo(
    () => ({
      position: "absolute",
      height: size,
      width: size,
      backgroundColor: "white",
      border: `${borderSize}px solid ${OUTLINE_COLOR}`,
    }),
    [borderSize, size],
  );

  const style: CSSProperties = useMemo(() => {
    const cursorByCorner: Record<ResizeCorner, string> = {
      nw: "nwse-resize",
      ne: "nesw-resize",
      sw: "nesw-resize",
      se: "nwse-resize",
    };

    if (corner === "nw") {
      return {
        ...sizeStyle,
        marginLeft: margin,
        marginTop: margin,
        cursor: cursorByCorner.nw,
      };
    }
    if (corner === "ne") {
      return {
        ...sizeStyle,
        marginTop: margin,
        marginRight: margin,
        right: 0,
        cursor: cursorByCorner.ne,
      };
    }
    if (corner === "sw") {
      return {
        ...sizeStyle,
        marginBottom: margin,
        marginLeft: margin,
        bottom: 0,
        cursor: cursorByCorner.sw,
      };
    }
    return {
      ...sizeStyle,
      marginBottom: margin,
      marginRight: margin,
      right: 0,
      bottom: 0,
      cursor: cursorByCorner.se,
    };
  }, [corner, margin, sizeStyle]);

  return (
    <div
      role="presentation"
      style={style}
      onPointerDown={(e) => {
        e.stopPropagation();
        onResizePointerDown(corner, e);
      }}
    />
  );
}

export type ClipPlayerCanvasProps = {
  clip: Clip;
  assetSrc: string;
  durationInFrames: number;
  stackZIndex: number;
};

export function ClipPlayerCanvas({
  clip,
  assetSrc,
  durationInFrames,
  stackZIndex,
}: ClipPlayerCanvasProps) {
  const [hovered, setHovered] = useState(false);
  const {
    layout,
    scale,
    canEditLayout,
    showResizeHandles,
    isDragging,
    onWrapperPointerDown,
    onResizePointerDown,
  } = useClipLayoutInteraction({ clip, durationInFrames });

  const scaledBorder = Math.ceil(2 / scale);
  const wrapperZ = showResizeHandles ? 1000 + stackZIndex : stackZIndex;

  const showOutline =
    showResizeHandles || (canEditLayout && hovered && !isDragging);
  const outlineStyle = showOutline
    ? `${scaledBorder}px solid ${OUTLINE_COLOR}`
    : "none";

  return (
    <div
      style={{
        position: "absolute",
        left: layout.left,
        top: layout.top,
        width: layout.width,
        height: layout.height,
        overflow: "visible",
        zIndex: wrapperZ,
        outline: outlineStyle,
        outlineOffset: 0,
        userSelect: "none",
        touchAction: "none",
      }}
      onDragStart={(e) => {
        e.preventDefault();
      }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={onWrapperPointerDown}
    >
      <AbsoluteFill style={{ overflow: "hidden" }}>
        {renderVisualClip(clip, assetSrc)}
      </AbsoluteFill>
      {showResizeHandles ? (
        <>
          <ResizeHandle
            corner="nw"
            scale={scale}
            onResizePointerDown={onResizePointerDown}
          />
          <ResizeHandle
            corner="ne"
            scale={scale}
            onResizePointerDown={onResizePointerDown}
          />
          <ResizeHandle
            corner="sw"
            scale={scale}
            onResizePointerDown={onResizePointerDown}
          />
          <ResizeHandle
            corner="se"
            scale={scale}
            onResizePointerDown={onResizePointerDown}
          />
        </>
      ) : null}
    </div>
  );
}
