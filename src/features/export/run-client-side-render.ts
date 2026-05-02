import type {
  CanRenderIssue,
  RenderMediaOnWebProgress,
} from "@remotion/web-renderer";
import { MyComposition } from "@/remotion/Composition";
import { getDurationInFrames } from "@/stores/composition-settings/defaults";
import { useCompositionSettingsStore } from "@/stores/composition-settings/store";

const COMPOSITION_ID = "Empty";

export class ClientSideRenderPreflightError extends Error {
  readonly issues: CanRenderIssue[];

  constructor(issues: CanRenderIssue[]) {
    const blocking = issues
      .filter((i) => i.severity === "error")
      .map((i) => i.message)
      .join("\n");
    super(blocking || "This browser cannot export video with the current settings.");
    this.name = "ClientSideRenderPreflightError";
    this.issues = issues;
  }
}

/** H.264 in MP4 requires even width and height. */
export function ensureEvenDimensions(width: number, height: number): {
  width: number;
  height: number;
} {
  return {
    width: width % 2 === 0 ? width : width - 1,
    height: height % 2 === 0 ? height : height - 1,
  };
}

export type RunClientSideRenderOptions = {
  onProgress?: (progress: RenderMediaOnWebProgress) => void;
  signal?: AbortSignal | null;
};

export async function runClientSideRender(
  options: RunClientSideRenderOptions = {},
): Promise<Blob> {
  const { canRenderMediaOnWeb, renderMediaOnWeb } = await import(
    "@remotion/web-renderer"
  );

  const { fps, durationSec, width, height } =
    useCompositionSettingsStore.getState();
  const { width: w, height: h } = ensureEvenDimensions(width, height);

  const preflight = await canRenderMediaOnWeb({
    width: w,
    height: h,
    container: "mp4",
  });

  if (!preflight.canRender) {
    throw new ClientSideRenderPreflightError(preflight.issues);
  }

  const durationInFrames = getDurationInFrames(fps, durationSec);

  const { getBlob } = await renderMediaOnWeb({
    composition: {
      id: COMPOSITION_ID,
      component: MyComposition,
      durationInFrames,
      fps,
      width: w,
      height: h,
    },
    container: "mp4",
    onProgress: options.onProgress ?? null,
    signal: options.signal ?? null,
  });

  return getBlob();
}
