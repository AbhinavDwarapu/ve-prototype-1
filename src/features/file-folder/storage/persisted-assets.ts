import type { StorageEstimate } from "../types";
import { ASSETS_STORE } from "./constants";
import { getDb } from "./db";
import { materializeAssets } from "./file-assets";

export async function getStorageEstimate(): Promise<StorageEstimate> {
  const estimate = await navigator.storage?.estimate?.();
  return {
    usage: estimate?.usage ?? null,
    quota: estimate?.quota ?? null,
  };
}

export async function loadPersistedAssets() {
  const db = await getDb();
  const assets = await db.getAll(ASSETS_STORE);
  return materializeAssets(assets);
}
