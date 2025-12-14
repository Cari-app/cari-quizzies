import { useEffect, useState, useMemo, useCallback, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus, ArrowLeftCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { parseTemplate, templateFunctions, TemplateVariables } from '@/lib/templateParser';
import { format } from 'date-fns';
import useEmblaCarousel from 'embla-carousel-react';
import { ScriptExecutor } from './ScriptExecutor';
// Extracted renderers
import { 
  TextRenderer, 
  InputRenderer, 
  ButtonRenderer, 
  MeasurementRenderer,
  SpacerRenderer,
  SeparatorRenderer,
  OptionsRenderer,
  SliderRenderer,
  AlertRenderer,
  TimerRenderer,
  LoadingRenderer,
  LevelRenderer,
  ArgumentsRenderer,
  TestimonialsRenderer,
  FaqRenderer,
  PriceRenderer,
  BeforeAfterRenderer,
  CarouselRenderer,
  MetricsRenderer,
  ChartsRenderer,
  MediaRenderer,
  WebhookTriggerRenderer,
  FormRenderer,
  ProgressRenderer
} from './renderers';

interface QuizPlayerProps {
  slug?: string;
}

interface OptionItem {
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

interface ComponentConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  description?: string;
  buttonText?: string;
  buttonStyle?: string;
  buttonAction?: string;
  buttonLink?: string;
  // Button design
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
  buttonAnimation?: 'none' | 'shine' | 'pulse-glow' | 'float' | 'heartbeat' | 'wiggle' | 'ripple' | 'glow-border' | 'bounce-subtle' | 'attention';
  buttonIcon?: string;
  buttonIconPosition?: 'left' | 'right';
  buttonPaddingX?: number;
  buttonPaddingY?: number;
  buttonFontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  buttonFontSize?: number;
  buttonLetterSpacing?: number;
  content?: string;
  textAlign?: string;
  fontSize?: string;
  mediaUrl?: string;
  altText?: string;
  // Video specific
  videoType?: 'url' | 'embed';
  embedCode?: string;
  height?: number;
  // Script specific
  scriptCode?: string;
  scriptDescription?: string;
  options?: OptionItem[];
  allowMultiple?: boolean;
  autoAdvance?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  customId?: string;
  // Height/Weight specific
  layoutType?: 'input' | 'ruler';
  unit?: 'cm' | 'pol' | 'kg' | 'lb';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  barColor?: string;
  valueColor?: string;
  toggleColor?: string;
  tickColor?: string;
  labelColor?: string;
  // Options appearance
  optionStyle?: 'simple' | 'card' | 'image' | 'pill' | 'glass' | 'minimal';
  optionLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  optionOrientation?: 'horizontal' | 'vertical';
  optionBorderRadius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  optionShadow?: 'none' | 'sm' | 'md' | 'lg';
  optionSpacing?: 'compact' | 'simple' | 'relaxed';
  detailType?: 'none' | 'checkbox' | 'radio' | 'number';
  detailPosition?: 'start' | 'end';
  imagePosition?: 'top' | 'left' | 'right' | 'bottom';
  imageRatio?: '1:1' | '16:9' | '4:3' | '3:2';
  transparentImageBg?: boolean;
  // Appearance
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  // Timer specific
  timerSeconds?: number;
  timerText?: string;
  timerStyle?: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  // Loading specific
  loadingTitle?: string;
  loadingDescription?: string;
  loadingDuration?: number;
  loadingDelay?: number;
  loadingNavigation?: 'next' | 'submit' | 'link';
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
  // Level specific
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
  // Arguments specific
  argumentItems?: Array<{
    id: string;
    title: string;
    description: string;
    mediaType: 'none' | 'emoji' | 'image';
    emoji?: string;
    imageUrl?: string;
  }>;
  argumentLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  argumentDisposition?: 'image-text' | 'text-image' | 'image-left' | 'image-right';
  // Testimonials specific
  testimonialItems?: Array<{
    id: string;
    name: string;
    handle: string;
    rating: number;
    text: string;
    avatarUrl?: string;
    photoUrl?: string;
  }>;
  testimonialLayout?: 'list' | 'grid-2' | 'carousel';
  testimonialBorderRadius?: 'none' | 'small' | 'medium' | 'large';
  testimonialShadow?: 'none' | 'sm' | 'md' | 'lg';
  testimonialSpacing?: 'compact' | 'simple' | 'relaxed';
  // FAQ specific
  faqItems?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
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
  // Price specific
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
  // Before-After specific
  beforeAfterImage1?: string;
  beforeAfterImage2?: string;
  beforeAfterRatio?: '1:1' | '16:9' | '4:3' | '9:16';
  beforeAfterInitialPosition?: number;
  // Carousel specific
  carouselItems?: Array<{ id: string; image: string; description: string }>;
  carouselLayout?: 'image-text' | 'text-only' | 'image-only';
  carouselPagination?: boolean;
  carouselAutoplay?: boolean;
  carouselAutoplayInterval?: number;
  carouselBorder?: boolean;
  carouselImageRatio?: '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16' | '21:9';
  // Metrics specific
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
  // Charts specific
  chartConfig?: {
    chartType: 'cartesian' | 'bar' | 'circular';
    dataSets: Array<{
      id: string;
      name: string;
      data: Array<{ id: string; label: string; value: number; color?: string }>;
      fillType: 'solid' | 'gradient';
      color: string;
      gradientColors: string[];
    }>;
    selectedDataSetId: string;
    showArea: boolean;
    showXAxis: boolean;
    showYAxis: boolean;
    showGridX: boolean;
    showGridY: boolean;
    width: number;
    horizontalAlign: 'start' | 'center' | 'end';
    verticalAlign: 'auto' | 'start' | 'center' | 'end';
  };
}

interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
  customId?: string;
}

interface PageSettings {
  showLogo?: boolean;
  showProgress?: boolean;
  allowBack?: boolean;
  logoUrl?: string;
  logoSize?: string;
}

