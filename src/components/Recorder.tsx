import { useEffect, useRef, useState } from "react";
import { putMedia } from "../lib/db";

/**
 * Codec order matters. Chrome and Firefox take WebM/VP9; Safari (desktop and
 * iOS 14.3+) only takes MP4/H.264 and will throw on a WebM mime string.
 * Passing no mimeType at all is the last resort — the browser picks, and the
 * blob is still playable in that same browser, which is all we need.
 */
const CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=h264,aac",
  "video/mp4",
];

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return CANDIDATES.find((m) => {
    try {
      return MediaRecorder.isTypeSupported(m);
    } catch {
      return false;
    }
  });
}

type Props = {
  /** Called once the recording is stored, with its IndexedDB key. */
  onSaved: (mediaId: string, seconds: number) => void;
};

export default function Recorder({ onSaved }: Props) {
  const [state, setState] = useState<"idle" | "live" | "recording" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startCamera() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "This browser will not give the page a camera. Record on your phone's camera app instead — the scoring still works."
      );
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play().catch(() => undefined);
      }
      setState("live");
    } catch (e: unknown) {
      const name = (e as { name?: string })?.name;
      if (name === "NotAllowedError") {
        setError("Camera permission was refused. Allow it in the address bar, then try again.");
      } else if (window.isSecureContext === false) {
        setError(
          "The camera only works over https or on localhost. If you are testing from your phone on the LAN, use a tunnel or run the dev server with --https."
        );
      } else {
        setError("Could not open the camera. Use your phone's camera app instead.");
      }
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mimeType = pickMime();
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      rec = new MediaRecorder(stream);
    }
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = async () => {
      const blob = new Blob(chunksRef.current, {
        type: rec.mimeType || "video/webm",
      });
      const id = await putMedia(blob);
      const url = URL.createObjectURL(blob);
      setPlaybackUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setState("done");
      onSaved(id, seconds);
    };
    rec.start(1000);
    recRef.current = rec;
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    setState("recording");
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    recRef.current?.stop();
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="recorder">
      {error && <div className="warn">{error}</div>}

      {state !== "idle" && (
        <video
          ref={videoRef}
          playsInline
          className="preview"
          aria-label={state === "done" ? "Recorded performance" : "Camera preview"}
        />
      )}

      <div className="btnrow">
        {state === "idle" && (
          <button className="b ghost" onClick={startCamera}>
            Turn on the camera
          </button>
        )}
        {state === "live" && (
          <button className="b gold" onClick={startRecording}>
            Start recording
          </button>
        )}
        {state === "recording" && (
          <>
            <span className="rec">
              <i /> {mm}:{ss}
            </span>
            <button className="b" onClick={stopRecording}>
              Stop
            </button>
          </>
        )}
        {state === "done" && <span className="okline">Saved with this session.</span>}
      </div>

      {state === "idle" && !error && (
        <p className="hint">
          Optional, but worth it — posture, eye contact and gestures are three of the nine things
          judges score, and none of them survive an audio recording.
        </p>
      )}
    </div>
  );
}
