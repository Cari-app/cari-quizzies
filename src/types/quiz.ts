export type QuizScreenType = 
  | 'welcome'
  | 'single-choice'
  | 'multiple-choice'
  | 'text-input'
  | 'email'
  | 'phone'
  | 'number'
  | 'slider'
  | 'date'
  | 'image-choice'
  | 'rating'
  | 'info'
  | 'result'
  | 'progress'
  | 'checkout';

export type ComponentType = 
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'input'
  | 'options'
  | 'slider'
  | 'progress'
  | 'spacer';

export interface QuizComponent {
  id: string;
  type: ComponentType;
  props: Record<string, unknown>;
}

export interface QuizOption {
  id: string;
  text: string;
  imageUrl?: string;
  value?: string | number;
}

export interface QuizScreen {
  id: string;
  type: QuizScreenType;
  title?: string;
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
  components?: QuizComponent[];
  // Visibility settings - all optional
  showTitle?: boolean;
  showSubtitle?: boolean;
  showButton?: boolean;
  showHeader?: boolean;
  showLogo?: boolean;
  showProgress?: boolean;
  allowBack?: boolean;
  // Style settings
  backgroundColor?: string;
  textColor?: string;
}

export interface ScreenTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  screen: Partial<QuizScreen>;
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
