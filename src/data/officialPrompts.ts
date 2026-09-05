import type { Picture } from "../types";

/**
 * The actual picture-prompt pages used in past UIL A+ Creative Writing
 * grade 2 contests (2017-18 through 2019-20). Real captions, real rounds —
 * useful because the invented pool in pictures.ts can't tell you what an
 * actual contest page looks like.
 */
export interface OfficialPromptPage {
  year: string;
  round: string;
  items: Picture[];
}

function page(year: string, round: string, items: [string, string][]): OfficialPromptPage {
  return {
    year,
    round,
    items: items.map(([emoji, caption]) => ({ emoji, caption, group: "thing" })),
  };
}

export const OFFICIAL_PROMPTS: OfficialPromptPage[] = [
  page("2017-18", "Invitational", [
    ["🌍", "globe"],
    ["🐱", "cat"],
    ["🌵", "cactus"],
    ["👣", "footprint"],
    ["🏫", "schoolhouse"],
  ]),
  page("2017-18", "Fall/Winter District", [
    ["🕒", "clock"],
    ["⛲", "fountain"],
    ["🐴", "horse"],
    ["✋", "hand"],
    ["🔑", "key"],
  ]),
  page("2017-18", "Spring District", [
    ["🚲", "bicycle"],
    ["✉️", "letter"],
    ["🎈", "balloons"],
    ["🦒", "giraffe"],
    ["🔍", "magnifying glass"],
  ]),
  page("2018-19", "Invitational", [
    ["🌹", "rose"],
    ["🎁", "gift"],
    ["🛴", "scooter"],
    ["🌳", "treehouse"],
    ["🧮", "calculator"],
  ]),
  page("2018-19", "Fall/Winter District", [
    ["🏖️", "sandcastle"],
    ["🐘", "elephant"],
    ["📎", "paperclip"],
    ["⛈️", "thunderstorm"],
    ["🥪", "sandwich"],
  ]),
  page("2018-19", "Spring District", [
    ["🎧", "headphones"],
    ["🗺️", "treasure map"],
    ["⚽", "soccer ball"],
    ["🐭", "mouse"],
    ["📓", "notebook"],
  ]),
  page("2019-20", "Invitational", [
    ["🐉", "dragon"],
    ["👟", "shoe"],
    ["🧸", "teddy bear"],
    ["🎨", "painting"],
    ["👨‍🚀", "astronaut"],
  ]),
  page("2019-20", "Fall/Winter District", [
    ["🚗", "car"],
    ["🧢", "baseball hat"],
    ["👓", "glasses"],
    ["⛰️", "mountain"],
    ["✏️", "pencil"],
  ]),
  page("2019-20", "Spring District", [
    ["🏈", "football"],
    ["⬛", "chalkboard"],
    ["☕", "coffee mug"],
    ["☂️", "umbrella"],
    ["🦓", "zebra"],
  ]),
];
