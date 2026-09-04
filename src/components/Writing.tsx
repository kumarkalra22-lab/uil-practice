import { useEffect, useRef, useState } from "react";
import Scale from "./Scale";
import { drawPrompt } from "../lib/prompt";
import { WRITING_AREAS } from "../data/criteria";
import { putMedia } from "../lib/db";
import type { Picture, WritingSession } from "../types";

const CONTEST_SECONDS = 30 * 60;

type Props = { onSave: (s: WritingSession) => void };

export default function Writing({ onSave }: Props) {
  const [prompt, setPrompt] = useState<Picture[]>(() => drawPrompt());
  const [phase, setPhase] = useState<"setup" | "running" | "score">("setup");
  const [left, setLeft] = useState(CONTEST_SECONDS);
  const [paused, setPaused] = useState(false);
  const [creativity, setCreativity] = useState(0);
  const [organization, setOrganization] = useState(0);
  const [style, setStyle] = useState(0);
  const [note, setNote] = useState("");
  const [mediaId, setMediaId] = useState<string | undefined>();
  const [photoName, setPhotoName] = useState<string | null>(null);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "running" || paused) return;
    tick.current = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          if (tick.current) window.clearInterval(tick.current);
          setPhase("score");
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [phase, paused]);

  // Keep the screen awake during the 30 minutes if the browser allows it.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    if (phase === "running" && "wakeLock" in navigator) {
      (navigator as Navigator & { wakeLock: { request: (t: string) => Promise<WakeLockSentinel> } }).wakeLock
        .request("screen")
        .then(
          (l: WakeLockSentinel) => (lock = l),
          () => undefined
        );
    }
    return () => {
      lock?.release().catch(() => undefined);
    };
  }, [phase]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const warn = left <= 60 ? 2 : left <= 300 ? 1 : 0;
  const total = creativity + organization + style;

  function reset() {
    setPhase("setup");
    setLeft(CONTEST_SECONDS);
    setPaused(false);
    setCreativity(0);
    setOrganization(0);
    setStyle(0);
    setNote("");
    setMediaId(undefined);
    setPhotoName(null);
    setPrompt(drawPrompt());
  }

  async function attachPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const id = await putMedia(f);
    setMediaId(id);
    setPhotoName(f.name);
  }

  function save() {
    onSave({
      type: "writing",
      at: Date.now(),
      creativity,
      organization,
      style,
      total,
      note,
      mediaId,
      prompt: prompt.map((p) => p.caption),
    });
    reset();
  }

  return (
    <>
      <section className="card">
        <h2>Prompt page</h2>
        <p className="sub">
          One story, using at least one of these. Not all six have to appear. Paper and pencil — the
          contest is handwritten, so the practice has to be too.
        </p>
        <div className="grid6">
          {prompt.map((p, i) => (
            <div className="pic" key={i}>
              <div className="em" aria-hidden="true">
                {p.emoji}
              </div>
              <div className="cap">{p.caption}</div>
            </div>
          ))}
        </div>
        {phase === "setup" && (
          <div className="btnrow">
            <button className="b gold" onClick={() => setPhase("running")}>
              Start 30 minutes
            </button>
            <button className="b ghost" onClick={() => setPrompt(drawPrompt())}>
              Different pictures
            </button>
          </div>
        )}
      </section>

      {phase === "running" && (
        <section className="clock" data-warn={warn}>
          <div className="n">
            {mm}:{ss}
          </div>
          <div className="l">
            {warn === 2
              ? "Finish the ending now"
              : warn === 1
                ? "Five minutes left"
                : "Writing time"}
          </div>
          <div className="btnrow center">
            <button className="b onDark" onClick={() => setPaused((p) => !p)}>
              {paused ? "Resume" : "Pause"}
            </button>
            <button className="b gold" onClick={() => setPhase("score")}>
              She's finished
            </button>
          </div>
        </section>
      )}

      {phase === "score" && (
        <section className="card">
          <h2>Score it</h2>
          <p className="sub">
            The real UIL scale, 20 points. Read her story all the way through once before you touch
            a number, and say what worked before you say what didn't.
          </p>

          {WRITING_AREAS.map((a) => {
            const value =
              a.key === "creativity" ? creativity : a.key === "organization" ? organization : style;
            const set =
              a.key === "creativity"
                ? setCreativity
                : a.key === "organization"
                  ? setOrganization
                  : setStyle;
            return (
              <div className="field" key={a.key}>
                <div className="lab">
                  {a.label} — {a.weight}
                </div>
                <div className="hint">{a.hint}</div>
                <Scale max={a.max} value={value} onChange={set} label={a.label} />
              </div>
            );
          })}

          <div className="field">
            <div className="lab">Photograph her page</div>
            <div className="hint">
              Optional. Useful in week six when you want to see whether anything actually changed.
            </div>
            <input type="file" accept="image/*" capture="environment" onChange={attachPhoto} />
            {photoName && <div className="okline">Attached: {photoName}</div>}
          </div>

          <div className="field">
            <div className="lab">One thing to work on next time</div>
            <div className="hint">One. Not three.</div>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="btnrow">
            <button className="b" disabled={!creativity} onClick={save}>
              Save — {total}/20
            </button>
            <button className="b ghost" onClick={reset}>
              Discard
            </button>
          </div>
        </section>
      )}
    </>
  );
}
