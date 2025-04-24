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

type QuizStore = {
  questions: Question[];
  currentIndex: number;
  answers: AnswerHistory[];
  quizOngoing: boolean;
  loadQuestions: (qs: Question[]) => void;
  answerQuestion: (answer: AnswerHistory) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
};

const useQuizStore = create<QuizStore>((set) => ({
  questions: [],
  currentIndex: 0,
  answers: [],
  quizOngoing: false,
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
}));

export default useQuizStore;
