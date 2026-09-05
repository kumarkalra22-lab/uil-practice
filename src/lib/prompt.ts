import { PICTURES } from "../data/pictures";
import { OFFICIAL_PROMPTS } from "../data/officialPrompts";
import type { Picture } from "../types";

function take(pool: Picture[], n: number, used: Set<string>): Picture[] {
  const avail = pool.filter((p) => !used.has(p.caption));
  const out: Picture[] = [];
  for (let i = 0; i < n && avail.length; i++) {
    const j = Math.floor(Math.random() * avail.length);
    out.push(avail[j]);
    used.add(avail[j].caption);
    avail.splice(j, 1);
  }
  return out;
}

/**
 * Six captioned pictures: two characters, two objects, one place, one event.
 * The balance is deliberate — a page of six random items often draws nothing
 * a child can build a plot out of.
 */
export function drawPrompt(): Picture[] {
  const used = new Set<string>();
  const by = (g: Picture["group"]) => PICTURES.filter((p) => p.group === g);
  const out = [
    ...take(by("who"), 2, used),
    ...take(by("thing"), 2, used),
    ...take(by("place"), 1, used),
    ...take(by("event"), 1, used),
  ];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const wordCount = (t: string) => (t.trim().match(/\S+/g) || []).length;

/**
 * One of the 9 real past-contest picture pages, in order. Cycles rather than
 * draws randomly so a practice session can work through all of them.
 */
export function pickOfficialPrompt(i: number) {
  const page = OFFICIAL_PROMPTS[i % OFFICIAL_PROMPTS.length];
  return { items: page.items, label: `${page.year} · ${page.round}` };
}

export const OFFICIAL_PROMPT_COUNT = OFFICIAL_PROMPTS.length;
