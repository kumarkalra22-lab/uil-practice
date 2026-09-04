# UIL Practice

An installable offline PWA for practising two UIL A+ Academics elementary events:
**Creative Writing** (grade 2 only) and **Storytelling** (grades 2–3).

Everything stays on the device. No accounts, no backend, no analytics, no network
calls at all after the first load. That is deliberate: the user is seven years old,
and the cleanest way to stay clear of COPPA is to never collect anything.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview
```

## Deploy

Any static host. Vercel and Netlify both work with zero config — build command
`npm run build`, output directory `dist`.

If you deploy to a GitHub Pages **project** site (`user.github.io/repo-name/`),
set `base: "/repo-name/"` in `vite.config.ts` and `start_url` to match, or the
service worker will 404.

## Installing it on her iPad or your phone

Open the deployed URL, then Share → Add to Home Screen. It runs full screen and
works with no signal, which matters because the best practice slot is usually the
car.

## The camera

The Storytelling tab records video with `getUserMedia` + `MediaRecorder`.
Two things to know:

1. **It needs a secure context.** `https://` or `localhost`. A LAN IP like
   `192.168.1.x` will not get camera permission — if you want to test from a
   phone against the dev server, use a tunnel (`npx localtunnel --port 5173`)
   or deploy it.
2. **Codecs differ.** Chrome and Firefox record WebM/VP9; Safari and iOS record
   MP4/H.264. `src/components/Recorder.tsx` probes for a supported type and falls
   back cleanly. A recording made in one browser may not play in another, so
   record and review on the same device.

If the camera is unavailable for any reason, the app says so and the scoring
still works — record on the phone's own camera app instead.

## Storage

Sessions and media go into IndexedDB (`uil-practice`), in two stores so that
listing sessions never pulls video into memory. Video is large: budget roughly
10 MB per minute at 720p. The Progress tab shows the running total and every
session has a Delete. Clearing site data wipes everything, so if a recording
matters, save it out of the app.

## What the scoring is based on

**Creative Writing**, elementary — three weighted areas, 20 points:

| Area | Weight | Points |
|---|---|---|
| Creativity and interest | 60% | 12 |
| Organization | 30% | 6 |
| Correctness of style | 10% | 2 |

Contestants get a page of captioned pictures and write a story by hand in 30
minutes, using at least one pictured item. Spelling and grammar are 10% of the
score — resist the urge to coach there, because correcting a seven-year-old's
spelling makes her write safer, duller stories, and that costs you the 60%.

**Storytelling**, grades 2–3 — nine yes/no criteria, all of equal weight:

1. Communicated effectively with the audience
2. Commanded attention
3. Told the story with ease
4. Showed enthusiasm
5. Used facial expressions, vocal variety, characterization
6. Made good eye contact
7. Used good posture
8. Spoke clearly
9. Used gestures effectively

Note what is missing: **nothing on the sheet asks whether she remembered the
story correctly.** Judges are ranking a performance. The plot-beat checklist in
the app exists to tell you whether she had enough material to work with, not to
be optimised.

A story is read aloud to her **once**. She then retells it in her own words —
standing, no notes, no props, no time limit. Stories run 600–1100 words.

## Adding stories

`src/data/stories.ts` ships three original stories (663, 687 and 622 words) so
there is no licensing question. To add more, use the "Your own story" option in
the app — it counts words live and flags anything outside the contest range —
or add entries to that file.

Project Gutenberg is the obvious source for public-domain material. Grimm and
Andersen tales land in the 600–1100 band most often. Most Aesop fables are far
too short.

## Adding picture prompts

`src/data/pictures.ts`. Each entry is an emoji, a short concrete caption, and a
group (`who` / `thing` / `place` / `event`). Each generated page draws two
characters, two objects, one place and one event — a page of six purely random
items often gives a child nothing to build a plot from.

## Changing the contest dates

`src/App.tsx`, top of the file. The header countdown follows.

## Things deliberately left out

- **No AI feedback on her writing.** Creativity is 60% of the score precisely
  because it is the part a rubric cannot automate, and a seven-year-old should
  hear the verdict from her parent.
- **No streaks, badges or points.** Six weeks of practice with a real deadline
  does not need gamifying, and the failure mode you actually care about is her
  dreading it.
- **No cloud sync.** See above re: not collecting anything.
# uil-practice
