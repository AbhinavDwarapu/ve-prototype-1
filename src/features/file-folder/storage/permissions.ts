import type { FileSystemHandleLike } from "../types";

export async function ensureHandlePermission(
  handle: FileSystemHandleLike | undefined,
  mode: "read" | "readwrite" = "read",
) {
  if (!handle) return false;
  if (!handle.queryPermission && !handle.requestPermission) return true;

  const descriptor = { mode };
  const queried = await handle.queryPermission?.(descriptor);
  if (queried === "granted") {
    return true;
  }

  if (!handle.requestPermission) {
    return queried !== "denied";
  }

  return (await handle.requestPermission(descriptor)) === "granted";
}
