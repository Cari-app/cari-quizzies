export type QuizScreenType = 
  | 'welcome'
  | 'single-choice'
  | 'multiple-choice'
  | 'text-input'
  | 'slider'
  | 'image-choice'
  | 'info'
  | 'result';

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
  value?: string | number;
}

export interface QuizScreen {
  id: string;
  type: QuizScreenType;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  options?: QuizOption[];
  buttonText?: string;
  placeholder?: string;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
  required?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface Quiz {
  id: string;
  name: string;
  description?: string;
  screens: QuizScreen[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}

export interface QuizAnswer {
  screenId: string;
  value: string | string[] | number;
}

export interface QuizSession {
  quizId: string;
  currentScreenIndex: number;
  answers: QuizAnswer[];
  startedAt: Date;
  completedAt?: Date;
}
