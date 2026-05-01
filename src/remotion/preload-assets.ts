import { prefetch } from "remotion";
import type { Asset } from "@/stores/timeline/types";

type PrefetchableAsset = Pick<Asset, "src" | "type">;

export type TimelineAssetPrefetch = {
  waitUntilDone: () => Promise<void>;
  free: () => void;
};

function isPrefetchableAsset(asset: PrefetchableAsset) {
  return (
    asset.src.length > 0 &&
    (asset.type === "audio" || asset.type === "image" || asset.type === "video")
  );
}

export function prefetchTimelineAssets(
  assets: PrefetchableAsset[],
): TimelineAssetPrefetch {
  const prefetchedAssets = new Map<string, ReturnType<typeof prefetch>>();

  for (const asset of assets) {
    if (!isPrefetchableAsset(asset) || prefetchedAssets.has(asset.src)) {
      continue;
    }

    prefetchedAssets.set(asset.src, prefetch(asset.src, { method: "blob-url" }));
  }

  return {
    waitUntilDone: async () => {
      await Promise.all(
        [...prefetchedAssets.values()].map(({ waitUntilDone }) =>
          waitUntilDone(),
        ),
      );
    },
    free: () => {
      for (const prefetchedAsset of prefetchedAssets.values()) {
        prefetchedAsset.free();
      }
    },
  };
}