interface DesignSettings {
  // GERAL
  alignment: 'left' | 'center' | 'right';
  maxWidth: 'small' | 'medium' | 'large' | 'full';
  elementSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  
  // HEADER
  headerStyle: 'default' | 'minimal' | 'steps' | 'line';
  logo: {
    type: 'image' | 'url' | 'emoji';
    value: string;
  };
  logoSizePixels?: number;
  logoPosition: 'left' | 'center' | 'right';
  logoLayout?: 'above' | 'inline' | 'below';
  logoSpacing?: {
    marginTop: number;
    marginBottom: number;
    paddingX: number;
  };
  progressBar: 'hidden' | 'top' | 'bottom';
  hideProgressBar?: boolean;
  
  // HEADER STYLING
  headerDivider?: {
    show: boolean;
    color: string;
    thickness: number;
  };
  backIcon?: {
    color: string;
    size: 'small' | 'medium' | 'large';
    style: 'arrow' | 'chevron' | 'circle';
    position?: 'left' | 'center' | 'right';
  };
  
  // CORES
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  
  // TIPOGRAFIA
  fontSize: number;
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  titleFont?: string;
  bodyFont?: string;
  // Legacy properties for backwards compatibility
  primaryFont?: string;
  secondaryFont?: string;
}

const defaultDesignSettings: DesignSettings = {
  alignment: 'center',
  maxWidth: 'small',
  elementSize: 'medium',
  spacing: 'normal',
  borderRadius: 'medium',
  headerStyle: 'default',
  logo: { type: 'url', value: '' },
  logoSizePixels: 40,
  logoPosition: 'center',
  logoLayout: 'above',
  progressBar: 'top',
  primaryColor: '#A855F7',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleColor: '#A855F7',
  fontSize: 16,
  titleSize: 'medium',
  titleFont: 'Montserrat',
  bodyFont: 'Inter',
};

interface StageConnection {
  targetId: string;
  sourceHandle?: string;
}

interface StageBackground {
  type: 'color' | 'gradient' | 'image';
  color?: string;
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number;
  gradientStops?: Array<{ color: string; position: number }>;
  imageUrl?: string;
  imageSize?: 'cover' | 'contain' | 'auto';
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  overlayEnabled?: boolean;
  overlayType?: 'color' | 'gradient';
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradientType?: 'linear' | 'radial';
  overlayGradientAngle?: number;
  overlayGradientStops?: Array<{ color: string; position: number }>;
}

interface QuizStage {
  id: string;
  titulo: string | null;
  ordem: number;
  components: DroppedComponent[];
  pageSettings?: PageSettings;
  designSettings?: DesignSettings;
  connections?: StageConnection[];
  background?: StageBackground;
}

interface QuizData {
  id: string;
  titulo: string;
  descricao: string | null;
  slug: string | null;
}

// Testimonial Carousel Component
interface TestimonialCarouselProps {
  items: Array<{
    id: string;
    name: string;
    handle: string;
    rating: number;
    text: string;
    avatarUrl?: string;
    photoUrl?: string;
  }>;
  widthValue: number;
  justifyClass: string;
  renderCard: (item: TestimonialCarouselProps['items'][0]) => React.ReactNode;
}

