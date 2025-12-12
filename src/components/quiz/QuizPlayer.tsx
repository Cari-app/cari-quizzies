import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CalendarIcon, ChevronLeft, ChevronRight, ChevronUp, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize';
import { parseTemplate, templateFunctions, TemplateVariables } from '@/lib/templateParser';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import useEmblaCarousel from 'embla-carousel-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { CarouselPlayer } from './CarouselPlayer';
import { MetricsPlayer } from './MetricsPlayer';
import { ChartPlayer } from './ChartPlayer';
import { SlidingRuler } from './SlidingRuler';
import { ScriptExecutor } from './ScriptExecutor';

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
  // Options appearance
  optionStyle?: 'simple' | 'card' | 'image';
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
  // Price specific
  priceTitle?: string;
  pricePrefix?: string;
  priceValue?: string;
  priceSuffix?: string;
  priceHighlight?: string;
  priceType?: 'illustrative' | 'redirect';
  priceRedirectUrl?: string;
  priceLayout?: 'horizontal' | 'vertical';
  priceStyle?: 'theme' | 'red' | 'info' | 'success' | 'warning';
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
  logo: {
    type: 'image' | 'url' | 'emoji';
    value: string;
  };
  logoSize: 'small' | 'medium' | 'large';
  logoPosition: 'left' | 'center' | 'right';
  progressBar: 'hidden' | 'top' | 'bottom';
  
  // CORES
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  
  // TIPOGRAFIA
  fontSize: number;
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  primaryFont: string;
  secondaryFont: string;
}

const defaultDesignSettings: DesignSettings = {
  alignment: 'center',
  maxWidth: 'small',
  elementSize: 'medium',
  spacing: 'normal',
  borderRadius: 'medium',
  logo: { type: 'url', value: '' },
  logoSize: 'medium',
  logoPosition: 'center',
  progressBar: 'top',
  primaryColor: '#A855F7',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleColor: '#A855F7',
  fontSize: 16,
  titleSize: 'medium',
  primaryFont: 'Inter',
  secondaryFont: 'Inter',
};

interface StageConnection {
  targetId: string;
  sourceHandle?: string;
}

interface QuizStage {
  id: string;
  titulo: string | null;
  ordem: number;
  components: DroppedComponent[];
  pageSettings?: PageSettings;
  designSettings?: DesignSettings;
  connections?: StageConnection[];
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
}

