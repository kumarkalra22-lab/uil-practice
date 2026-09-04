import { openDB, type IDBPDatabase } from "idb";
import type { Session } from "../types";

const DB_NAME = "uil-practice";
const VERSION = 1;

let dbp: Promise<IDBPDatabase> | null = null;

function db() {
  if (!dbp) {
    dbp = openDB(DB_NAME, VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains("sessions")) {
          const s = d.createObjectStore("sessions", {
            keyPath: "id",
            autoIncrement: true,
          });
          s.createIndex("at", "at");
        }
        // Video and photo blobs live here, keyed by a string id held on the
        // session record. Kept separate so listing sessions never pulls
        // hundreds of megabytes into memory.
        if (!d.objectStoreNames.contains("media")) {
          d.createObjectStore("media");
        }
      },
    });
  }
  return dbp;
}

export async function listSessions(): Promise<Session[]> {
  const d = await db();
  const all = (await d.getAllFromIndex("sessions", "at")) as Session[];
  return all.reverse();
}

export async function addSession(s: Session): Promise<number> {
  const d = await db();
  return (await d.add("sessions", s)) as number;
}

export async function deleteSession(id: number, mediaId?: string) {
  const d = await db();
  await d.delete("sessions", id);
  if (mediaId) await d.delete("media", mediaId);
}

export async function putMedia(blob: Blob): Promise<string> {
  const d = await db();
  const id = `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await d.put("media", blob, id);
  return id;
}

export async function getMedia(id: string): Promise<Blob | undefined> {
  const d = await db();
  return (await d.get("media", id)) as Blob | undefined;
}

/** Rough total of stored media, so the Progress tab can warn before the quota bites. */
export async function mediaBytes(): Promise<number> {
  const d = await db();
  const all = (await d.getAll("media")) as Blob[];
  return all.reduce((t, b) => t + (b?.size || 0), 0);
}
