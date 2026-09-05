import { DATES, daysUntil } from "../App";
import { planFor, daysDone } from "../lib/schedule";
import type { Session } from "../types";

type Props = { sessions: Session[]; setTab: (t: "writing" | "story") => void };

const BLURB = {
  writing: {
    heading: "Today is a Creative Writing day",
    body: "You'll get some pictures. Pick at least one and write a story about it. You have 30 minutes. Nobody helps you spell — just write the best story you can.",
    cta: "Go write",
  },
  story: {
    heading: "Today is a Storytelling day",
    body: "A grown-up reads you a story one time. Then it's your turn — stand up and tell the story back in your own words. No notes, no reading, no time limit.",
    cta: "Go tell a story",
  },
} as const;

export default function Today({ sessions, setTab }: Props) {
  const today = new Date();
  const kind = planFor(today);
  const blurb = BLURB[kind];

  const lastDay = DATES.story > DATES.writing ? DATES.story : DATES.writing;
  const done = daysDone(sessions, today, lastDay);
  const total = Math.round((lastDay.getTime() - today.getTime()) / 86400000) + 1;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const dW = daysUntil(DATES.writing);
  const dS = daysUntil(DATES.story);

  return (
    <>
      <section className="card focus">
        <h2>{blurb.heading}</h2>
        <p className="sub">{blurb.body}</p>
        <div className="btnrow">
          <button className="b gold" onClick={() => setTab(kind)}>
            {blurb.cta}
          </button>
        </div>
      </section>

      <section className="card">
        <h2>Plan progress</h2>
        <p className="sub">
          One day Creative Writing, one day Storytelling, every day between now and the contests.
        </p>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="d spaced">
          {done} of {total} practice days done · Creative Writing{" "}
          {dW > 0 ? `in ${dW} days` : dW === 0 ? "today" : "done"} · Storytelling{" "}
          {dS > 0 ? `in ${dS} days` : dS === 0 ? "today" : "done"}
        </div>
      </section>
    </>
  );
}
