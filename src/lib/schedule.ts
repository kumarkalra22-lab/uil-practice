import type { Session } from "../types";

export type PlanKind = "writing" | "story";

const DAY_MS = 86400000;

function dayNumber(d: Date): number {
  return Math.floor(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS
  );
}

/** Deterministic alternation — no storage needed, stable across reloads. */
export function planFor(date: Date): PlanKind {
  return dayNumber(date) % 2 === 0 ? "writing" : "story";
}

export interface PlanDay {
  date: Date;
  kind: PlanKind;
}

/** Inclusive day-by-day plan from `from` through `to`. */
export function planRange(from: Date, to: Date): PlanDay[] {
  const out: PlanDay[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  for (let d = start; d <= end; d = new Date(d.getTime() + DAY_MS)) {
    out.push({ date: d, kind: planFor(d) });
  }
  return out;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** How many days in the range already have a matching-type session saved. */
export function daysDone(sessions: Session[], from: Date, to: Date): number {
  const range = planRange(from, to);
  return range.filter((day) =>
    sessions.some(
      (s) => s.type === day.kind && sameDay(new Date(s.at), day.date)
    )
  ).length;
}
