// Shared types for quiz component renderers

export interface ComponentConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  description?: string;
  content?: string;
  textAlign?: string;
  fontSize?: string;
  buttonText?: string;
  buttonStyle?: string;
  buttonAction?: string;
  buttonLink?: string;
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
  buttonFullWidth?: boolean;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';
  buttonGradient?: boolean;
  buttonGradientFrom?: string;
  buttonGradientTo?: string;
  buttonGradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  buttonHoverEffect?: 'none' | 'darken' | 'lighten' | 'scale' | 'lift' | 'glow';
  buttonAnimation?: string;
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  buttonPaddingX?: number;
  buttonPaddingY?: number;
  buttonFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  buttonFontSize?: number;
  buttonLetterSpacing?: number;
  // Input types
  inputType?: string;
  mask?: string;
  // Height/Weight
  layoutType?: 'input' | 'ruler';
  unit?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  barColor?: string;
  valueColor?: string;
  toggleColor?: string;
  tickColor?: string;
  labelColor?: string;
  // Options
  options?: OptionItem[];
  allowMultiple?: boolean;
  autoAdvance?: boolean;
  optionStyle?: string;
  optionLayout?: string;
  optionSpacing?: string;
  optionBorderRadius?: string;
  optionShadow?: string;
  optionDetailType?: string;
  optionDetailPosition?: string;
  optionImagePosition?: string;
  optionImageRatio?: string;
  optionBgType?: string;
  optionBgColor?: string;
  optionGradientStart?: string;
  optionGradientEnd?: string;
  optionGradientAngle?: number;
  optionSelectedBgColor?: string;
  optionTextColor?: string;
  optionSelectedTextColor?: string;
  optionBorderColor?: string;
  optionBorderWidth?: number;
  // Media
  mediaUrl?: string;
  altText?: string;
  imageStyle?: string;
  imageRatio?: string;
  videoType?: 'url' | 'embed';
  embedCode?: string;
  height?: number;
  // Width/Alignment
  width?: number;
  imageSize?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: string;
  customId?: string;
  // And more as needed...
  [key: string]: any;
}

export interface OptionItem {
  id: string;
  text: string;
  value: string;
  imageUrl?: string;
  icon?: string;
  mediaType?: 'none' | 'icon' | 'image';
  points?: number;
  destination?: 'next' | 'submit' | 'specific';
  destinationStageId?: string;
}

export interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon?: string;
  customId?: string;
  config?: ComponentConfig;
}

export interface RendererProps {
  component: DroppedComponent;
  config: ComponentConfig;
  value: any;
  formData: Record<string, any>;
  onInputChange: (compId: string, customId: string | undefined, value: any) => void;
  onNavigate: (componentId: string, responseValue?: any) => void;
  onNavigateByOption: (componentId: string, optionId: string, optionText?: string) => void;
  onSubmit: () => void;
  processTemplate: (text: string) => string;
  processTemplateHtml: (html: string) => string;
  designSettings?: any;
  selectedDate?: Record<string, Date | undefined>;
  onDateChange?: (key: string, date: Date | undefined) => void;
}

// Utility functions for common styling
export const getSizeClasses = (size?: string) => {
  switch (size) {
    case 'sm': return 'py-2 px-4 text-xs';
    case 'lg': return 'py-4 px-8 text-base';
    case 'xl': return 'py-5 px-10 text-lg';
    default: return 'py-3 px-6 text-sm';
  }
};

export const getShadowClass = (shadow?: string) => {
  switch (shadow) {
    case 'sm': return 'shadow-sm';
    case 'md': return 'shadow-md';
    case 'lg': return 'shadow-lg';
    case 'xl': return 'shadow-xl';
    case 'glow': return 'shadow-[0_0_20px_rgba(var(--primary),0.4)]';
    default: return '';
  }
};

export const getFontWeight = (weight?: string) => {
  switch (weight) {
    case 'normal': return 'font-normal';
    case 'semibold': return 'font-semibold';
    case 'bold': return 'font-bold';
    default: return 'font-medium';
  }
};

export const getHoverEffect = (effect?: string) => {
  switch (effect) {
    case 'darken': return 'hover:brightness-90';
    case 'lighten': return 'hover:brightness-110';
    case 'scale': return 'hover:scale-105';
    case 'lift': return 'hover:-translate-y-1 hover:shadow-lg';
    case 'glow': return 'hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]';
    default: return '';
  }
};

export const getAnimationClass = (animation?: string) => {
  switch (animation) {
    case 'pulse': return 'animate-pulse';
    case 'bounce': return 'animate-bounce';
    case 'shake': return 'btn-attention';
    default: return '';
  }
};

export const getBorderRadiusClass = (radius?: string) => {
  switch (radius) {
    case 'none': return 'rounded-none';
    case 'small': return 'rounded-md';
    case 'medium': return 'rounded-lg';
    case 'large': return 'rounded-xl';
    case 'full': return 'rounded-full';
    default: return 'rounded-md';
  }
};

export const getSpacingClass = (spacing?: string) => {
  switch (spacing) {
    case 'compact': return 'gap-1';
    case 'relaxed': return 'gap-4';
    default: return 'gap-2';
  }
};

export const getLayoutClass = (layout?: string) => {
  switch (layout) {
    case 'grid-2': return 'grid grid-cols-2';
    case 'grid-3': return 'grid grid-cols-3';
    case 'grid-4': return 'grid grid-cols-4';
    default: return 'flex flex-col';
  }
};
