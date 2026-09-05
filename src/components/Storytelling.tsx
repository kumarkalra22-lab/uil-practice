import { useMemo, useState } from "react";
import Recorder from "./Recorder";
import { STORIES } from "../data/stories";
import { STORY_CRITERIA } from "../data/criteria";
import { wordCount } from "../lib/prompt";
import type { StorySession } from "../types";

type Props = { onSave: (s: StorySession) => void };

export default function Storytelling({ onSave }: Props) {
  const [phase, setPhase] = useState<"pick" | "read" | "perform" | "score">("pick");
  const [selected, setSelected] = useState<string>(STORIES[0].id);
  const [customTitle, setCustomTitle] = useState("");
  const [customText, setCustomText] = useState("");
  const [beats, setBeats] = useState<Record<number, boolean>>({});
  const [marks, setMarks] = useState<Record<number, boolean>>({});
  const [note, setNote] = useState("");
  const [mediaId, setMediaId] = useState<string | undefined>();

  const story = useMemo(() => {
    if (selected === "custom")
      return {
        id: "custom",
        title: customTitle.trim() || "Your story",
        text: customText,
        beats: [] as string[],
      };
    return STORIES.find((s) => s.id === selected)!;
  }, [selected, customTitle, customText]);

  const wc = wordCount(story.text || "");
  const inRange = wc >= 600 && wc <= 1100;
  const yes = Object.values(marks).filter(Boolean).length;
  const answered = Object.keys(marks).length;

  function reset() {
    setPhase("pick");
    setBeats({});
    setMarks({});
    setNote("");
    setMediaId(undefined);
  }

  function save() {
    onSave({
      type: "story",
      at: Date.now(),
      title: story.title,
      marks,
      yes,
      beatsHit: Object.values(beats).filter(Boolean).length,
      beatsTotal: story.beats.length,
      note,
      mediaId,
    });
    reset();
  }

  if (phase === "pick")
    return (
      <>
        <section className="card focus">
          <div className="k">What do I do?</div>
          <div className="v">
            A grown-up reads you a story one time. Then it's your turn — stand up and tell the story
            back in your own words. No notes, no reading, no time limit.
          </div>
        </section>

        <section className="card">
        <h2>Pick a story</h2>
        <p className="sub">
          You read it aloud once. She never sees the text. Then she retells it in her own words,
          standing, no notes, no props, no time limit.
        </p>

        <div className="storylist">
          {STORIES.map((s) => (
            <button
              key={s.id}
              data-on={selected === s.id ? 1 : 0}
              onClick={() => setSelected(s.id)}
            >
              <div className="t">{s.title}</div>
              <div className="pills">
                <span className="pill">{wordCount(s.text)} words</span>
                <span className="pill">{s.beats.length} plot beats</span>
              </div>
            </button>
          ))}
          <button data-on={selected === "custom" ? 1 : 0} onClick={() => setSelected("custom")}>
            <div className="t">Your own story</div>
            <div className="pills">
              <span className="pill">Contest range is 600–1100 words</span>
            </div>
          </button>
        </div>

        {selected === "custom" && (
          <div className="field">
            <input
              type="text"
              placeholder="Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            <textarea
              rows={8}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste a story here. Project Gutenberg is the obvious source — Grimm and Andersen tales land in range most often, and most Aesop fables are far too short."
            />
            <div className={inRange ? "okline" : "badline"}>
              {wc} words — {inRange ? "in contest range" : "outside the 600–1100 range"}
            </div>
          </div>
        )}

        <div className="btnrow">
          <button className="b gold" disabled={!story.text} onClick={() => setPhase("read")}>
            Open the reading screen
          </button>
        </div>
        </section>
      </>
    );

  if (phase === "read")
    return (
      <section className="card">
        <div className="warn">
          Your screen only — turn it away from her. Read this aloud once at a normal pace, then move
          on. No second reading. That is the actual contest rule, and practising with two readings
          makes the practice worthless.
        </div>
        <h2 className="serif big">{story.title}</h2>
        <div className="story">
          {story.text.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="btnrow">
          <button className="b gold" onClick={() => setPhase("perform")}>
            Done reading — her turn
          </button>
          <button className="b ghost" onClick={reset}>
            Back
          </button>
        </div>
      </section>
    );

  if (phase === "perform")
    return (
      <section className="card">
        <h2>Her turn</h2>
        <p className="sub">
          Sit far enough away that she has to project. If anyone else is home, put them in the room —
          an audience is most of the event.
        </p>

        <Recorder onSaved={(id) => setMediaId(id)} />

        {story.beats.length > 0 && (
          <div className="field">
            <div className="lab">Plot beats she hit</div>
            <div className="hint">
              Tick these while she talks. Low weight on purpose — judges score delivery, not recall.
            </div>
            <div className="beats">
              {story.beats.map((b, i) => (
                <button
                  className="beat"
                  key={i}
                  data-on={beats[i] ? 1 : 0}
                  onClick={() => setBeats((o) => ({ ...o, [i]: !o[i] }))}
                >
                  <i aria-hidden="true" />
                  <span>{b}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="btnrow">
          <button className="b gold" onClick={() => setPhase("score")}>
            She's finished — score it
          </button>
        </div>
      </section>
    );

  return (
    <section className="card">
      <h2>Score it</h2>
      <p className="sub">
        The nine questions on the real UIL evaluation sheet. All nine carry equal weight, and not one
        of them asks whether she got the story right.
      </p>

      {STORY_CRITERIA.map((c, i) => (
        <div className="yn" key={i}>
          <span>{c}</span>
          <div className="pair">
            <button
              data-on={marks[i] === true ? "y" : ""}
              onClick={() => setMarks((o) => ({ ...o, [i]: true }))}
            >
              Yes
            </button>
            <button
              data-on={marks[i] === false ? "n" : ""}
              onClick={() => setMarks((o) => ({ ...o, [i]: false }))}
            >
              No
            </button>
          </div>
        </div>
      ))}

      <div className="field">
        <div className="lab">One thing to work on next time</div>
        <div className="hint">
          Watch the recording together first, then pick a single "No" and only that one.
        </div>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      <div className="btnrow">
        <button className="b" disabled={answered < 9} onClick={save}>
          Save — {yes}/9
        </button>
        <button className="b ghost" onClick={reset}>
          Discard
        </button>
      </div>
    </section>
  );
}
