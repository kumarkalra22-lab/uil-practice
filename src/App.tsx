import { useEffect, useState } from "react";
import Writing from "./components/Writing";
import Storytelling from "./components/Storytelling";
import Progress from "./components/Progress";
import { addSession, deleteSession, listSessions } from "./lib/db";
import type { Session } from "./types";

/** Contest dates. Change these once and the countdown follows. */
const DATES = {
  writing: new Date(2026, 9, 20), // 20 Oct 2026
  story: new Date(2026, 9, 22), // 22 Oct 2026
};

function daysUntil(d: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

type Tab = "writing" | "story" | "progress";

export default function App() {
  const [tab, setTab] = useState<Tab>("writing");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listSessions().then((s) => {
      setSessions(s);
      setReady(true);
    });
  }, []);

  async function save(s: Session) {
    const id = await addSession(s);
    setSessions((cur) => [{ ...s, id }, ...cur]);
    setTab("progress");
  }

  async function remove(id: number, mediaId?: string) {
    await deleteSession(id, mediaId);
    setSessions((cur) => cur.filter((s) => s.id !== id));
  }

  const dW = daysUntil(DATES.writing);
  const dS = daysUntil(DATES.story);

  return (
    <div className="app">
      <header className="top">
        <div className="wrap">
          <div className="brandrow">
            <h1 className="serif">UIL Practice</h1>
            <div className="count">
              <span>
                Creative Writing <b>{dW > 0 ? `${dW} days` : dW === 0 ? "today" : "done"}</b>
              </span>
              <span>
                Storytelling <b>{dS > 0 ? `${dS} days` : dS === 0 ? "today" : "done"}</b>
              </span>
            </div>
          </div>
          <nav>
            <button data-on={tab === "writing" ? 1 : 0} onClick={() => setTab("writing")}>
              Creative Writing
            </button>
            <button data-on={tab === "story" ? 1 : 0} onClick={() => setTab("story")}>
              Storytelling
            </button>
            <button data-on={tab === "progress" ? 1 : 0} onClick={() => setTab("progress")}>
              Progress
            </button>
          </nav>
        </div>
      </header>

      <main className="wrap">
        {!ready && <section className="card empty">Opening the practice log…</section>}
        {ready && tab === "writing" && <Writing onSave={save} />}
        {ready && tab === "story" && <Storytelling onSave={save} />}
        {ready && tab === "progress" && <Progress sessions={sessions} onDelete={remove} />}
      </main>
    </div>
  );
}