function TestimonialCarousel({ items, widthValue, justifyClass, renderCard }: TestimonialCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center', skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on('select', onSelect);
    onSelect();
    
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div className="relative group" style={{ width: `${widthValue}%` }}>
        {/* Carousel container */}
        <div ref={emblaRef} className="overflow-hidden rounded-2xl">
          <div className="flex">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 min-w-0 px-2 transition-all duration-300" 
                style={{ flex: '0 0 90%' }}
              >
                <div className={cn(
                  "transition-all duration-300",
                  index === selectedIndex ? "scale-100 opacity-100" : "scale-95 opacity-60"
                )}>
                  {renderCard(item)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Premium navigation buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110 hover:shadow-xl"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background hover:scale-110 hover:shadow-xl"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
        
        {/* Premium dots indicator */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => emblaApi?.scrollTo(i)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  i === selectedIndex 
                    ? "w-6 h-2.5 bg-primary shadow-sm" 
                    : "w-2.5 h-2.5 bg-muted-foreground/20 hover:bg-muted-foreground/40"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface FaqAccordionProps {
  faqItems: Array<{ id: string; question: string; answer: string }>;
  widthValue: number;
  justifyClass: string;
  detailType: string;
  firstOpen: boolean;
  bgType?: 'solid' | 'gradient' | 'transparent';
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  textColor?: string;
  answerColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  iconColor?: string;
}

function FaqAccordion({ 
  faqItems, widthValue, justifyClass, detailType, firstOpen,
  bgType = 'solid', bgColor, gradientStart = '#667eea', gradientEnd = '#764ba2', gradientAngle = 135,
  textColor, answerColor, borderColor, borderWidth = 1, borderRadius = 8, iconColor
}: FaqAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(firstOpen && faqItems[0] ? [faqItems[0].id] : []);
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const bgStyle = bgType === 'transparent' 
    ? 'transparent'
    : bgType === 'gradient' 
      ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      : bgColor || undefined;
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div className="space-y-2" style={{ width: `${widthValue}%` }}>
        {faqItems.map((item) => {
          const isOpen = openItems.includes(item.id);
          return (
            <div 
              key={item.id} 
              className="overflow-hidden"
              style={{
                background: bgStyle,
                borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
                borderStyle: borderWidth > 0 ? 'solid' : 'none',
                borderColor: borderColor || undefined,
                borderRadius: `${borderRadius}px`,
              }}
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <span 
                  className="font-medium text-sm"
                  style={{ color: textColor || undefined }}
                  dangerouslySetInnerHTML={{ __html: item.question }}
                />
                {detailType === 'arrow' ? (
                  <ChevronUp 
                    className={cn("w-4 h-4 transition-transform", !isOpen && "rotate-180")}
                    style={{ color: iconColor || undefined }}
                  />
                ) : (
                  isOpen ? (
                    <Minus className="w-4 h-4" style={{ color: iconColor || undefined }} />
                  ) : (
                    <Plus className="w-4 h-4" style={{ color: iconColor || undefined }} />
                  )
                )}
              </button>
              {isOpen && (
                <div 
                  className="px-4 pb-4 text-sm pt-3"
                  style={{ 
                    color: answerColor || undefined,
                    borderTopWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
                    borderTopStyle: borderWidth > 0 ? 'solid' : 'none',
                    borderTopColor: borderColor || undefined,
                  }}
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const QuizPlayer = forwardRef<HTMLDivElement, QuizPlayerProps>(({ slug }, ref) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isInactive, setIsInactive] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [stages, setStages] = useState<QuizStage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Record<string, Date | undefined>>({});
  const [designSettings, setDesignSettings] = useState<DesignSettings>(defaultDesignSettings);
  const [navigationHistory, setNavigationHistory] = useState<number[]>([0]); // Track visited stage indices
  const [activeNotification, setActiveNotification] = useState<{
    compId: string;
    variationIndex: number;
    visible: boolean;
  } | null>(null);
  const [timerValues, setTimerValues] = useState<Record<string, number>>({});
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});
  const [loadingActive, setLoadingActive] = useState<Record<string, boolean>>({});
  
  // Session tracking for leads
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [stageStartTime, setStageStartTime] = useState<number>(Date.now());
  const [hasTriggeredFirstResponse, setHasTriggeredFirstResponse] = useState(false);

  const currentStage = stages[currentStageIndex];
  const pageSettings = currentStage?.pageSettings;
  const notificationComponents = currentStage?.components.filter(c => c.type === 'notification') || [];
  const loadingComponents = currentStage?.components.filter(c => c.type === 'loading') || [];
  const levelComponents = currentStage?.components.filter(c => c.type === 'level' && c.config?.levelNavigation && c.config.levelNavigation !== 'none') || [];

  // Load quiz by slug or id from Supabase
  useEffect(() => {
    const loadQuiz = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);
      setIsInactive(false);

      try {
        // Try to find by slug first (without is_active filter to check if it exists but inactive)
        let { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (quizError) {
          console.error('Error loading quiz by slug:', quizError);
        }

        // If not found by slug, try by id (only if slug looks like a UUID)
        if (!quizData && !quizError) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(slug)) {
            const { data, error: idError } = await supabase
              .from('quizzes')
              .select('*')
              .eq('id', slug)
              .maybeSingle();
            if (idError) {
              console.error('Error loading quiz by id:', idError);
            }
            quizData = data;
          }
        }

        if (!quizData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Check if quiz is inactive
        if (!quizData.is_active) {
          setIsInactive(true);
          setIsLoading(false);
          return;
        }

        setQuiz(quizData);

        // Load etapas (stages)
        const { data: etapasData } = await supabase
          .from('etapas')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('ordem', { ascending: true });

        const formattedStages: QuizStage[] = (etapasData || []).map((e) => {
          const configuracoes = e.configuracoes as Record<string, any> | null;
          return {
            id: e.id,
            titulo: e.titulo,
            ordem: e.ordem,
            components: (configuracoes?.components as DroppedComponent[]) || [],
            pageSettings: configuracoes?.pageSettings as PageSettings | undefined,
            connections: (configuracoes?.connections as StageConnection[]) || [],
            background: configuracoes?.background as StageBackground | undefined,
          };
        });
        setStages(formattedStages);
        
        // Load design settings from first stage
        if (etapasData && etapasData.length > 0) {
          const firstConfig = etapasData[0].configuracoes as Record<string, any> | null;
          if (firstConfig?.designSettings) {
            setDesignSettings({ ...defaultDesignSettings, ...firstConfig.designSettings });
          }
        }
      } catch (error) {
        console.error('Error loading quiz:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [slug]);

  // Create session when quiz loads
  useEffect(() => {
    const createSession = async () => {
      if (!quiz?.id || sessionId) return;

      try {
        // Detect device type
        const userAgent = navigator.userAgent;
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet';

        const { data, error } = await supabase
          .from('quiz_sessions')
          .insert({
            quiz_id: quiz.id,
            user_agent: userAgent,
            device_type: deviceType,
            referrer: document.referrer || null,
          })
          .select('id, session_token')
          .single();

        if (error) {
          console.error('Error creating session:', error);
          return;
        }

        setSessionId(data.id);
        setSessionToken(data.session_token);
        setStageStartTime(Date.now());
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    createSession();
  }, [quiz?.id, sessionId]);

  // Save response when navigating to a new stage
  const saveStageResponse = useCallback(async (stageId: string, stageOrder: number, responseValue: any, responseType: string) => {
    if (!sessionId) return;

    try {
      const timeSpent = Date.now() - stageStartTime;
      
      await supabase
        .from('quiz_responses')
        .insert({
          session_id: sessionId,
          stage_id: stageId,
          stage_order: stageOrder,
          response_value: responseValue,
          response_type: responseType,
          time_spent_ms: timeSpent,
        });

      // Reset stage start time for next stage
      setStageStartTime(Date.now());
    } catch (error) {
      console.error('Error saving response:', error);
    }
  }, [sessionId, stageStartTime]);

  // Trigger webhook on first response
  const triggerFirstResponseWebhook = useCallback(async () => {
    if (hasTriggeredFirstResponse || !quiz?.id || !sessionId) return;
    
    setHasTriggeredFirstResponse(true);
    
    try {
      await supabase.functions.invoke('n8n-webhook', {
        body: {
          quiz_id: quiz.id,
          session_id: sessionId,
          session_token: sessionToken,
          event_type: 'first_response',
          data: { formData },
        },
      });
      console.log('[QuizPlayer] First response webhook triggered');
    } catch (webhookError) {
      console.error('Error triggering first response webhook:', webhookError);
    }
  }, [hasTriggeredFirstResponse, quiz?.id, sessionId, sessionToken, formData]);

  // Mark session as completed
  const markSessionComplete = useCallback(async () => {
    if (!sessionId) return;

    try {
      // Extract identification data from formData
      const email = formData.email || formData.e_mail || null;
      const phone = formData.phone || formData.telefone || formData.celular || null;
      const name = formData.name || formData.nome || null;

      await supabase
        .from('quiz_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          email,
          phone,
          name,
        })
        .eq('id', sessionId);

      // Trigger N8N webhook if configured
      if (quiz?.id) {
        try {
          await supabase.functions.invoke('n8n-webhook', {
            body: {
              quiz_id: quiz.id,
              session_id: sessionId,
              session_token: sessionToken,
              event_type: 'quiz_completed',
              data: { formData },
            },
          });
        } catch (webhookError) {
          console.error('Error triggering webhook:', webhookError);
          // Don't fail the completion if webhook fails
        }
      }
    } catch (error) {
      console.error('Error marking session complete:', error);
    }
  }, [sessionId, sessionToken, formData, quiz?.id]);

  const handleInputChange = (componentId: string, customId: string | undefined, value: any) => {
    const key = customId || componentId;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (componentId: string, customId: string | undefined, date: Date | undefined) => {
    const key = customId || componentId;
    setSelectedDate(prev => ({ ...prev, [key]: date }));
    if (date) {
      setFormData(prev => ({ ...prev, [key]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleNext = useCallback((responseValue?: any, responseType?: string) => {
    // Save response for current stage before navigating
    if (currentStage && sessionId) {
      const stageData = responseValue || formData;
      saveStageResponse(currentStage.id, currentStageIndex, stageData, responseType || 'navigation');
    }
    
    if (currentStageIndex < stages.length - 1) {
      const nextIndex = currentStageIndex + 1;
      setCurrentStageIndex(nextIndex);
      setNavigationHistory(prev => [...prev, nextIndex]);
    }
  }, [currentStage, currentStageIndex, stages.length, formData, sessionId, saveStageResponse]);

  // Get all input values from current stage components
  const getStageInputValues = useCallback(() => {
    if (!currentStage) return {};
    
    const stageValues: Record<string, any> = {};
    currentStage.components.forEach(comp => {
      const key = comp.customId || comp.config?.customId || comp.id;
      if (formData[key] !== undefined) {
        stageValues[key] = formData[key];
      }
    });
    return stageValues;
  }, [currentStage, formData]);

  // Navigate based on flow connections
  const handleNavigateByComponent = useCallback((componentId: string, responseValue?: any) => {
    const currentStage = stages[currentStageIndex];
    const connections = currentStage?.connections || [];
    
    // Save response for current stage - include all input values from this stage
    if (currentStage && sessionId) {
      const stageInputValues = getStageInputValues();
      const hasInputValues = Object.keys(stageInputValues).length > 0;
      
      // Save all stage input values if any, otherwise save the click event
      const valueToSave = hasInputValues 
        ? stageInputValues 
        : (responseValue || { action: 'clicked' });
      
      saveStageResponse(currentStage.id, currentStageIndex, valueToSave, hasInputValues ? 'input' : 'component_click');
      
      // Trigger first response webhook if this is the first navigation
      if (currentStageIndex === 0) {
        triggerFirstResponseWebhook();
      }
    }
    
    // Find connection for this specific component
    const connection = connections.find(conn => 
      conn.sourceHandle === `comp-${componentId}`
    );
    
    if (connection) {
      // Navigate to the connected stage
      const targetIndex = stages.findIndex(s => s.id === connection.targetId);
      if (targetIndex !== -1) {
        setCurrentStageIndex(targetIndex);
        setNavigationHistory(prev => [...prev, targetIndex]);
        setStageStartTime(Date.now());
        return;
      }
    }
    
    // Default: go to next stage or complete quiz
    if (currentStageIndex < stages.length - 1) {
      const nextIndex = currentStageIndex + 1;
      setCurrentStageIndex(nextIndex);
      setNavigationHistory(prev => [...prev, nextIndex]);
      setStageStartTime(Date.now());
    } else {
      // Last stage - mark session as complete
      markSessionComplete();
    }
  }, [stages, currentStageIndex, sessionId, saveStageResponse, getStageInputValues, markSessionComplete, triggerFirstResponseWebhook]);

  // Navigate based on flow connections for a specific option
  const handleNavigateByOption = useCallback((componentId: string, optionId: string, optionText?: string) => {
    const currentStage = stages[currentStageIndex];
    const connections = currentStage?.connections || [];
    
    // Save response for this option selection
    if (currentStage && sessionId) {
      saveStageResponse(currentStage.id, currentStageIndex, { 
        selected: optionText || optionId, 
        optionId 
      }, 'option_selected');
      
      // Trigger first response webhook if this is the first navigation
      if (currentStageIndex === 0) {
        triggerFirstResponseWebhook();
      }
    }
    
    // Find connection for this specific option (format: opt-{componentId}-{optionId})
    const optionConnection = connections.find(conn => 
      conn.sourceHandle === `opt-${componentId}-${optionId}`
    );
    
    if (optionConnection) {
      // Navigate to the connected stage for this option
      const targetIndex = stages.findIndex(s => s.id === optionConnection.targetId);
      if (targetIndex !== -1) {
        setCurrentStageIndex(targetIndex);
        setNavigationHistory(prev => [...prev, targetIndex]);
        setStageStartTime(Date.now());
        return;
      }
    }
    
    // Fallback: try component-level connection
    const componentConnection = connections.find(conn => 
      conn.sourceHandle === `comp-${componentId}`
    );
    
    if (componentConnection) {
      const targetIndex = stages.findIndex(s => s.id === componentConnection.targetId);
      if (targetIndex !== -1) {
        setCurrentStageIndex(targetIndex);
        setNavigationHistory(prev => [...prev, targetIndex]);
        setStageStartTime(Date.now());
        return;
      }
    }
    
    // Default: go to next stage or complete quiz
    if (currentStageIndex < stages.length - 1) {
      const nextIndex = currentStageIndex + 1;
      setCurrentStageIndex(nextIndex);
      setNavigationHistory(prev => [...prev, nextIndex]);
      setStageStartTime(Date.now());
    } else {
      // Last stage - mark session as complete
      markSessionComplete();
    }
  }, [stages, currentStageIndex, sessionId, saveStageResponse, markSessionComplete, triggerFirstResponseWebhook]);

  // Navigate back following the history (respects flow order)
  const handleBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current
      const previousIndex = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentStageIndex(previousIndex);
    }
  };

  const handleSubmit = useCallback(async () => {
    console.log('Form data submitted:', formData);
    
    // Save final stage response and mark session complete
    if (currentStage && sessionId) {
      await saveStageResponse(currentStage.id, currentStageIndex, formData, 'submit');
      await markSessionComplete();
    }
    
    navigate('/');
  }, [formData, currentStage, currentStageIndex, sessionId, saveStageResponse, markSessionComplete, navigate]);

  // Build template variables from formData with computed values
  const templateVariables = useMemo((): TemplateVariables => {
    const vars: TemplateVariables = { ...formData };
    
    // Add computed values if height and weight exist
    const altura = parseFloat(String(vars.altura || vars.height || 0));
    const peso = parseFloat(String(vars.peso || vars.weight || 0));
    
    if (altura > 0 && peso > 0) {
      vars.imc = templateFunctions.imc(peso, altura);
      vars.imc_classificacao = templateFunctions.imcClassificacao(vars.imc as number);
    }
    
    return vars;
  }, [formData]);

  // Process text with template variables
  const processTemplate = useCallback((text: string): string => {
    return parseTemplate(text, templateVariables);
  }, [templateVariables]);

  // Process HTML content with templates (sanitize after processing)
  const processTemplateHtml = useCallback((html: string): string => {
    const processed = parseTemplate(html, templateVariables);
    return sanitizeHtml(processed);
  }, [templateVariables]);

  // Common renderer props
  const getRendererProps = (comp: DroppedComponent) => {
    const config = comp.config || {};
    const customId = comp.customId || config.customId;
    const key = customId || comp.id;
    const value = formData[key] || '';
    
    return {
      component: comp,
      config,
      value,
      formData,
      onInputChange: handleInputChange,
      onNavigate: handleNavigateByComponent,
      onNavigateByOption: handleNavigateByOption,
      onSubmit: handleSubmit,
      processTemplate,
      processTemplateHtml,
      designSettings,
      selectedDate,
      onDateChange: (key: string, date: Date | undefined) => {
        setSelectedDate(prev => ({ ...prev, [key]: date }));
        if (date) {
          setFormData(prev => ({ ...prev, [key]: format(date, 'yyyy-MM-dd') }));
        }
      },
    };
  };

  const renderComponent = (comp: DroppedComponent) => {
    const config = comp.config || {};
    const customId = comp.customId || config.customId;
    const key = customId || comp.id;
    const value = formData[key] || '';
    const dateValue = selectedDate[key];
    const rendererProps = getRendererProps(comp);

    switch (comp.type) {
      case 'text':
        return <TextRenderer {...rendererProps} />;

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
        return <InputRenderer {...rendererProps} type={comp.type as 'input' | 'email' | 'phone' | 'number'} />;

      case 'height':
      case 'weight':
        return <MeasurementRenderer {...rendererProps} type={comp.type as 'height' | 'weight'} />;

      case 'textarea':
        return <InputRenderer {...rendererProps} type="textarea" />;

      case 'date':
        return <InputRenderer {...rendererProps} type="date" />;

      case 'button':
        return <ButtonRenderer {...rendererProps} />;

      case 'options':
      case 'single':
      case 'multiple':
        return <OptionsRenderer {...rendererProps} type={comp.type as 'options' | 'single_choice' | 'multiple_choice'} />;

      case 'yesno':
        return <OptionsRenderer {...rendererProps} type="yesno" />;

      case 'slider':
        return <SliderRenderer {...rendererProps} />;

      case 'image':
        return <MediaRenderer {...rendererProps} type="image" />;

      case 'video':
        return <MediaRenderer {...rendererProps} type="video" />;

      case 'spacer':
        return <SpacerRenderer {...rendererProps} />;

      case 'script':
        return <ScriptExecutor scriptCode={config.scriptCode || ''} />;

      case 'webhook_trigger':
        return (
          <WebhookTriggerRenderer
            component={comp}
            quizId={quiz?.id}
            sessionId={sessionId}
            sessionToken={sessionToken}
            formData={formData}
          />
        );

      case 'alert':
        return <AlertRenderer {...rendererProps} />;

      case 'notification':
        return null;

      case 'timer': {
        const timerValue = timerValues[comp.id] ?? (config.timerSeconds || 20);
        return <TimerRenderer {...rendererProps} timerValue={timerValue} />;
      }

      case 'loading': {
        const progress = loadingProgress[comp.id] ?? 0;
        const isActive = loadingActive[comp.id] ?? false;
        return <LoadingRenderer {...rendererProps} loadingProgress={progress} loadingActive={isActive} />;
      }

      case 'level':
        return <LevelRenderer {...rendererProps} />;

      case 'arguments':
        return <ArgumentsRenderer {...rendererProps} />;

      case 'testimonials':
        return <TestimonialsRenderer {...rendererProps} />;

      case 'faq':
        return <FaqRenderer {...rendererProps} />;

      case 'price':
        return <PriceRenderer {...rendererProps} />;

      case 'before-after':
        return <BeforeAfterRenderer {...rendererProps} />;

      case 'carousel':
        return <CarouselRenderer {...rendererProps} />;

      case 'metrics':
        return <MetricsRenderer {...rendererProps} />;

      case 'charts':
        return <ChartsRenderer {...rendererProps} />;

      case 'form':
        return <FormRenderer {...rendererProps} />;

      case 'progress':
        return (
          <ProgressRenderer 
            currentStep={currentStageIndex + 1} 
            totalSteps={stages.length} 
            config={config as any} 
          />
        );

      default:
        return null;
    }
  };

  // Effect to handle notification cycling
  useEffect(() => {
    if (notificationComponents.length === 0) {
      setActiveNotification(null);
      return;
    }

    const notifComp = notificationComponents[0];
    const config = notifComp.config || {};
    const variations = (config as any).notificationVariations || [];
    const duration = ((config as any).notificationDuration || 5) * 1000;
    const interval = ((config as any).notificationInterval || 2) * 1000;

    if (variations.length === 0) return;

    let variationIndex = 0;
    let showTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const showNext = () => {
      setActiveNotification({
        compId: notifComp.id,
        variationIndex,
        visible: true
      });

      hideTimeout = setTimeout(() => {
        setActiveNotification(prev => prev ? { ...prev, visible: false } : null);
        
        variationIndex = (variationIndex + 1) % variations.length;
        showTimeout = setTimeout(showNext, interval);
      }, duration);
    };

    // Start after a short delay
    showTimeout = setTimeout(showNext, 1000);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
    };
  }, [currentStageIndex, notificationComponents.length]);

  // Effect to handle timers countdown
  useEffect(() => {
    const timerComponents = currentStage?.components.filter(c => c.type === 'timer') || [];
    
    if (timerComponents.length === 0) return;
    
    // Initialize timer values
    const initialValues: Record<string, number> = {};
    timerComponents.forEach(comp => {
      const seconds = comp.config?.timerSeconds || 20;
      if (timerValues[comp.id] === undefined) {
        initialValues[comp.id] = seconds;
      }
    });
    
    if (Object.keys(initialValues).length > 0) {
      setTimerValues(prev => ({ ...prev, ...initialValues }));
    }
    
    // Start countdown interval
    const interval = setInterval(() => {
      setTimerValues(prev => {
        const updated = { ...prev };
        timerComponents.forEach(comp => {
          if (updated[comp.id] !== undefined && updated[comp.id] > 0) {
            updated[comp.id] = updated[comp.id] - 1;
          }
        });
        return updated;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentStageIndex, currentStage?.components]);

  // Effect to handle loading progress
  useEffect(() => {
    if (loadingComponents.length === 0) return;
    
    const cleanupFns: (() => void)[] = [];
    
    loadingComponents.forEach(comp => {
      const config = comp.config || {};
      const delay = (config.loadingDelay || 0) * 1000;
      const duration = (config.loadingDuration || 5) * 1000;
      
      // Reset progress and set active
      setLoadingProgress(prev => ({ ...prev, [comp.id]: 0 }));
      setLoadingActive(prev => ({ ...prev, [comp.id]: true }));
      
      // Start after delay
      const delayTimeout = setTimeout(() => {
        const startTime = Date.now();
        const updateInterval = 50; // Update every 50ms for smooth animation
        
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 100);
          
          setLoadingProgress(prev => ({ ...prev, [comp.id]: progress }));
          
          // When complete, navigate
          if (progress >= 100) {
            clearInterval(progressInterval);
            
            // Handle navigation based on config
            const navigation = config.loadingNavigation || 'next';
            
            if (navigation === 'link' && config.loadingDestinationUrl) {
              window.location.href = config.loadingDestinationUrl;
            } else if (navigation === 'submit') {
              handleSubmit();
            } else {
              // Check for flow connection first
              const currentStage = stages[currentStageIndex];
              const connections = currentStage?.connections || [];
              const connection = connections.find(conn => 
                conn.sourceHandle === `comp-${comp.id}`
              );
              
              if (connection) {
                const targetIndex = stages.findIndex(s => s.id === connection.targetId);
                if (targetIndex !== -1) {
                  setCurrentStageIndex(targetIndex);
                  return;
                }
              }
              
              // Default: go to next stage
              if (currentStageIndex < stages.length - 1) {
                setCurrentStageIndex(prev => prev + 1);
              }
            }
          }
        }, updateInterval);
        
        cleanupFns.push(() => clearInterval(progressInterval));
      }, delay);
      
      cleanupFns.push(() => clearTimeout(delayTimeout));
    });
    
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [currentStageIndex, loadingComponents.length]);

  // Effect to handle level component navigation
  useEffect(() => {
    if (levelComponents.length === 0) return;
    
    const cleanupFns: (() => void)[] = [];
    
    levelComponents.forEach(comp => {
      const config = comp.config || {};
      const delay = (config.levelNavigationDelay ?? 2) * 1000;
      const navigation = config.levelNavigation || 'none';
      
      if (navigation === 'none') return;
      
      const delayTimeout = setTimeout(() => {
        if (navigation === 'link' && config.levelDestinationUrl) {
          window.location.href = config.levelDestinationUrl;
        } else if (navigation === 'submit') {
          handleSubmit();
        } else {
          // Check for flow connection first
          const currentStageData = stages[currentStageIndex];
          const connections = currentStageData?.connections || [];
          const connection = connections.find(conn => 
            conn.sourceHandle === `comp-${comp.id}`
          );
          
          if (connection) {
            const targetIndex = stages.findIndex(s => s.id === connection.targetId);
            if (targetIndex !== -1) {
              setCurrentStageIndex(targetIndex);
              return;
            }
          }
          
          // Check for specific stage destination
          if (config.levelDestination === 'specific' && config.levelDestinationStageId) {
            const targetIndex = stages.findIndex(s => s.id === config.levelDestinationStageId);
            if (targetIndex !== -1) {
              setCurrentStageIndex(targetIndex);
              return;
            }
          }
          
          // Default: go to next stage
          if (currentStageIndex < stages.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
          }
        }
      }, delay);
      
      cleanupFns.push(() => clearTimeout(delayTimeout));
    });
    
    return () => {
      cleanupFns.forEach(fn => fn());
    };
  }, [currentStageIndex, levelComponents.length]);

  // Render notification overlay
  const renderNotificationOverlay = () => {
    if (!activeNotification) return null;
    
    const notifComp = notificationComponents.find(c => c.id === activeNotification.compId);
    if (!notifComp) return null;
    
    const config = notifComp.config || {};
    const variations = (config as any).notificationVariations || [];
    const variation = variations[activeNotification.variationIndex];
    if (!variation) return null;
    
    const notificationStyles = {
      default: 'bg-background border-border shadow-lg',
      white: 'bg-white border-gray-200 shadow-lg',
      red: 'bg-red-50 border-red-200',
      blue: 'bg-blue-50 border-blue-200',
      green: 'bg-green-50 border-green-200',
      yellow: 'bg-yellow-50 border-yellow-200',
      gray: 'bg-gray-50 border-gray-200',
    };
    
    const style = (config as any).notificationStyle || 'default';
    const position = (config as any).notificationPosition || 'default';
    
    const title = ((config as any).notificationTitle || '@1 acabou de se cadastrar via @2!')
      .replace(/@1/g, variation.name)
      .replace(/@2/g, variation.platform)
      .replace(/@3/g, variation.number);
      
    const description = ((config as any).notificationDescription || '')
      .replace(/@1/g, variation.name)
      .replace(/@2/g, variation.platform)
      .replace(/@3/g, variation.number);
    
    const positionClasses = {
      default: 'bottom-4 left-4 right-4',
      top: 'top-4 left-4 right-4',
      bottom: 'bottom-4 left-4 right-4',
    };
    
    return (
      <div 
        className={cn(
          "fixed z-50 max-w-sm transition-all duration-300",
          positionClasses[position as keyof typeof positionClasses],
          activeNotification.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div 
          className={cn(
            "rounded-lg border p-4 relative overflow-hidden",
            notificationStyles[style as keyof typeof notificationStyles]
          )}
        >
          <div className="space-y-1">
            <p className="font-semibold text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(title.replace(variation.name, `<strong>${variation.name}</strong>`)) }} />
            {description && (
              <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description.replace(variation.number, `<strong>${variation.number}</strong>`)) }} />
            )}
          </div>
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary/50 animate-shrink"
              style={{ 
                animation: activeNotification.visible ? `shrink ${(config as any).notificationDuration || 5}s linear forwards` : 'none'
              }} 
            />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isInactive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background px-4">
        <div className="text-6xl">🚧</div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Voltamos em breve!</h1>
          <p className="text-muted-foreground text-sm max-w-md">
            Este quiz está temporariamente indisponível. Por favor, volte mais tarde.
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Este quiz não tem etapas</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  const progressValue = stages.length > 1 ? ((currentStageIndex + 1) / stages.length) * 100 : 100;
  const hideProgressBar = designSettings.hideProgressBar ?? false;
  const showHeader = (!hideProgressBar && pageSettings?.showProgress) || (pageSettings?.allowBack && currentStageIndex > 0) || designSettings.logo?.value;

  // Render back icon based on settings
  const renderBackIcon = (settings: typeof designSettings) => {
    const iconStyle = settings.backIcon?.style || 'chevron';
    const iconSize = settings.backIcon?.size || 'medium';
    const sizeMap = { small: 'w-4 h-4', medium: 'w-5 h-5', large: 'w-6 h-6' };
    const className = sizeMap[iconSize];
    
    switch (iconStyle) {
      case 'arrow':
        return <ArrowLeft className={className} />;
      case 'circle':
        return <ArrowLeftCircle className={className} />;
      case 'chevron':
      default:
        return <ChevronLeft className={className} />;
    }
  };

  // Get background styles for current stage
  const getBackgroundStyles = () => {
    const bg = currentStage?.background;
    if (!bg) return { main: { backgroundColor: designSettings.backgroundColor }, overlay: null };
    
    const main: React.CSSProperties = {};
    if (bg.type === 'color') {
      main.backgroundColor = bg.color;
    } else if (bg.type === 'gradient') {
      const stops = bg.gradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
      main.background = bg.gradientType === 'linear' 
        ? `linear-gradient(${bg.gradientAngle}deg, ${stops})`
        : `radial-gradient(circle, ${stops})`;
    } else if (bg.type === 'image' && bg.imageUrl) {
      main.backgroundImage = `url(${bg.imageUrl})`;
      main.backgroundSize = bg.imageSize;
      main.backgroundPosition = bg.imagePosition;
      main.backgroundRepeat = bg.imageRepeat;
    }

    let overlay: React.CSSProperties | null = null;
    if (bg.overlayEnabled) {
      const opacity = (bg.overlayOpacity || 50) / 100;
      overlay = { position: 'absolute', inset: 0, pointerEvents: 'none', opacity };
      if (bg.overlayType === 'color') {
        overlay.backgroundColor = bg.overlayColor;
      } else {
        const stops = bg.overlayGradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
        overlay.background = bg.overlayGradientType === 'linear'
          ? `linear-gradient(${bg.overlayGradientAngle}deg, ${stops})`
          : `radial-gradient(circle, ${stops})`;
      }
    }
    return { main, overlay };
  };

  const bgStyles = getBackgroundStyles();

  // Get fonts with backwards compatibility
  const titleFont = designSettings.titleFont || designSettings.primaryFont || 'Montserrat';
  const bodyFont = designSettings.bodyFont || designSettings.secondaryFont || 'Inter';

  return (
    <div 
      ref={ref}
      className="min-h-screen flex flex-col relative"
      style={{ 
        color: designSettings.textColor,
        fontFamily: bodyFont,
        fontSize: `${designSettings.fontSize}px`,
        '--quiz-title-font': titleFont,
        '--quiz-body-font': bodyFont,
        '--quiz-title-color': designSettings.titleColor,
        '--quiz-text-color': designSettings.textColor,
        ...bgStyles.main,
      } as React.CSSProperties}
    >
      {/* Background overlay */}
      {bgStyles.overlay && <div style={bgStyles.overlay} />}
      {/* Header */}
      {showHeader && (
        <>
          {/* Line Style - Thin progress bar at the very top */}
          {!hideProgressBar && designSettings.headerStyle === 'line' && pageSettings?.showProgress && (
            <div className="shrink-0">
              <div 
                className="h-1 w-full"
                style={{ backgroundColor: `${designSettings.primaryColor}20` }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${progressValue}%`,
                    backgroundColor: designSettings.primaryColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* When progress bar is hidden - standalone back icon with custom position */}
          {hideProgressBar && (pageSettings?.allowBack && currentStageIndex > 0 || designSettings.logo?.value) && (() => {
            const logoSpacing = designSettings.logoSpacing || { marginTop: 16, marginBottom: 8, paddingX: 16 };
            const backIconPosition = designSettings.backIcon?.position || 'left';
            
            return (
              <div 
                className="shrink-0"
                style={{ 
                  borderBottom: designSettings.headerDivider?.show !== false 
                    ? `${designSettings.headerDivider?.thickness || 1}px solid ${designSettings.headerDivider?.color || designSettings.primaryColor}20`
                    : 'none'
                }}
              >
                {/* Logo row */}
                {designSettings.logo?.value && (
                  <div 
                    className={cn(
                      "flex items-center",
                      designSettings.logoPosition === 'center' && "justify-center",
                      designSettings.logoPosition === 'right' && "justify-end",
                      designSettings.logoPosition === 'left' && "justify-start"
                    )}
                    style={{
                      marginTop: `${logoSpacing.marginTop}px`,
                      marginBottom: `${logoSpacing.marginBottom}px`,
                      paddingLeft: `${logoSpacing.paddingX}px`,
                      paddingRight: `${logoSpacing.paddingX}px`,
                    }}
                  >
                    {designSettings.logo.type === 'emoji' ? (
                      <span style={{ fontSize: `${designSettings.logoSizePixels || 40}px`, lineHeight: 1 }}>
                        {designSettings.logo.value}
                      </span>
                    ) : (
                      <img 
                        src={designSettings.logo.value} 
                        alt="Logo" 
                        className="object-contain"
                        style={{ height: `${designSettings.logoSizePixels || 40}px` }}
                      />
                    )}
                  </div>
                )}
                
                {/* Back icon row - positioned independently */}
                {pageSettings?.allowBack && currentStageIndex > 0 && (
                  <div 
                    className={cn(
                      "flex items-center",
                      backIconPosition === 'center' && "justify-center",
                      backIconPosition === 'right' && "justify-end",
                      backIconPosition === 'left' && "justify-start"
                    )}
                    style={{ padding: '15px' }}
                  >
                    <button 
                      onClick={handleBack}
                      className="p-1 rounded transition-colors hover:opacity-70"
                      style={{ color: designSettings.backIcon?.color || designSettings.textColor }}
                    >
                      {renderBackIcon(designSettings)}
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Other header styles (when progress bar is NOT hidden) */}
          {!hideProgressBar && designSettings.headerStyle !== 'line' && (() => {
            const logoSpacing = designSettings.logoSpacing || { marginTop: 16, marginBottom: 8, paddingX: 16 };
            const logoLayout = designSettings.logoLayout || 'above';
            
            const renderLogoElement = () => {
              if (!designSettings.logo?.value) return null;
              return designSettings.logo.type === 'emoji' ? (
                <span style={{ fontSize: `${designSettings.logoSizePixels || 40}px`, lineHeight: 1 }}>
                  {designSettings.logo.value}
                </span>
              ) : (
                <img 
                  src={designSettings.logo.value} 
                  alt="Logo" 
                  className="object-contain"
                  style={{ height: `${designSettings.logoSizePixels || 40}px` }}
                />
              );
            };

            return (
              <div 
                className="shrink-0"
                style={{ 
                  borderBottom: designSettings.headerDivider?.show !== false 
                    ? `${designSettings.headerDivider?.thickness || 1}px solid ${designSettings.headerDivider?.color || designSettings.primaryColor}20`
                    : 'none'
                }}
              >
                {/* Logo above bar layout */}
                {logoLayout === 'above' && designSettings.logo?.value && (
                  <div 
                    className={cn(
                      "flex items-center",
                      designSettings.logoPosition === 'center' && "justify-center",
                      designSettings.logoPosition === 'right' && "justify-end",
                      designSettings.logoPosition === 'left' && "justify-start"
                    )}
                    style={{
                      marginTop: `${logoSpacing.marginTop}px`,
                      marginBottom: `${logoSpacing.marginBottom}px`,
                      paddingLeft: `${logoSpacing.paddingX}px`,
                      paddingRight: `${logoSpacing.paddingX}px`,
                    }}
                  >
                    {renderLogoElement()}
                  </div>
                )}

                {/* Progress bar row */}
                <div className="px-4 pb-3 flex items-center gap-3">
                  {pageSettings?.allowBack && currentStageIndex > 0 && (
                    <button 
                      onClick={handleBack} 
                      className="p-1 rounded transition-colors"
                      style={{ color: designSettings.backIcon?.color || designSettings.textColor }}
                    >
                      {renderBackIcon(designSettings)}
                    </button>
                  )}

                  {/* Logo inline (when layout is inline) */}
                  {logoLayout === 'inline' && designSettings.logo?.value && renderLogoElement()}

                  {/* Progress indicators */}
                  {pageSettings?.showProgress && (
                    <>
                      {(designSettings.headerStyle === 'default' || !designSettings.headerStyle) && (
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${designSettings.primaryColor}20` }}>
                          <div 
                            className="h-full transition-all duration-300"
                            style={{ 
                              width: `${progressValue}%`,
                              backgroundColor: designSettings.primaryColor,
                            }}
                          />
                        </div>
                      )}

                      {designSettings.headerStyle === 'minimal' && (
                        <div className="flex-1 flex justify-center">
                          <span 
                            className="text-sm font-medium"
                            style={{ color: designSettings.textColor }}
                          >
                            {currentStageIndex + 1} / {stages.length}
                          </span>
                        </div>
                      )}

                      {designSettings.headerStyle === 'steps' && (
                        <div className="flex-1 flex items-center justify-center gap-2">
                          {stages.map((_, index) => (
                            <div
                              key={index}
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: index === currentStageIndex ? '24px' : '8px',
                                backgroundColor: index <= currentStageIndex 
                                  ? designSettings.primaryColor 
                                  : `${designSettings.primaryColor}30`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Logo below bar layout */}
                {logoLayout === 'below' && designSettings.logo?.value && (
                  <div 
                    className={cn(
                      "flex items-center",
                      designSettings.logoPosition === 'center' && "justify-center",
                      designSettings.logoPosition === 'right' && "justify-end",
                      designSettings.logoPosition === 'left' && "justify-start"
                    )}
                    style={{
                      marginTop: `${logoSpacing.marginTop}px`,
                      marginBottom: `${logoSpacing.marginBottom}px`,
                      paddingLeft: `${logoSpacing.paddingX}px`,
                      paddingRight: `${logoSpacing.paddingX}px`,
                    }}
                  >
                    {renderLogoElement()}
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col quiz-content">
        <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-4">
          <div className="w-full max-w-md">
            {/* Stage components */}
            <div className="flex flex-wrap gap-2">
              {currentStage?.components.map((comp) => {
                const config = comp.config || {};
                const widthValue = config.width || 100;
                const horizontalAlign = config.horizontalAlign || 'start';
                const verticalAlign = config.verticalAlign || 'auto';
                
                const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
                const alignClass = verticalAlign === 'center' ? 'items-center' : verticalAlign === 'end' ? 'items-end' : verticalAlign === 'start' ? 'items-start' : '';
                
                return (
                  <div 
                    key={comp.id}
                    style={{ 
                      width: widthValue === 100 ? '100%' : `calc(${widthValue}% - 4px)`,
                      flexShrink: 0,
                    }}
                    className={cn(
                      "flex",
                      justifyClass,
                      alignClass
                    )}
                  >
                    <div className="w-full">
                      {renderComponent(comp)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      
      {/* Notification overlay */}
      {renderNotificationOverlay()}
    </div>
  );
});

QuizPlayer.displayName = 'QuizPlayer';
