import { useEffect, useMemo, useState } from "react";
import { STORY_CRITERIA } from "../data/criteria";
import { getMedia, mediaBytes } from "../lib/db";
import type { Session, StorySession, WritingSession } from "../types";

type Props = { sessions: Session[]; onDelete: (id: number, mediaId?: string) => void };

export default function Progress({ sessions, onDelete }: Props) {
  const writing = sessions.filter((s): s is WritingSession => s.type === "writing");
  const story = sessions.filter((s): s is StorySession => s.type === "story");
  const [bytes, setBytes] = useState(0);
  const [openMedia, setOpenMedia] = useState<{ id: string; url: string } | null>(null);

  useEffect(() => {
    mediaBytes().then(setBytes);
  }, [sessions.length]);

  useEffect(() => {
    return () => {
      if (openMedia) URL.revokeObjectURL(openMedia.url);
    };
  }, [openMedia]);

  async function show(id: string) {
    if (openMedia?.id === id) {
      URL.revokeObjectURL(openMedia.url);
      setOpenMedia(null);
      return;
    }
    const blob = await getMedia(id);
    if (!blob) return;
    setOpenMedia({ id, url: URL.createObjectURL(blob) });
  }

  /** The criterion she misses most often — the one thing to drill next. */
  const storyWeak = useMemo(() => {
    if (!story.length) return null;
    const counts = STORY_CRITERIA.map((c, i) => ({
      c,
      n: story.filter((s) => s.marks?.[i] === false).length,
    }));
    counts.sort((a, b) => b.n - a.n);
    return counts[0].n > 0 ? counts[0] : null;
  }, [story]);

  /** The weighted area where she is losing the largest share of available points. */
  const writingWeak = useMemo(() => {
    if (!writing.length) return null;
    const avg = (pick: (s: WritingSession) => number, max: number) =>
      writing.reduce((t, s) => t + pick(s), 0) / writing.length / max;
    const parts = [
      { c: "creativity and interest", p: avg((s) => s.creativity, 12) },
      { c: "organization", p: avg((s) => s.organization, 6) },
      { c: "correctness of style", p: avg((s) => s.style, 2) },
    ];
    parts.sort((a, b) => a.p - b.p);
    return parts[0];
  }, [writing]);

  if (!sessions.length)
    return (
      <section className="card empty">
        Nothing saved yet. Run a session in either tab and it lands here with a running score, so you
        can see whether six weeks of practice is actually moving anything — or whether you are just
        doing reps.
      </section>
    );

  return (
    <>
      {(storyWeak || writingWeak) && (
        <section className="card focus">
          <div className="k">Work on this next</div>
          {storyWeak && (
            <div className="v">
              Storytelling: {storyWeak.c.toLowerCase()} — marked no in {storyWeak.n} of{" "}
              {story.length} runs.
            </div>
          )}
          {writingWeak && (
            <div className="v">
              Writing: {writingWeak.c}, averaging {Math.round(writingWeak.p * 100)}% of the points
              available there.
            </div>
          )}
        </section>
      )}

      {writing.length > 0 && (
        <section className="card">
          <h2>Creative Writing — {writing.length} sessions</h2>
          <p className="sub">Out of 20. Creativity alone is 12 of those points.</p>
          {writing.map((s) => (
            <article className="log" key={s.id}>
              <div className="row">
                <div className="d">{new Date(s.at).toLocaleDateString()}</div>
                <div className="num">{s.total}/20</div>
              </div>
              <div className="bar">
                <i style={{ width: `${(s.total / 20) * 100}%` }} />
              </div>
              <div className="d spaced">
                Creativity {s.creativity}/12 · Organization {s.organization}/6 · Style {s.style}/2
              </div>
              {s.note && <div className="notes">{s.note}</div>}
              <div className="logactions">
                {s.mediaId && (
                  <button className="link" onClick={() => show(s.mediaId!)}>
                    {openMedia?.id === s.mediaId ? "Hide page" : "See her page"}
                  </button>
                )}
                <button className="link warnlink" onClick={() => onDelete(s.id!, s.mediaId)}>
                  Delete
                </button>
              </div>
              {openMedia?.id === s.mediaId && (
                <img className="shot" src={openMedia!.url} alt="Handwritten page" />
              )}
            </article>
          ))}
        </section>
      )}

      {story.length > 0 && (
        <section className="card">
          <h2>Storytelling — {story.length} sessions</h2>
          <p className="sub">Out of 9. Every criterion carries the same weight.</p>
          {story.map((s) => (
            <article className="log" key={s.id}>
              <div className="row">
                <div className="d">
                  {new Date(s.at).toLocaleDateString()} · {s.title}
                </div>
                <div className="num">{s.yes}/9</div>
              </div>
              <div className="bar">
                <i style={{ width: `${(s.yes / 9) * 100}%` }} />
              </div>
              {s.beatsTotal > 0 && (
                <div className="d spaced">
                  Plot beats {s.beatsHit}/{s.beatsTotal}
                </div>
              )}
              {s.note && <div className="notes">{s.note}</div>}
              <div className="logactions">
                {s.mediaId && (
                  <button className="link" onClick={() => show(s.mediaId!)}>
                    {openMedia?.id === s.mediaId ? "Hide recording" : "Watch it back"}
                  </button>
                )}
                <button className="link warnlink" onClick={() => onDelete(s.id!, s.mediaId)}>
                  Delete
                </button>
              </div>
              {openMedia?.id === s.mediaId && (
                <video className="shot" src={openMedia!.url} controls playsInline />
              )}
            </article>
          ))}
        </section>
      )}

      {bytes > 0 && (
        <p className="storage">
          {(bytes / 1048576).toFixed(0)} MB of recordings stored on this device. Delete old sessions
          once you have watched them — video fills a phone quickly.
        </p>
      )}
    </>
  );
}
