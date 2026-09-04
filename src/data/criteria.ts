/**
 * The nine questions on the UIL A+ Storytelling evaluation sheet.
 * All nine are of equal importance. None of them is about accuracy.
 */
export const STORY_CRITERIA = [
  "Communicated effectively with the audience",
  "Commanded attention",
  "Told the story with ease",
  "Showed enthusiasm",
  "Used facial expressions, vocal variety, characterization",
  "Made good eye contact",
  "Used good posture",
  "Spoke clearly",
  "Used gestures effectively",
] as const;

/**
 * UIL A+ Creative Writing, elementary. Three weighted areas, 20 points total.
 */
export const WRITING_AREAS = [
  {
    key: "creativity" as const,
    label: "Creativity and interest",
    weight: "60%",
    max: 12,
    hint: "Substance first, then clarity and specific details that individualise the story. Worth more than the other two combined.",
  },
  {
    key: "organization" as const,
    label: "Organization",
    weight: "30%",
    max: 6,
    hint: "Ideas presented in a logical, coherent order. Beginning, middle, end.",
  },
  {
    key: "style" as const,
    label: "Correctness of style",
    weight: "10%",
    max: 2,
    hint: "Sentence structure, punctuation, grammar, spelling, word usage. Two points out of twenty — do not spend the conversation here.",
  },
];
