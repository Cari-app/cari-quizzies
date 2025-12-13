// Shared types for component editors
import { ChartConfig } from '../ChartEditor';

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

export interface ArgumentItem {
  id: string;
  title: string;
  description: string;
  mediaType: 'none' | 'emoji' | 'image';
  emoji?: string;
  imageUrl?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export interface TestimonialItem {
  id: string;
  name: string;
  handle: string;
  rating: number;
  text: string;
  avatarUrl?: string;
  photoUrl?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface ComponentConfig {
  defaultCountry?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  description?: string;
  inputType?: 'text' | 'email' | 'tel' | 'number' | 'date';
  mask?: string;
  minLength?: number;
  maxLength?: number;
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'custom';
  buttonAction?: 'next' | 'submit' | 'link';
  buttonLink?: string;
  buttonSize?: 'sm' | 'md' | 'lg' | 'xl';
  buttonFullWidth?: boolean;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: number;
  buttonBorderRadius?: number;
  buttonShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow';
  buttonBgOpacity?: number;
  buttonGradient?: boolean;
  buttonGradientFrom?: string;
  buttonGradientTo?: string;
  buttonGradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-tr' | 'to-tl' | 'to-br' | 'to-bl';
  buttonHoverEffect?: 'none' | 'darken' | 'lighten' | 'scale' | 'lift' | 'glow';
  buttonAnimation?: 'none' | 'shine' | 'pulse-glow' | 'float' | 'heartbeat' | 'wiggle' | 'ripple' | 'glow-border' | 'bounce-subtle' | 'attention';
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  buttonPaddingX?: number;
  buttonPaddingY?: number;
  buttonFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  buttonFontSize?: number;
  buttonLetterSpacing?: number;
  options?: OptionItem[];
  allowMultiple?: boolean;
  autoAdvance?: boolean;
  introType?: 'text' | 'image' | 'video';
  optionStyle?: 'simple' | 'card' | 'image' | 'pill' | 'glass' | 'minimal';
  optionLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  optionOrientation?: 'vertical' | 'horizontal';
  imageRatio?: '1:1' | '16:9' | '4:3' | '3:2';
  imagePosition?: 'top' | 'left' | 'right' | 'bottom';
  detailType?: 'none' | 'checkbox' | 'radio' | 'number';
  detailPosition?: 'start' | 'end';
  optionBorderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  optionShadow?: 'none' | 'sm' | 'md' | 'lg';
  optionSpacing?: 'compact' | 'simple' | 'relaxed';
  transparentImageBg?: boolean;
  optionBgColor?: string;
  optionBgType?: 'solid' | 'gradient' | 'transparent';
  optionGradientAngle?: number;
  optionGradientStart?: string;
  optionGradientEnd?: string;
  optionTextColor?: string;
  optionBorderColor?: string;
  optionBorderWidth?: number;
  optionSelectedBgColor?: string;
  optionSelectedTextColor?: string;
  optionSelectedBorderColor?: string;
  content?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  mediaUrl?: string;
  altText?: string;
  videoType?: 'url' | 'embed';
  embedCode?: string;
  height?: number;
  scriptCode?: string;
  scriptDescription?: string;
  labelStyle?: 'default' | 'floating' | 'hidden';
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  showAfterSeconds?: number;
  displayRules?: Array<{ id: string; condition: string }>;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  opacity?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  layoutType?: 'input' | 'ruler';
  unit?: 'cm' | 'pol' | 'kg' | 'lb';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  barColor?: string;
  useThemeColor?: boolean;
  valueColor?: string;
  toggleColor?: string;
  tickColor?: string;
  labelColor?: string;
  alertStyle?: 'red' | 'yellow' | 'green' | 'blue' | 'gray';
  alertHighlight?: boolean;
  alertPadding?: 'compact' | 'default' | 'relaxed';
  notificationTitle?: string;
  notificationDescription?: string;
  notificationPosition?: 'default' | 'top' | 'bottom';
  notificationDuration?: number;
  notificationInterval?: number;
  notificationStyle?: 'default' | 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  notificationVariations?: Array<{ id: string; name: string; platform: string; number: string }>;
  timerSeconds?: number;
  timerText?: string;
  timerStyle?: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  loadingTitle?: string;
  loadingDescription?: string;
  loadingDuration?: number;
  loadingDelay?: number;
  loadingNavigation?: 'next' | 'submit' | 'specific' | 'link';
  loadingDestination?: 'next' | 'specific';
  loadingDestinationStageId?: string;
  loadingDestinationUrl?: string;
  showLoadingTitle?: boolean;
  showLoadingProgress?: boolean;
  loadingBgColor?: string;
  loadingTextColor?: string;
  loadingBarColor?: string;
  loadingBorderColor?: string;
  loadingBorderWidth?: number;
  loadingBorderRadius?: number;
  levelTitle?: string;
  levelSubtitle?: string;
  levelPercentage?: number;
  levelIndicatorText?: string;
  levelLegends?: string;
  showLevelMeter?: boolean;
  showLevelProgress?: boolean;
  levelType?: 'line' | 'segments';
  levelColor?: 'theme' | 'green-red' | 'red-green' | 'opaque' | 'red' | 'blue' | 'green' | 'yellow';
  levelBgColor?: string;
  levelTextColor?: string;
  levelBarColor?: string;
  levelBorderColor?: string;
  levelBorderWidth?: number;
  levelBorderRadius?: number;
  levelNavigation?: 'none' | 'next' | 'submit' | 'link';
  levelDestination?: 'next' | 'specific';
  levelDestinationStageId?: string;
  levelDestinationUrl?: string;
  levelNavigationDelay?: number;
  argumentItems?: ArgumentItem[];
  argumentLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  argumentDisposition?: 'image-text' | 'text-image' | 'image-left' | 'image-right';
  testimonialItems?: TestimonialItem[];
  testimonialLayout?: 'list' | 'grid-2' | 'carousel';
  testimonialBorderRadius?: 'none' | 'small' | 'medium' | 'large';
  testimonialShadow?: 'none' | 'sm' | 'md' | 'lg';
  testimonialSpacing?: 'compact' | 'simple' | 'relaxed';
  testimonialBgType?: 'solid' | 'gradient' | 'transparent';
  testimonialBgColor?: string;
  testimonialGradientStart?: string;
  testimonialGradientEnd?: string;
  testimonialGradientAngle?: number;
  testimonialStarColor?: string;
  testimonialTextColor?: string;
  testimonialNameColor?: string;
  testimonialHandleColor?: string;
  testimonialBorderColor?: string;
  testimonialBorderWidth?: number;
  faqItems?: FaqItem[];
  faqDetailType?: 'arrow' | 'plus-minus';
  faqFirstOpen?: boolean;
  faqBgType?: 'solid' | 'gradient' | 'transparent';
  faqBgColor?: string;
  faqGradientStart?: string;
  faqGradientEnd?: string;
  faqGradientAngle?: number;
  faqTextColor?: string;
  faqAnswerColor?: string;
  faqBorderColor?: string;
  faqBorderWidth?: number;
  faqBorderRadius?: number;
  faqIconColor?: string;
  priceTitle?: string;
  pricePrefix?: string;
  priceValue?: string;
  priceSuffix?: string;
  priceHighlight?: string;
  priceType?: 'illustrative' | 'redirect';
  priceRedirectUrl?: string;
  priceLayout?: 'horizontal' | 'vertical';
  priceBgType?: 'solid' | 'gradient' | 'transparent';
  priceBgColor?: string;
  priceGradientStart?: string;
  priceGradientEnd?: string;
  priceGradientAngle?: number;
  priceTitleColor?: string;
  priceValueColor?: string;
  pricePrefixColor?: string;
  priceBorderColor?: string;
  priceBorderWidth?: number;
  priceBorderRadius?: number;
  beforeAfterImage1?: string;
  beforeAfterImage2?: string;
  beforeAfterRatio?: '1:1' | '16:9' | '4:3' | '9:16';
  beforeAfterInitialPosition?: number;
  carouselItems?: Array<{ id: string; image: string; description: string }>;
  carouselLayout?: 'image-text' | 'text-only' | 'image-only';
  carouselPagination?: boolean;
  carouselAutoplay?: boolean;
  carouselAutoplayInterval?: number;
  carouselBorder?: boolean;
  carouselImageRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '21:9';
  metricItems?: Array<{
    id: string;
    type: 'bar' | 'circular';
    color: 'theme' | 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'black';
    value: number;
    label: string;
  }>;
  metricsLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  metricsDisposition?: 'chart-legend' | 'legend-chart';
  metricsBgType?: 'solid' | 'gradient' | 'transparent';
  metricsBgColor?: string;
  metricsGradientStart?: string;
  metricsGradientEnd?: string;
  metricsGradientAngle?: number;
  metricsTextColor?: string;
  metricsValueColor?: string;
  metricsBorderColor?: string;
  metricsBorderWidth?: number;
  metricsBorderRadius?: number;
  chartConfig?: ChartConfig;
  // Spacer specific
  spacerHeight?: number;
  spacerShowLine?: boolean;
  spacerLineColor?: string;
  spacerLineThickness?: number;
  spacerLineStyle?: 'solid' | 'dashed' | 'dotted';
  // Webhook trigger specific
  webhookActive?: boolean;
  webhookDescription?: string;
}

export interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
  customId?: string;
}

export interface EditorProps {
  component: DroppedComponent;
  config: ComponentConfig;
  updateConfig: (updates: Partial<ComponentConfig>) => void;
  onUpdateCustomId: (customId: string) => void;
  themeColor?: string;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
}

// Helper to generate slug from text
export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/(^_|_$)/g, '');
};
