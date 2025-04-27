import { create } from "zustand";

export type QuestionTypes =
  | "slideshow"
  | "video"
  | "picture-to-picture"
  | "label-to-hotspot"
  | "image-mcq"
  | "hotspot-mcq";

export type AnswerHistory = {
  questionId: string;
  questionType: QuestionTypes;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  mistakeCount: number;
};

export type QuestionAttempt = {
  question_attempt_id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id: string;
  correct_option_id: string;
  is_correct: boolean;
  mistake_count: number;
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
  matches?: [string, string][];
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
  completedTimestamp: number;
  setQuiz: (quiz: Quiz) => void;
  loadQuestions: (qs: Question[]) => void;
  answerQuestion: (answer: AnswerHistory) => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
  setStartTimestamp: (timestamp: number) => void;
  setCompletedTimestamp: (timestamp: number) => void;
};

const useQuizStore = create<QuizStore>((set) => ({
  quiz: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  quizOngoing: false,
  startTimestamp: 0,
  completedTimestamp: 0,
  setQuiz: (quiz) => set({ quiz }),
  loadQuestions: (qs) =>
    set({ questions: qs, currentIndex: 0, answers: [], quizOngoing: true }),
  answerQuestion: (answer) =>
    set((state) => ({
      answers: [...state.answers, answer],
    })),
  nextQuestion: () =>
    set((state) => {
      const isLastQuestion = state.currentIndex >= state.questions.length - 1;
      if (isLastQuestion) {
        return {
          completedTimestamp: Date.now(),
        };
      } else {
        return {
          currentIndex: state.currentIndex + 1,
        };
      }
    }),
  resetQuiz: () =>
    set(() => ({
      questions: [],
      currentIndex: 0,
      answers: [],
      quizOngoing: false,
    })),
  setStartTimestamp: (timestamp) => set({ startTimestamp: timestamp }),
  setCompletedTimestamp: (timestamp) => set({ completedTimestamp: timestamp }),
}));

export default useQuizStore;
