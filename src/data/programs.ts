export type ProgramMeal = {
  name: string;
  protein?: number;
  carbs?: number;
  fats?: number;
  example: string[];
};

export type ProgramTraining = {
  split: string;
  focus: string;
};

export type ProgramBlock = {
  meals: ProgramMeal[];
  training?: ProgramTraining;
  note?: string;
};

export const programs = {
  BULK: {
    meals: [
      {
        name: "Aamiainen",
        protein: 34,
        carbs: 55,
        fats: 14,
        example: ["rahka 250g", "kaurahiutale 60g", "marjat"],
      },
      {
        name: "Lounas",
        protein: 38,
        carbs: 60,
        fats: 12,
        example: ["riisi 80g", "jauheliha 150g", "kasvikset"],
      },
    ],
    training: {
      split: "4x viikossa",
      focus: "lihas + voima",
    },
  },

  EASY: {
    meals: [
      {
        name: "Aamiainen",
        example: ["proteiinivanukas", "banaani"],
      },
    ],
    note: "Helppo toteuttaa arjessa",
  },
} as const satisfies Record<string, ProgramBlock>;