function FaqAccordion({ faqItems, widthValue, justifyClass, detailType, firstOpen }: FaqAccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(firstOpen && faqItems[0] ? [faqItems[0].id] : []);
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div className="space-y-2" style={{ width: `${widthValue}%` }}>
        {faqItems.map((item) => {
          const isOpen = openItems.includes(item.id);
          return (
            <div key={item.id} className="border border-border rounded-lg overflow-hidden bg-background">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => toggleItem(item.id)}
              >
                <span className="font-medium text-sm">{item.question}</span>
                {detailType === 'arrow' ? (
                  <ChevronUp className={cn("w-4 h-4 text-muted-foreground transition-transform", !isOpen && "rotate-180")} />
                ) : (
                  isOpen ? <Minus className="w-4 h-4 text-muted-foreground" /> : <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuizPlayer({ slug }: QuizPlayerProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
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

  const currentStage = stages[currentStageIndex];
  const pageSettings = currentStage?.pageSettings;
  const notificationComponents = currentStage?.components.filter(c => c.type === 'notification') || [];
  const loadingComponents = currentStage?.components.filter(c => c.type === 'loading') || [];

  // Load quiz by slug or id from Supabase
  useEffect(() => {
    const loadQuiz = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        // Try to find by slug first
        let { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        // If not found by slug, try by id
        if (!quizData) {
          const { data } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', slug)
            .eq('is_active', true)
            .maybeSingle();
          quizData = data;
        }

        if (!quizData) {
          setNotFound(true);
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

  const handleNext = () => {
    if (currentStageIndex < stages.length - 1) {
      const nextIndex = currentStageIndex + 1;
      setCurrentStageIndex(nextIndex);
      setNavigationHistory(prev => [...prev, nextIndex]);
    }
  };

  // Navigate based on flow connections
  const handleNavigateByComponent = (componentId: string) => {
    const currentStage = stages[currentStageIndex];
    const connections = currentStage?.connections || [];
    
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
        return;
      }
    }
    
    // Default: go to next stage
    handleNext();
  };

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

  const handleSubmit = () => {
    console.log('Form data submitted:', formData);
    // TODO: Save responses to database
    navigate('/');
  };

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

  const renderComponent = (comp: DroppedComponent) => {
    const config = comp.config || {};
    const customId = comp.customId || config.customId;
    const key = customId || comp.id;
    const value = formData[key] || '';
    const dateValue = selectedDate[key];

    switch (comp.type) {
      case 'text':
        return (
          <div className={cn(
            "py-4",
            config.textAlign === 'center' && 'text-center',
            config.textAlign === 'right' && 'text-right'
          )}>
            <div 
              className="rich-text text-foreground"
              dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.content || '') }}
            />
          </div>
        );

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-2" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <Input
              type={comp.type === 'email' ? 'email' : comp.type === 'number' ? 'number' : 'text'}
              placeholder={processTemplate(config.placeholder || '')}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{processTemplate(config.helpText)}</p>}
          </div>
        );

      case 'height':
      case 'weight': {
        const isRulerLayout = config.layoutType === 'ruler';
        const unit = config.unit || (comp.type === 'height' ? 'cm' : 'kg');
        const altUnit = comp.type === 'height' ? 'pol' : 'lb';
        const minVal = config.minValue || (comp.type === 'height' ? 100 : 30);
        const maxVal = config.maxValue || (comp.type === 'height' ? 220 : 200);
        const defaultVal = config.defaultValue || (comp.type === 'height' ? 170 : 70);
        const currentValue = typeof value === 'number' ? value : defaultVal;
        
        if (isRulerLayout) {
          return (
            <div className="py-4">
              <SlidingRuler
                value={currentValue}
                onChange={(val) => handleInputChange(comp.id, customId, val)}
                min={minVal}
                max={maxVal}
                step={1}
                unit={unit}
                altUnit={altUnit}
                barColor={config.barColor}
              />
              {config.helpText && <p className="text-xs text-muted-foreground mt-1 text-center">{processTemplate(config.helpText)}</p>}
            </div>
          );
        }
        
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-2" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <Input
              type="number"
              placeholder={processTemplate(config.placeholder || '')}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{processTemplate(config.helpText)}</p>}
          </div>
        );
      }

      case 'textarea':
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-2" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <textarea
              placeholder={processTemplate(config.placeholder || '')}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm resize-none min-h-[100px]"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{processTemplate(config.helpText)}</p>}
          </div>
        );

      case 'date':
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-2" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-sm flex items-center justify-between transition-colors hover:border-primary/50",
                    !dateValue && "text-muted-foreground"
                  )}
                >
                  <span>{dateValue ? format(dateValue, 'dd/MM/yyyy', { locale: ptBR }) : 'dd/mm/aaaa'}</span>
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => handleDateChange(comp.id, customId, date)}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{processTemplate(config.helpText)}</p>}
          </div>
        );

      case 'button':
        const buttonAction = config.buttonAction || 'next';
        return (
          <div className="py-4">
            <Button
              onClick={() => {
                if (buttonAction === 'submit') {
                  handleSubmit();
                } else {
                  handleNavigateByComponent(comp.id);
                }
              }}
              className={cn(
                "w-full",
                config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
                config.buttonStyle === 'outline' && "border border-border bg-transparent"
              )}
            >
              {processTemplate(config.buttonText || 'Continuar')}
            </Button>
          </div>
        );

      case 'options':
      case 'single':
      case 'multiple': {
        const isMultiple = comp.type === 'multiple' || config.allowMultiple;
        const selectedValues = isMultiple ? (Array.isArray(value) ? value : []) : null;
        
        const optionStyle = config.optionStyle || 'simple';
        const optionLayout = config.optionLayout || 'list';
        const optionOrientation = config.optionOrientation || 'horizontal';
        const optionBorderRadius = config.optionBorderRadius || 'small';
        const optionShadow = config.optionShadow || 'none';
        const optionSpacing = config.optionSpacing || 'simple';
        const detailType = config.detailType || 'checkbox';
        const detailPosition = config.detailPosition || 'start';
        const imagePosition = config.imagePosition || 'top';
        const imageRatio = config.imageRatio || '1:1';
        const autoAdvance = config.autoAdvance !== false && !isMultiple;
        const isVertical = optionOrientation === 'vertical';
        
        const getBorderRadius = () => {
          switch (optionBorderRadius) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-md';
            case 'medium': return 'rounded-lg';
            case 'large': return 'rounded-xl';
            case 'full': return 'rounded-full';
            default: return 'rounded-md';
          }
        };
        
        const getShadow = () => {
          switch (optionShadow) {
            case 'sm': return 'shadow-sm';
            case 'md': return 'shadow-md';
            case 'lg': return 'shadow-lg';
            default: return '';
          }
        };
        
        const getSpacing = () => {
          switch (optionSpacing) {
            case 'compact': return 'gap-1';
            case 'relaxed': return 'gap-4';
            default: return 'gap-2';
          }
        };
        
        const getLayoutClass = () => {
          switch (optionLayout) {
            case 'grid-2': return 'grid grid-cols-2';
            case 'grid-3': return 'grid grid-cols-3';
            case 'grid-4': return 'grid grid-cols-4';
            default: return 'flex flex-col';
          }
        };
        
        const getImageRatioClass = () => {
          switch (imageRatio) {
            case '16:9': return 'aspect-video';
            case '4:3': return 'aspect-[4/3]';
            case '3:2': return 'aspect-[3/2]';
            default: return 'aspect-square';
          }
        };
        
        const handleOptionClick = (optValue: string) => {
          if (isMultiple) {
            const newValues = selectedValues!.includes(optValue)
              ? selectedValues!.filter((v: string) => v !== optValue)
              : [...selectedValues!, optValue];
            handleInputChange(comp.id, customId, newValues);
          } else {
            handleInputChange(comp.id, customId, optValue);
            if (autoAdvance) {
              setTimeout(() => handleNavigateByComponent(comp.id), 300);
            }
          }
        };
        
        const isOptionSelected = (optValue: string) => {
          if (isMultiple) {
            return selectedValues!.includes(optValue);
          }
          return value === optValue;
        };
        
        const renderDetail = (isSelected: boolean, index: number) => {
          if (detailType === 'none') return null;
          
          if (detailType === 'number') {
            return (
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0",
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
              )}>
                {index + 1}
              </div>
            );
          }
          
          return (
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0",
              detailType === 'radio' || !isMultiple ? "rounded-full" : "rounded",
              isSelected ? "border-primary bg-primary" : "border-border"
            )}>
              {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
            </div>
          );
        };
        
        const renderOptionMedia = (opt: OptionItem, vertical = false) => {
          if (opt.mediaType === 'icon' && opt.icon) {
            return <span className={cn("shrink-0", vertical ? "text-2xl" : "text-lg")}>{opt.icon}</span>;
          }
          if (opt.mediaType === 'image' && opt.imageUrl) {
            return <img src={opt.imageUrl} alt="" className={cn("object-cover rounded shrink-0", vertical ? "w-10 h-10" : "w-6 h-6")} />;
          }
          return null;
        };
        
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-1" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            {config.description && <div className="rich-text text-xs text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.description) }} />}
            <div className={cn(getLayoutClass(), getSpacing())}>
              {(config.options || []).map((opt, i) => {
                const isSelected = isOptionSelected(opt.value);
                
                if (optionStyle === 'image') {
                  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.value)}
                      className={cn(
                        "border text-sm transition-colors overflow-hidden text-left",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50",
                        isHorizontal ? "flex" : "flex flex-col"
                      )}
                    >
                      {(imagePosition === 'top' || imagePosition === 'left') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20 shrink-0" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                      <div className={cn(
                        "p-3 flex items-center gap-2 flex-1",
                        detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {renderDetail(isSelected, i)}
                        {renderOptionMedia(opt)}
                        <span className="flex-1">{opt.text}</span>
                      </div>
                      {(imagePosition === 'bottom' || imagePosition === 'right') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20 shrink-0" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                    </button>
                  );
                }
                
                if (optionStyle === 'card') {
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionClick(opt.value)}
                      className={cn(
                        "p-4 border text-sm transition-colors",
                        isVertical ? "text-center" : "text-left",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        isVertical 
                          ? "flex flex-col items-center gap-2" 
                          : "flex items-center gap-3",
                        !isVertical && detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {isVertical && renderOptionMedia(opt, true)}
                        {!isVertical && renderDetail(isSelected, i)}
                        {!isVertical && renderOptionMedia(opt)}
                        <span className={cn(!isVertical && "flex-1")}>{opt.text}</span>
                        {isVertical && renderDetail(isSelected, i)}
                      </div>
                    </button>
                  );
                }
                
                // Simple style
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.value)}
                    className={cn(
                      "p-3 border text-sm transition-colors",
                      isVertical ? "text-center" : "text-left",
                      getBorderRadius(),
                      getShadow(),
                      isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      isVertical 
                        ? "flex flex-col items-center gap-2" 
                        : "flex items-center gap-3",
                      !isVertical && detailPosition === 'end' && "flex-row-reverse"
                    )}>
                      {isVertical && renderOptionMedia(opt, true)}
                      {!isVertical && renderDetail(isSelected, i)}
                      {!isVertical && renderOptionMedia(opt)}
                      <span className={cn(!isVertical && "flex-1")}>{opt.text}</span>
                      {isVertical && renderDetail(isSelected, i)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 'yesno':
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-3" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <div className="flex gap-3">
              {(config.options || [{ id: '1', text: 'Sim', value: 'yes' }, { id: '2', text: 'Não', value: 'no' }]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleInputChange(comp.id, customId, opt.value)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-colors",
                    value === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:border-primary/50"
                  )}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'slider':
        const sliderValue = typeof value === 'number' ? value : config.sliderMin || 0;
        return (
          <div className="py-4">
            {config.label && <div className="rich-text text-sm font-medium mb-2" dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} />}
            <div className="pt-4">
              <Slider
                value={[sliderValue]}
                onValueChange={(vals) => handleInputChange(comp.id, customId, vals[0])}
                min={config.sliderMin || 0}
                max={config.sliderMax || 100}
                step={config.sliderStep || 1}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{config.sliderMin || 0}</span>
                <span className="font-medium text-foreground">{sliderValue}</span>
                <span>{config.sliderMax || 100}</span>
              </div>
            </div>
          </div>
        );

      case 'image': {
        if (!config.mediaUrl) return null;
        const isEmoji = config.mediaUrl.length <= 4 && !/^https?:\/\//.test(config.mediaUrl);
        return (
          <div className="py-4">
            {isEmoji ? (
              <div className="flex items-center justify-center py-4">
                <span className="text-6xl">{config.mediaUrl}</span>
              </div>
            ) : (
              <img src={config.mediaUrl} alt={config.altText || ''} className="w-full rounded-lg" />
            )}
          </div>
        );
      }

      case 'video': {
        // If embed code is provided, use it
        if (config.videoType === 'embed' && config.embedCode) {
          return (
            <div className="py-4">
              <div 
                className="w-full aspect-video rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: sanitizeEmbed(config.embedCode) }}
              />
            </div>
          );
        }
        
        // If URL is provided, try to convert to embed
        if (config.mediaUrl) {
          const url = config.mediaUrl;
          
          // YouTube
          const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (youtubeMatch) {
            return (
              <div className="py-4">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // Vimeo
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch) {
            return (
              <div className="py-4">
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                  className="w-full aspect-video rounded-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // Panda Video - check for various formats
          if (url.includes('pandavideo') || url.includes('player-vz')) {
            // If it's already an embed URL, use it directly
            const pandaMatch = url.match(/player-vz-[a-z0-9-]+\.tv\.pandavideo\.com\.br\/embed\/\?v=([a-f0-9-]+)/i);
            if (pandaMatch) {
              return (
                <div className="py-4">
                  <iframe
                    src={url}
                    className="w-full aspect-video rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
            // Try to extract video ID
            const pandaIdMatch = url.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (pandaIdMatch) {
              return (
                <div className="py-4">
                  <iframe
                    src={url}
                    className="w-full aspect-video rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }
          }
          
          // Vturb
          if (url.includes('vturb.com')) {
            return (
              <div className="py-4">
                <iframe
                  src={url}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // Default: try as direct video or iframe
          if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            return (
              <div className="py-4">
                <video src={url} controls className="w-full rounded-lg" />
              </div>
            );
          }
          
          // Fallback: use as iframe source
          return (
            <div className="py-4">
              <iframe
                src={url}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        
        return null;
      }

      case 'spacer':
        return <div style={{ height: config.height || 24 }} />;

      case 'script':
        // Script component - executes on mount, shows nothing visually
        return <ScriptExecutor scriptCode={config.scriptCode || ''} />;

      case 'alert': {
        const alertStyles = {
          red: 'bg-red-50 border-red-200 text-red-700',
          yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          green: 'bg-green-50 border-green-200 text-green-700',
          blue: 'bg-blue-50 border-blue-200 text-blue-700',
          gray: 'bg-gray-50 border-gray-200 text-gray-700',
        };
        const paddingStyles = {
          compact: 'p-2',
          default: 'p-4',
          relaxed: 'p-6',
        };
        const style = (config as any).alertStyle || 'red';
        const padding = (config as any).alertPadding || 'default';
        
        return (
          <div className="w-full">
            <div 
              className={cn(
                "rounded-lg border",
                alertStyles[style as keyof typeof alertStyles],
                paddingStyles[padding as keyof typeof paddingStyles],
                (config as any).alertHighlight && "ring-2 ring-offset-2 ring-current"
              )}
            >
              <div 
                className="text-sm rich-text"
                dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.description || 'Texto do alerta') }}
              />
            </div>
          </div>
        );
      }

      case 'notification': {
        // Notification is rendered as an overlay, not inline
        // It will be handled by a separate effect
        return null;
      }

      case 'timer': {
        const timerStyles = {
          default: 'bg-primary text-primary-foreground',
          red: 'bg-red-100 text-red-700 border border-red-200',
          blue: 'bg-blue-100 text-blue-700 border border-blue-200',
          green: 'bg-green-100 text-green-700 border border-green-200',
          yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
          gray: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
        
        const style = config.timerStyle || 'red';
        const text = config.timerText || 'Resgate agora seu desconto: [time]';
        
        // Get timer value from state
        const timerValue = timerValues[comp.id] ?? (config.timerSeconds || 20);
        
        // Format seconds to MM:SS
        const minutes = Math.floor(timerValue / 60);
        const remainingSeconds = timerValue % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        
        // Replace [time] with formatted time
        const displayText = text.replace('[time]', formattedTime);
        
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const justifyClass = {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
        }[horizontalAlign];
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div 
              className={cn(
                "rounded-lg px-4 py-3 text-center font-medium",
                timerStyles[style as keyof typeof timerStyles]
              )}
              style={{ width: `${widthValue}%` }}
            >
              {displayText}
            </div>
          </div>
        );
      }

      case 'loading': {
        const widthValue = config.width || 100;
        const title = processTemplate(config.loadingTitle || 'Carregando...');
        const description = processTemplate(config.loadingDescription || '');
        const showTitle = config.showLoadingTitle !== false;
        const showProgress = config.showLoadingProgress !== false;
        const horizontalAlign = config.horizontalAlign || 'start';
        
        const progress = loadingProgress[comp.id] ?? 0;
        
        const justifyClass = {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
        }[horizontalAlign];
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div 
              className="border border-border rounded-lg p-4 bg-background"
              style={{ width: `${widthValue}%` }}
            >
              {showTitle && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{title}</span>
                  <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
                </div>
              )}
              {showProgress && (
                <Progress value={progress} className="h-2 mb-3" />
              )}
              {description && (
                <p className="text-sm text-muted-foreground text-center">{description}</p>
              )}
            </div>
          </div>
        );
      }

      case 'level': {
        const title = processTemplate(config.levelTitle || 'Nível');
        const subtitle = processTemplate(config.levelSubtitle || '');
        const percentage = config.levelPercentage ?? 75;
        const indicatorText = processTemplate(config.levelIndicatorText || '');
        const legendsStr = config.levelLegends || '';
        const legends = legendsStr ? legendsStr.split(',').map((l: string) => processTemplate(l.trim())).filter(Boolean) : [];
        const showMeter = config.showLevelMeter !== false;
        const showProgress = config.showLevelProgress !== false;
        const levelType = config.levelType || 'line';
        const levelColor = config.levelColor || 'theme';
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        
        const justifyClass = {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
        }[horizontalAlign];
        
        // Get gradient/color based on levelColor
        const getBarBackground = () => {
          switch (levelColor) {
            case 'green-red':
              return 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)';
            case 'red-green':
              return 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)';
            case 'opaque':
              return 'hsl(var(--foreground))';
            case 'red':
              return '#ef4444';
            case 'blue':
              return '#3b82f6';
            case 'green':
              return '#22c55e';
            case 'yellow':
              return '#eab308';
            default:
              return 'hsl(var(--foreground))';
          }
        };
        
        const renderLineBar = () => (
          <div className="relative w-full">
            {/* Indicator text tooltip */}
            {indicatorText && (
              <div 
                className="absolute -top-8 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                style={{ left: `${percentage}%` }}
              >
                {indicatorText}
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"
                />
              </div>
            )}
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full absolute left-0 top-0"
                style={{ 
                  width: `${percentage}%`,
                  background: getBarBackground()
                }}
              />
            </div>
            {/* Indicator circle - only shown when showMeter is true */}
            {showMeter && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${percentage}% - 8px)` }}
              />
            )}
          </div>
        );
        
        const renderSegmentsBar = () => {
          const segmentCount = legends.length > 0 ? legends.length : 5;
          const filledSegments = Math.ceil((percentage / 100) * segmentCount);
          
          return (
            <div className="relative w-full">
            {/* Indicator text tooltip */}
              {indicatorText && (
                <div 
                  className="absolute -top-8 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                  style={{ left: `${percentage}%` }}
                >
                  {indicatorText}
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"
                  />
                </div>
              )}
              <div className="flex gap-1 w-full relative">
                {Array.from({ length: segmentCount }, (_, i) => {
                  const isFilled = i < filledSegments;
                  
                  return (
                    <div 
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        isFilled ? "" : "bg-muted"
                      )}
                      style={isFilled ? { background: levelColor === 'theme' || levelColor === 'opaque' ? 'hsl(var(--foreground))' : getBarBackground() } : undefined}
                    />
                  );
                })}
                {/* Indicator circle - only shown when showMeter is true */}
                {showMeter && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full shadow-md pointer-events-none"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                  />
                )}
              </div>
            </div>
          );
        };
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div 
              className="border border-border rounded-lg p-4 bg-background"
              style={{ width: `${widthValue}%` }}
            >
              {/* Header with title and percentage */}
              <div className="flex justify-between items-start mb-1">
                <div className="font-semibold text-sm">{title}</div>
                {showProgress && (
                  <div className="text-sm text-muted-foreground">{percentage}%</div>
                )}
              </div>
              
              {/* Subtitle */}
              {subtitle && (
                <div className="text-sm text-muted-foreground mb-2">{subtitle}</div>
              )}
              
              {/* Level bar - always visible */}
              <div className={cn("mt-2", indicatorText && showMeter ? "pt-6" : "")}>
                {levelType === 'segments' ? renderSegmentsBar() : renderLineBar()}
              </div>
              
              {/* Legends */}
              {legends.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  {legends.join(' · ')}
                </div>
              )}
            </div>
          </div>
        );
      }

      case 'arguments': {
        const argumentItems = (config.argumentItems || []) as Array<{
          id: string;
          title: string;
          description: string;
          mediaType: 'none' | 'emoji' | 'image';
          emoji?: string;
          imageUrl?: string;
        }>;
        const layout = config.argumentLayout || 'grid-2';
        const disposition = config.argumentDisposition || 'image-text';
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        
        const justifyClass = {
          start: 'justify-start',
          center: 'justify-center',
          end: 'justify-end',
        }[horizontalAlign];
        
        const gridClass = {
          'list': 'grid-cols-1',
          'grid-2': 'grid-cols-2',
          'grid-3': 'grid-cols-3',
          'grid-4': 'grid-cols-4',
        }[layout] || 'grid-cols-2';
        
        const isVertical = disposition === 'image-text' || disposition === 'text-image';
        const imageFirst = disposition === 'image-text' || disposition === 'image-left';
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div 
              className={cn("grid gap-3", gridClass)}
              style={{ width: `${widthValue}%` }}
            >
              {argumentItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "border border-primary/30 rounded-lg p-4 bg-background flex",
                    isVertical ? "flex-col" : "flex-row gap-3",
                    !imageFirst && isVertical && "flex-col-reverse",
                    !imageFirst && !isVertical && "flex-row-reverse"
                  )}
                >
                  {/* Media area */}
                  {item.mediaType !== 'none' && (
                    <div className={cn(
                      "flex items-center justify-center bg-muted/30 rounded",
                      isVertical ? "w-full h-20 mb-3" : "w-16 h-16 flex-shrink-0"
                    )}>
                      {item.mediaType === 'image' && item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                      ) : item.mediaType === 'emoji' && item.emoji ? (
                        <span className="text-3xl">{item.emoji}</span>
                      ) : null}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className={cn("text-center", !isVertical && "text-left flex-1")}>
                    <div 
                      className="font-semibold text-sm rich-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}
                    />
                    <div 
                      className="text-xs text-muted-foreground mt-1 rich-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 'testimonials': {
        const testimonialItems = (config.testimonialItems || []) as Array<{
          id: string;
          name: string;
          handle: string;
          rating: number;
          text: string;
          avatarUrl?: string;
          photoUrl?: string;
        }>;
        const layout = config.testimonialLayout || 'list';
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
        const borderRadius = config.testimonialBorderRadius || 'small';
        const shadow = config.testimonialShadow || 'none';
        const spacing = config.testimonialSpacing || 'simple';
        
        const borderRadiusClass = {
          'none': 'rounded-none',
          'small': 'rounded-lg',
          'medium': 'rounded-xl',
          'large': 'rounded-2xl',
        }[borderRadius] || 'rounded-lg';
        
        const shadowClass = {
          'none': '',
          'sm': 'shadow-sm',
          'md': 'shadow-md',
          'lg': 'shadow-lg',
        }[shadow] || '';
        
        const spacingClass = {
          'compact': 'p-3 gap-2',
          'simple': 'p-4 gap-3',
          'relaxed': 'p-5 gap-4',
        }[spacing] || 'p-4 gap-3';

        const renderTestimonialCard = (item: typeof testimonialItems[0]) => (
          <div 
            key={item.id} 
            className={cn(
              "border border-border bg-background flex flex-col h-full",
              borderRadiusClass,
              shadowClass,
              spacingClass
            )}
          >
            {/* Rating stars */}
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={cn("text-sm", i < item.rating ? "text-amber-400" : "text-muted-foreground/30")}>
                  ★
                </span>
              ))}
            </div>
            
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              {item.avatarUrl && (
                <img src={item.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.handle}</div>
              </div>
            </div>
            
            {/* Text */}
            <div 
              className="text-sm text-muted-foreground rich-text flex-1"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.text) }}
            />
            
            {/* Photo */}
            {item.photoUrl && (
              <img src={item.photoUrl} alt="" className={cn("w-full h-32 object-cover mt-3", borderRadiusClass)} />
            )}
          </div>
        );

        if (layout === 'carousel') {
          return (
            <TestimonialCarousel 
              items={testimonialItems}
              widthValue={widthValue}
              justifyClass={justifyClass}
              renderCard={renderTestimonialCard}
            />
          );
        }
        
        const gridClass = layout === 'grid-2' ? 'grid-cols-2' : 'grid-cols-1';
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div 
              className={cn("grid gap-3", gridClass)}
              style={{ width: `${widthValue}%` }}
            >
              {testimonialItems.map((item) => renderTestimonialCard(item))}
            </div>
          </div>
        );
      }

      case 'faq': {
        const faqItems = (config.faqItems || []) as Array<{ id: string; question: string; answer: string }>;
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
        const detailType = config.faqDetailType || 'arrow';
        const firstOpen = config.faqFirstOpen !== false;
        
        return (
          <FaqAccordion
            faqItems={faqItems}
            widthValue={widthValue}
            justifyClass={justifyClass}
            detailType={detailType}
            firstOpen={firstOpen}
          />
        );
      }

      case 'price': {
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
        const layout = config.priceLayout || 'horizontal';
        const style = config.priceStyle || 'theme';
        const title = config.priceTitle || 'Plano PRO';
        const prefix = config.pricePrefix || '';
        const priceVal = config.priceValue || 'R$ 89,90';
        const suffix = config.priceSuffix || '';
        const highlight = config.priceHighlight || '';
        const priceType = config.priceType || 'illustrative';
        const redirectUrl = config.priceRedirectUrl || '';
        
        const styleClasses = {
          theme: 'bg-background border-border',
          red: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
          info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
          success: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
          warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
        }[style] || 'bg-background border-border';

        const handlePriceClick = () => {
          if (priceType === 'redirect' && redirectUrl) {
            window.open(redirectUrl, '_blank');
          }
        };
        
        return (
          <div className={cn("w-full px-4 flex", justifyClass)}>
            <div style={{ width: `${widthValue}%` }}>
              <div 
                onClick={handlePriceClick}
                className={cn(
                  "relative border rounded-xl p-4 transition-all",
                  styleClasses,
                  layout === 'horizontal' ? 'flex items-center justify-between gap-4' : 'flex flex-col gap-2',
                  priceType === 'redirect' && redirectUrl && 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                {/* Highlight badge */}
                {highlight && (
                  <div className="absolute -top-3 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm">
                      {highlight}
                    </span>
                  </div>
                )}
                
                {/* Title */}
                <div className={cn(layout === 'vertical' && 'text-center', highlight && 'pt-2')}>
                  <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                </div>
                
                {/* Price section */}
                <div className={cn(
                  "flex flex-col",
                  layout === 'vertical' ? 'items-center' : 'items-end'
                )}>
                  {prefix && (
                    <span className="text-xs text-muted-foreground font-medium">{prefix}</span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{priceVal}</span>
                  </div>
                  {suffix && (
                    <span className="text-xs text-muted-foreground">{suffix}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'before-after': {
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const ratio = config.beforeAfterRatio || '1:1';
        const img1 = config.beforeAfterImage1 || '';
        const img2 = config.beforeAfterImage2 || '';
        const initialPosition = config.beforeAfterInitialPosition || 50;

        return (
          <BeforeAfterSlider
            key={comp.id}
            image1={img1}
            image2={img2}
            ratio={ratio}
            initialPosition={initialPosition}
            width={widthValue}
            horizontalAlign={horizontalAlign}
          />
        );
      }

      case 'carousel': {
        const items = config.carouselItems || [];
        const layout = config.carouselLayout || 'image-text';
        const pagination = config.carouselPagination !== false;
        const autoplay = config.carouselAutoplay === true;
        const autoplayInterval = config.carouselAutoplayInterval || 3;
        const hasBorder = config.carouselBorder === true;
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const imageRatio = config.carouselImageRatio || '4:3';

        return (
          <CarouselPlayer
            key={comp.id}
            items={items}
            layout={layout}
            pagination={pagination}
            autoplay={autoplay}
            autoplayInterval={autoplayInterval}
            hasBorder={hasBorder}
            width={widthValue}
            horizontalAlign={horizontalAlign}
            imageRatio={imageRatio}
          />
        );
      }

      case 'metrics': {
        const items = config.metricItems || [];
        const layout = config.metricsLayout || 'grid-2';
        const disposition = config.metricsDisposition || 'legend-chart';
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const verticalAlign = config.verticalAlign || 'auto';

        return (
          <MetricsPlayer
            key={comp.id}
            items={items}
            layout={layout}
            disposition={disposition}
            width={widthValue}
            horizontalAlign={horizontalAlign}
            verticalAlign={verticalAlign}
          />
        );
      }

      case 'charts': {
        const chartConfig = config.chartConfig || {
          chartType: 'cartesian',
          dataSets: [],
          selectedDataSetId: '',
          showArea: true,
          showXAxis: true,
          showYAxis: true,
          showGridX: true,
          showGridY: true,
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto',
        };

        return (
          <ChartPlayer
            key={comp.id}
            config={chartConfig}
          />
        );
      }

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
  const showHeader = pageSettings?.showProgress || (pageSettings?.allowBack && currentStageIndex > 0);

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: designSettings.backgroundColor,
        color: designSettings.textColor,
        fontFamily: designSettings.primaryFont,
      }}
    >
      {/* Header */}
      {showHeader && (
        <div 
          className="p-4 flex items-center gap-4 shrink-0"
          style={{ borderBottom: `1px solid ${designSettings.primaryColor}20` }}
        >
          {pageSettings?.allowBack && currentStageIndex > 0 && (
            <button 
              onClick={handleBack} 
              className="p-1 rounded transition-colors"
              style={{ color: designSettings.textColor }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {pageSettings?.showProgress && (
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
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
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
}
