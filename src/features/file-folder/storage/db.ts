import { openDB, type DBSchema } from "idb";
import type {
  FileFolderMode,
  FileSystemDirectoryHandleLike,
  PersistedFileFolderAsset,
} from "../types";
import {
  ASSETS_STORE,
  DB_NAME,
  DB_VERSION,
  PROJECT_FOLDER_KEY,
  PROJECT_FOLDER_STORE,
} from "./constants";

type ProjectFolderRecord = {
  id: typeof PROJECT_FOLDER_KEY;
  handle: FileSystemDirectoryHandleLike;
};

type FileFolderDb = DBSchema & {
  [ASSETS_STORE]: {
    key: string;
    value: PersistedFileFolderAsset;
    indexes: {
      "by-mode": FileFolderMode;
    };
  };
  [PROJECT_FOLDER_STORE]: {
    key: typeof PROJECT_FOLDER_KEY;
    value: ProjectFolderRecord;
  };
};

export async function getDb() {
  return openDB<FileFolderDb>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        const assetsStore = db.createObjectStore(ASSETS_STORE, {
          keyPath: "id",
        });
        assetsStore.createIndex("by-mode", "mode");
      }

      if (!db.objectStoreNames.contains(PROJECT_FOLDER_STORE)) {
        db.createObjectStore(PROJECT_FOLDER_STORE, { keyPath: "id" });
      }
    },
  });
}
