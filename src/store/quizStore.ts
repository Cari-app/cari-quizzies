import { create } from 'zustand';
import { Quiz, QuizScreen, QuizSession, QuizAnswer } from '@/types/quiz';
import { mockQuizzes } from '@/data/mockQuizzes';

interface QuizStore {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  currentSession: QuizSession | null;
  editingScreen: QuizScreen | null;
  
  // Quiz management
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  
  // Screen management
  addScreen: (quizId: string, screen: QuizScreen) => void;
  updateScreen: (quizId: string, screenId: string, updates: Partial<QuizScreen>) => void;
  deleteScreen: (quizId: string, screenId: string) => void;
  reorderScreens: (quizId: string, screens: QuizScreen[]) => void;
  setEditingScreen: (screen: QuizScreen | null) => void;
  
  // Session management
  startSession: (quizId: string) => void;
  answerQuestion: (answer: QuizAnswer) => void;
  nextScreen: () => void;
  previousScreen: () => void;
  endSession: () => void;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  quizzes: mockQuizzes,
  currentQuiz: null,
  currentSession: null,
  editingScreen: null,

  setQuizzes: (quizzes) => set({ quizzes }),
  
  addQuiz: (quiz) => set((state) => ({ 
    quizzes: [...state.quizzes, quiz] 
  })),
  
  updateQuiz: (id, updates) => set((state) => ({
    quizzes: state.quizzes.map((q) => 
      q.id === id ? { ...q, ...updates, updatedAt: new Date() } : q
    ),
    currentQuiz: state.currentQuiz?.id === id 
      ? { ...state.currentQuiz, ...updates, updatedAt: new Date() } 
      : state.currentQuiz,
  })),
  
  deleteQuiz: (id) => set((state) => ({
    quizzes: state.quizzes.filter((q) => q.id !== id),
    currentQuiz: state.currentQuiz?.id === id ? null : state.currentQuiz,
  })),
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),

  addScreen: (quizId, screen) => set((state) => ({
    quizzes: state.quizzes.map((q) =>
      q.id === quizId 
        ? { ...q, screens: [...q.screens, screen], updatedAt: new Date() }
        : q
    ),
    currentQuiz: state.currentQuiz?.id === quizId
      ? { ...state.currentQuiz, screens: [...state.currentQuiz.screens, screen], updatedAt: new Date() }
      : state.currentQuiz,
  })),

  updateScreen: (quizId, screenId, updates) => set((state) => {
    const updateScreenInQuiz = (quiz: Quiz): Quiz => ({
      ...quiz,
      screens: quiz.screens.map((s) =>
        s.id === screenId ? { ...s, ...updates } : s
      ),
      updatedAt: new Date(),
    });

    return {
      quizzes: state.quizzes.map((q) =>
        q.id === quizId ? updateScreenInQuiz(q) : q
      ),
      currentQuiz: state.currentQuiz?.id === quizId
        ? updateScreenInQuiz(state.currentQuiz)
        : state.currentQuiz,
      editingScreen: state.editingScreen?.id === screenId
        ? { ...state.editingScreen, ...updates }
        : state.editingScreen,
    };
  }),

  deleteScreen: (quizId, screenId) => set((state) => {
    const removeScreenFromQuiz = (quiz: Quiz): Quiz => ({
      ...quiz,
      screens: quiz.screens.filter((s) => s.id !== screenId),
      updatedAt: new Date(),
    });

    return {
      quizzes: state.quizzes.map((q) =>
        q.id === quizId ? removeScreenFromQuiz(q) : q
      ),
      currentQuiz: state.currentQuiz?.id === quizId
        ? removeScreenFromQuiz(state.currentQuiz)
        : state.currentQuiz,
      editingScreen: state.editingScreen?.id === screenId ? null : state.editingScreen,
    };
  }),

  reorderScreens: (quizId, screens) => set((state) => ({
    quizzes: state.quizzes.map((q) =>
      q.id === quizId ? { ...q, screens, updatedAt: new Date() } : q
    ),
    currentQuiz: state.currentQuiz?.id === quizId
      ? { ...state.currentQuiz, screens, updatedAt: new Date() }
      : state.currentQuiz,
  })),

  setEditingScreen: (screen) => set({ editingScreen: screen }),

  startSession: (quizId) => {
    const quiz = get().quizzes.find((q) => q.id === quizId);
    if (quiz) {
      set({
        currentQuiz: quiz,
        currentSession: {
          quizId,
          currentScreenIndex: 0,
          answers: [],
          startedAt: new Date(),
        },
      });
    }
  },

  answerQuestion: (answer) => set((state) => {
    if (!state.currentSession) return state;
    
    const existingIndex = state.currentSession.answers.findIndex(
      (a) => a.screenId === answer.screenId
    );
    
    const newAnswers = existingIndex >= 0
      ? state.currentSession.answers.map((a, i) => i === existingIndex ? answer : a)
      : [...state.currentSession.answers, answer];

    return {
      currentSession: {
        ...state.currentSession,
        answers: newAnswers,
      },
    };
  }),

  nextScreen: () => set((state) => {
    if (!state.currentSession || !state.currentQuiz) return state;
    
    const maxIndex = state.currentQuiz.screens.length - 1;
    const newIndex = Math.min(state.currentSession.currentScreenIndex + 1, maxIndex);
    
    return {
      currentSession: {
        ...state.currentSession,
        currentScreenIndex: newIndex,
        completedAt: newIndex === maxIndex ? new Date() : undefined,
      },
    };
  }),

  previousScreen: () => set((state) => {
    if (!state.currentSession) return state;
    
    return {
      currentSession: {
        ...state.currentSession,
        currentScreenIndex: Math.max(state.currentSession.currentScreenIndex - 1, 0),
      },
    };
  }),

  endSession: () => set({ currentSession: null }),
}));
