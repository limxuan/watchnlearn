import { create } from "zustand";

export type QuestionTypes =
  | "slideshow"
  | "video"
  | "picture-to-picture"
  | "label-matching"
  | "image-mcq"
  | "image-hotspot";

type AnswerHistory = {
  questionId: string;
  questionType: QuestionTypes;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
};

export type QuestionOption = {
  question_id: string;
  option_id: string;
  option_text?: string;
  option_url: string;
  is_correct: boolean;
  pos_x?: number;
  pos_y?: number;
  is_active: boolean;
};

export type Question = {
  question_id: string;
  question_type: QuestionTypes;
  question_text: string;
  image_urls?: string[];
  video_url?: string;
  question_options: QuestionOption[];
  updated_at: string;
  is_active: boolean;
};

export type Quiz = {
  quiz_id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
};

type QuizStore = {
  quiz: Quiz | null;
  questions: Question[];
  currentIndex: number;
  answers: AnswerHistory[];
  quizOngoing: boolean;
  startTimestamp: number;
  endTimestamp: number;
  setQuiz: (quiz: Quiz) => void;
  loadQuestions: (qs: Question[]) => void;
  answerQuestion: (answer: AnswerHistory) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  setStartTimestamp: (timestamp: number) => void;
  setEndTimestamp: (timestamp: number) => void;
};

const useQuizStore = create<QuizStore>((set) => ({
  quiz: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  quizOngoing: false,
  startTimestamp: 0,
  endTimestamp: 0,
  setQuiz: (quiz) => set({ quiz }),
  loadQuestions: (qs) =>
    set({ questions: qs, currentIndex: 0, answers: [], quizOngoing: true }),
  answerQuestion: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),
  nextQuestion: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1,
    })),
  resetQuiz: () =>
    set(() => ({
      questions: [],
      currentIndex: 0,
      answers: [],
      quizOngoing: false,
    })),
  setStartTimestamp: (timestamp) => set({ startTimestamp: timestamp }),
  setEndTimestamp: (timestamp) => set({ endTimestamp: timestamp }),
}));

export default useQuizStore;
