export interface PersonalityQuestion {
  key: string;
  question: string;
  emoji: string;
  options: string[];
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  {
    key: "themeSong",
    question: "What's your current vibe in song form?",
    emoji: "🎵",
    options: [
      "A heartbreak anthem",
      "A power ballad",
      "An indie bop",
      "A certified banger",
      "Something lowkey unhinged",
      "Pure classical elegance",
    ],
  },
  {
    key: "argumentStyle",
    question: "During an argument, you tend to...",
    emoji: "💬",
    options: [
      "Go full silent mode",
      "Send a 3-paragraph text",
      "Stress-eat something",
      "Write a poem about it later",
      "Need a long walk alone",
      "Make a pros & cons list",
    ],
  },
  {
    key: "idealSunday",
    question: "Your perfect Sunday looks like...",
    emoji: "☀️",
    options: [
      "Brunch & farmers market",
      "Hiking with a podcast",
      "Bed until 2pm, no regrets",
      "Cooking an elaborate meal",
      "Museum or gallery crawl",
      "Spontaneous road trip",
    ],
  },
];
