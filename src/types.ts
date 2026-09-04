export type SessionType = "writing" | "story";

export interface WritingSession {
  id?: number;
  type: "writing";
  at: number;
  /** Creativity & interest, out of 12 (60%) */
  creativity: number;
  /** Organization, out of 6 (30%) */
  organization: number;
  /** Correctness of style, out of 2 (10%) */
  style: number;
  total: number;
  prompt: string[];
  note: string;
  /** IndexedDB key of a photo of her handwritten page, if attached */
  mediaId?: string;
}

export interface StorySession {
  id?: number;
  type: "story";
  at: number;
  title: string;
  /** index -> true (yes) / false (no) against the nine UIL criteria */
  marks: Record<number, boolean>;
  yes: number;
  beatsHit: number;
  beatsTotal: number;
  note: string;
  /** IndexedDB key of the recorded video, if any */
  mediaId?: string;
}

export type Session = WritingSession | StorySession;

export interface Picture {
  emoji: string;
  caption: string;
  group: "who" | "thing" | "place" | "event";
}

export interface Story {
  id: string;
  title: string;
  text: string;
  beats: string[];
}
