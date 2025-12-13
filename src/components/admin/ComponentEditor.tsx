import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, ChevronDown, GripVertical, Image, Smile, X, Upload, Loader2, Copy } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CarouselItemEditor } from './CarouselItemEditor';
import { MetricItemEditor, MetricItem } from './MetricItemEditor';
import { ChartEditorComponentTab, ChartEditorAppearanceTab, getDefaultChartConfig, ChartConfig } from './ChartEditor';
import { SpacerComponentEditor } from './SpacerEditor';
import { AppearanceEditor } from './AppearanceEditor';
import {
  PriceAppearance,
  BeforeAfterAppearance,
  CarouselAppearance,
  MetricsAppearance,
  FaqAppearance,
  LoadingAppearance,
  TestimonialsAppearance,
  LevelAppearance,
  TimerAppearance,
  NotificationAppearance,
  AlertAppearance,
} from './editors/appearance';
import { ImageInput } from '@/components/ui/image-input';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
// Extracted editors
import { 
  InputComponentTab, 
  TextComponentTab, 
  ButtonComponentTab, 
  OptionsComponentTab, 
  HeightWeightComponentTab,
  AlertComponentTab,
  LoadingComponentTab,
  LevelComponentTab,
  ArgumentsComponentTab,
  TestimonialsComponentTab,
  FaqComponentTab,
  PriceComponentTab,
  MediaComponentTab,
  NotificationComponentTab,
  TimerComponentTab,
  BeforeAfterComponentTab,
  CarouselComponentTab,
  MetricsComponentTab,
  ScriptComponentTab,
  generateSlug 
} from './editors';

// Component ID Display - Shows the unique ID and allows copying
interface ComponentIdDisplayProps {
  id: string;
  customId?: string;
  type: string;
  onUpdateCustomId: (customId: string) => void;
  generateSlug: (text: string) => string;
}

function ComponentIdDisplay({ id, customId, type, onUpdateCustomId, generateSlug }: ComponentIdDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copiado!');
  };

  const effectiveId = customId || id;

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs text-muted-foreground">ID Customizado</Label>
        <div className="flex gap-1 mt-1">
          <Input
            value={customId || ''}
            onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
            placeholder={`${type}_${id.slice(0, 8)}`}
            className="flex-1 font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => copyToClipboard(effectiveId)}
            title="Copiar ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
        <span className="text-muted-foreground/60">UUID:</span>
        <span className="truncate flex-1">{id}</span>
        <button
          onClick={() => copyToClipboard(id)}
          className="hover:text-foreground transition-colors"
          title="Copiar UUID"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// Theme Color Picker Component
interface ThemeColorPickerProps {
  value: string;
  useTheme: boolean;
  themeColor: string;
  onChange: (color: string) => void;
  onUseThemeChange: (useTheme: boolean) => void;
  label: string;
}

function ThemeColorPicker({ value, useTheme, themeColor, onChange, onUseThemeChange, label }: ThemeColorPickerProps) {
  const displayColor = useTheme ? themeColor : value;
  
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => onUseThemeChange(true)}
          className={cn(
            "px-3 py-2 text-xs font-medium rounded-md border transition-colors",
            useTheme 
              ? "border-primary bg-primary/10 text-primary" 
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          Tema
        </button>
        <div className="flex-1 flex gap-2">
          <div 
            className="relative w-12 h-9 rounded-md border overflow-hidden cursor-pointer"
            style={{ backgroundColor: displayColor }}
            onClick={() => {
              if (useTheme) {
                onUseThemeChange(false);
              }
            }}
          >
            <input
              type="color"
              value={displayColor}
              onChange={(e) => {
                onUseThemeChange(false);
                onChange(e.target.value);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={displayColor}
            onChange={(e) => {
              onUseThemeChange(false);
              onChange(e.target.value);
            }}
            placeholder="#000000"
            className={cn("flex-1 font-mono text-xs", useTheme && "opacity-50")}
            disabled={useTheme}
          />
        </div>
      </div>
    </div>
  );
}

export interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
  customId?: string;
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
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  description?: string;
  // Input specific
  inputType?: 'text' | 'email' | 'tel' | 'number' | 'date';
  mask?: string;
  minLength?: number;
  maxLength?: number;
  // Button specific
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline' | 'custom';
  buttonAction?: 'next' | 'submit' | 'link';
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
  // Options specific
  options?: OptionItem[];
  allowMultiple?: boolean;
  autoAdvance?: boolean;
  introType?: 'text' | 'image' | 'video';
  // Options appearance
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
  // Option colors
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
  // Text/Media specific
  content?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  // Image/Video
  mediaUrl?: string;
  altText?: string;
  // Video specific
  videoType?: 'url' | 'embed';
  embedCode?: string;
  // Spacer
  height?: number;
  // Script specific
  scriptCode?: string;
  scriptDescription?: string;
  // Appearance
  labelStyle?: 'default' | 'floating' | 'hidden';
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  // Display/Visibility
  showAfterSeconds?: number;
  displayRules?: Array<{ id: string; condition: string }>;
  // Extended Appearance
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
  // Height/Weight specific
  layoutType?: 'input' | 'ruler';
  unit?: 'cm' | 'pol' | 'kg' | 'lb';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  barColor?: string;
  useThemeColor?: boolean; // When true, use global primary color
  valueColor?: string; // Color for the displayed value
  toggleColor?: string; // Color for the unit toggle button
  tickColor?: string; // Color for ruler ticks
  labelColor?: string; // Color for min/max labels and helper text
  // Alert specific
  alertStyle?: 'red' | 'yellow' | 'green' | 'blue' | 'gray';
  alertHighlight?: boolean;
  alertPadding?: 'compact' | 'default' | 'relaxed';
  // Notification specific
  notificationTitle?: string;
  notificationDescription?: string;
  notificationPosition?: 'default' | 'top' | 'bottom';
  notificationDuration?: number;
  notificationInterval?: number;
  notificationStyle?: 'default' | 'white' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  notificationVariations?: Array<{ id: string; name: string; platform: string; number: string }>;
  // Timer specific
  timerSeconds?: number;
  timerText?: string;
  timerStyle?: 'default' | 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  // Loading specific
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
  argumentItems?: ArgumentItem[];
  argumentLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  argumentDisposition?: 'image-text' | 'text-image' | 'image-left' | 'image-right';
  // Testimonials specific
  testimonialItems?: TestimonialItem[];
  testimonialLayout?: 'list' | 'grid-2' | 'carousel';
  testimonialBorderRadius?: 'none' | 'small' | 'medium' | 'large';
  testimonialShadow?: 'none' | 'sm' | 'md' | 'lg';
  testimonialSpacing?: 'compact' | 'simple' | 'relaxed';
  // Testimonials styling
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
  // FAQ specific
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
  carouselItems?: Array<{
    id: string;
    image: string;
    description: string;
  }>;
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
  chartConfig?: ChartConfig;
}

interface ComponentEditorProps {
  component: DroppedComponent;
  onUpdate: (config: ComponentConfig) => void;
  onUpdateCustomId: (customId: string) => void;
  onDelete: () => void;
  themeColor?: string; // Global primary color from design settings
}

export function ComponentEditor({ component, onUpdate, onUpdateCustomId, onDelete, themeColor = '#000000' }: ComponentEditorProps) {
  const config = component.config || {};
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Media library picker state for testimonials
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ itemId: string; type: 'avatar' | 'photo' } | null>(null);
  
  // Media library picker state for image component
  const [imageMediaPickerOpen, setImageMediaPickerOpen] = useState(false);

  // generateSlug is now imported from './editors'

  const updateConfig = (updates: Partial<ComponentConfig>) => {
    onUpdate({ ...config, ...updates });
  };

  const addOption = () => {
    const currentOptions = config.options || [];
    const newOption: OptionItem = {
      id: crypto.randomUUID(),
      text: `Opção ${currentOptions.length + 1}`,
      value: `opt_${currentOptions.length + 1}`,
      points: 1,
      destination: 'next',
    };
    updateConfig({ options: [...currentOptions, newOption] });
  };

  const updateOption = (id: string, updates: Partial<OptionItem>) => {
    const options = (config.options || []).map(opt => 
      opt.id === id ? { ...opt, ...updates } : opt
    );
    updateConfig({ options });
  };

  const removeOption = (id: string) => {
    updateConfig({
      options: (config.options || []).filter(opt => opt.id !== id)
    });
  };

  const addDisplayRule = () => {
    const currentRules = config.displayRules || [];
    updateConfig({
      displayRules: [...currentRules, { id: crypto.randomUUID(), condition: '' }]
    });
  };

  const removeDisplayRule = (id: string) => {
    updateConfig({
      displayRules: (config.displayRules || []).filter(rule => rule.id !== id)
    });
  };

  // =========== COMPONENTE TAB ===========
  const renderComponentTab = () => {
    // Common props for extracted editors
    const editorProps = {
      component,
      config,
      updateConfig,
      onUpdateCustomId,
      advancedOpen,
      setAdvancedOpen,
      themeColor,
    };

    switch (component.type) {
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'textarea':
        return <InputComponentTab {...editorProps} />;
      case 'height':
      case 'weight':
        return <HeightWeightComponentTab {...editorProps} />;
      case 'button':
        return <ButtonComponentTab {...editorProps} />;
      case 'options':
      case 'single':
      case 'multiple':
      case 'yesno':
        return <OptionsComponentTab {...editorProps} />;
      case 'text':
        return <TextComponentTab {...editorProps} />;
      case 'image':
      case 'video':
      case 'audio':
        return <MediaComponentTab {...editorProps} />;
      case 'spacer':
        return <SpacerComponentEditor 
          config={config} 
          updateConfig={updateConfig}
          customId={component.customId}
          componentId={component.id}
          onUpdateCustomId={onUpdateCustomId}
          generateSlug={generateSlug}
          advancedOpen={advancedOpen}
          setAdvancedOpen={setAdvancedOpen}
        />;
      case 'script':
        return <ScriptComponentTab {...editorProps} />;
      case 'alert':
        return <AlertComponentTab {...editorProps} />;
      case 'notification':
        return <NotificationComponentTab {...editorProps} />;
      case 'timer':
        return <TimerComponentTab {...editorProps} />;
      case 'loading':
        return <LoadingComponentTab {...editorProps} />;
      case 'level':
        return <LevelComponentTab {...editorProps} />;
      case 'arguments':
        return <ArgumentsComponentTab {...editorProps} />;
      case 'testimonials':
        return <TestimonialsComponentTab {...editorProps} />;
      case 'faq':
        return <FaqComponentTab {...editorProps} />;
      case 'price':
        return <PriceComponentTab {...editorProps} />;
      case 'before-after':
        return <BeforeAfterComponentTab {...editorProps} />;
      case 'carousel':
        return <CarouselComponentTab {...editorProps} />;
      case 'metrics':
        return <MetricsComponentTab {...editorProps} />;
      case 'charts':
        return renderChartsComponentTab();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Configuração para "{component.name}" em breve
            </p>
          </div>
        );
    }
  };

  // =========== CHARTS COMPONENT TAB ===========
  const renderChartsComponentTab = () => {
    const chartConfig = config.chartConfig || getDefaultChartConfig();

    const handleUpdateChartConfig = (updates: Partial<ChartConfig>) => {
      updateConfig({ chartConfig: { ...chartConfig, ...updates } });
    };

    return (
      <ChartEditorComponentTab config={chartConfig} onUpdate={handleUpdateChartConfig} />
    );
  };

  // =========== LEGACY EDITORS REMOVED ===========
  // Media, Notification, Timer, BeforeAfter, Carousel, Metrics editors have been extracted to ./editors/

  // =========== APARÊNCIA TAB ===========
  const renderAppearanceTab = () => {
    const appearanceProps = { config, updateConfig };

    // Charts component
    if (component.type === 'charts') {
      const chartConfig = config.chartConfig || getDefaultChartConfig();
      const handleUpdateChartConfig = (updates: Partial<ChartConfig>) => {
        updateConfig({ chartConfig: { ...chartConfig, ...updates } });
      };
      return <ChartEditorAppearanceTab config={chartConfig} onUpdate={handleUpdateChartConfig} />;
    }

    // Price component
    if (component.type === 'price') {
      return <PriceAppearance {...appearanceProps} />;
    }

    // Before-After component
    if (component.type === 'before-after') {
      return <BeforeAfterAppearance {...appearanceProps} />;
    }

    // Carousel component
    if (component.type === 'carousel') {
      return <CarouselAppearance {...appearanceProps} />;
    }

    // Metrics component
    if (component.type === 'metrics') {
      return <MetricsAppearance {...appearanceProps} />;
    }

    // FAQ component
    if (component.type === 'faq') {
      return <FaqAppearance {...appearanceProps} />;
    }

    // Loading component
    if (component.type === 'loading') {
      return <LoadingAppearance {...appearanceProps} />;
    }

    // Testimonials component
    if (component.type === 'testimonials') {
      return <TestimonialsAppearance {...appearanceProps} />;
    }

    // Level component
    if (component.type === 'level') {
      return <LevelAppearance {...appearanceProps} />;
    }

    // Timer component
    if (component.type === 'timer') {
      return <TimerAppearance {...appearanceProps} />;
    }

    // Notification component
    if (component.type === 'notification') {
      return <NotificationAppearance {...appearanceProps} />;
    }

    // Alert component
    if (component.type === 'alert') {
      return <AlertAppearance {...appearanceProps} />;
    }
    
    // Options component - kept inline due to complexity
    if (['options', 'single', 'multiple', 'yesno'].includes(component.type)) {
      return (
        <div className="space-y-4">
          {/* Estilo */}
          <div>
            <Label className="text-xs text-muted-foreground">Estilo</Label>
            <Select 
              value={config.optionStyle || 'simple'} 
              onValueChange={(v) => updateConfig({ optionStyle: v as ComponentConfig['optionStyle'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simples</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="image">Com imagem</SelectItem>
                <SelectItem value="pill">Pílula</SelectItem>
                <SelectItem value="glass">Vidro (Glass)</SelectItem>
                <SelectItem value="minimal">Minimalista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.optionStyle === 'image' && (
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="transparentBg" 
                checked={config.transparentImageBg || false}
                onChange={(e) => updateConfig({ transparentImageBg: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="transparentBg" className="text-sm cursor-pointer">Imagem com fundo transparente</Label>
            </div>
          )}

          {/* Layout & Orientação */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Layout</Label>
              <Select 
                value={config.optionLayout || 'list'} 
                onValueChange={(v) => updateConfig({ optionLayout: v as ComponentConfig['optionLayout'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">Lista</SelectItem>
                  <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
                  <SelectItem value="grid-3">Grade de 3 colunas</SelectItem>
                  <SelectItem value="grid-4">Grade de 4 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Orientação</Label>
              <Select 
                value={config.optionOrientation || 'vertical'} 
                onValueChange={(v) => updateConfig({ optionOrientation: v as ComponentConfig['optionOrientation'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vertical">Vertical</SelectItem>
                  <SelectItem value="horizontal">Horizontal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {config.optionStyle === 'image' && (
            <>
              <div>
                <Label className="text-xs text-muted-foreground">Proporção de imagens</Label>
                <Select 
                  value={config.imageRatio || '1:1'} 
                  onValueChange={(v) => updateConfig({ imageRatio: v as ComponentConfig['imageRatio'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                    <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                    <SelectItem value="4:3">4:3 (Clássico)</SelectItem>
                    <SelectItem value="3:2">3:2 (Foto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Disposição</Label>
                <Select 
                  value={config.imagePosition || 'top'} 
                  onValueChange={(v) => updateConfig({ imagePosition: v as ComponentConfig['imagePosition'] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Imagem | Texto</SelectItem>
                    <SelectItem value="bottom">Texto | Imagem</SelectItem>
                    <SelectItem value="left">Imagem à esquerda</SelectItem>
                    <SelectItem value="right">Imagem à direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Detalhe & Posição */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Detalhe</Label>
              <Select 
                value={config.detailType || 'checkbox'} 
                onValueChange={(v) => updateConfig({ detailType: v as ComponentConfig['detailType'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Posição do detalhe</Label>
              <Select 
                value={config.detailPosition || 'start'} 
                onValueChange={(v) => updateConfig({ detailPosition: v as ComponentConfig['detailPosition'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Início</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bordas */}
          <div>
            <Label className="text-xs text-muted-foreground">Bordas</Label>
            <Select 
              value={config.optionBorderRadius || 'small'} 
              onValueChange={(v) => updateConfig({ optionBorderRadius: v as ComponentConfig['optionBorderRadius'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem borda</SelectItem>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="full">Completo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sombra */}
          <div>
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Select 
              value={config.optionShadow || 'none'} 
              onValueChange={(v) => updateConfig({ optionShadow: v as ComponentConfig['optionShadow'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem sombra</SelectItem>
                <SelectItem value="sm">Pequena</SelectItem>
                <SelectItem value="md">Média</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Espaçamento */}
          <div>
            <Label className="text-xs text-muted-foreground">Espaçamento</Label>
            <Select 
              value={config.optionSpacing || 'simple'} 
              onValueChange={(v) => updateConfig({ optionSpacing: v as ComponentConfig['optionSpacing'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="simple">Simples</SelectItem>
                <SelectItem value="relaxed">Relaxado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Width */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Largura</Label>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => updateConfig({ width: Math.max(10, (config.width || 100) - 5) })}
                >
                  −
                </Button>
                <span className="text-sm font-medium w-12 text-center">{config.width || 100}%</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => updateConfig({ width: Math.min(100, (config.width || 100) + 5) })}
                >
                  +
                </Button>
              </div>
            </div>
            <Slider
              value={[config.width || 100]}
              onValueChange={([value]) => updateConfig({ width: value })}
              min={10}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* Horizontal and Vertical alignment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Alinhamento horizontal</Label>
              <Select 
                value={config.horizontalAlign || 'start'} 
                onValueChange={(v) => updateConfig({ horizontalAlign: v as ComponentConfig['horizontalAlign'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">Começo</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Alinhamento vertical</Label>
              <Select 
                value={config.verticalAlign || 'auto'} 
                onValueChange={(v) => updateConfig({ verticalAlign: v as ComponentConfig['verticalAlign'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="start">Começo</SelectItem>
                  <SelectItem value="center">Centro</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    // Default appearance tab for other components - use AppearanceEditor
    return (
      <AppearanceEditor
        config={{
          width: config.width,
          horizontalAlign: config.horizontalAlign,
          verticalAlign: config.verticalAlign,
          labelStyle: config.labelStyle,
          textAlign: config.textAlign,
          fontSize: config.fontSize,
          paddingTop: config.paddingTop,
          paddingBottom: config.paddingBottom,
          paddingLeft: config.paddingLeft,
          paddingRight: config.paddingRight,
          marginTop: config.marginTop,
          marginBottom: config.marginBottom,
          borderRadius: config.borderRadius,
          borderWidth: config.borderWidth,
          borderColor: config.borderColor,
          backgroundColor: config.backgroundColor,
          textColor: config.textColor,
          opacity: config.opacity,
          shadow: config.shadow,
        }}
        onUpdate={(updates) => updateConfig(updates)}
        componentType={component.type}
        themeColor={themeColor}
      />
    );
  };

  // =========== EXIBIÇÃO TAB ===========
  const renderDisplayTab = () => (
    <div className="space-y-4">
      {/* Show after seconds */}
      <div>
        <Label className="text-xs text-muted-foreground">Mostrar após:</Label>
        <Input
          type="number"
          value={config.showAfterSeconds || ''}
          onChange={(e) => updateConfig({ showAfterSeconds: parseFloat(e.target.value) || undefined })}
          placeholder="Segundos"
          className="mt-1"
        />
      </div>

      {/* Display rules */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Regras de exibição</Label>
        <div className="space-y-2">
          {(config.displayRules || []).map((rule) => (
            <div key={rule.id} className="flex gap-2">
              <Input
                value={rule.condition}
                onChange={(e) => {
                  const rules = (config.displayRules || []).map(r => 
                    r.id === rule.id ? { ...r, condition: e.target.value } : r
                  );
                  updateConfig({ displayRules: rules });
                }}
                placeholder="Condição..."
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeDisplayRule(rule.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addDisplayRule} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            adicionar regra
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 shrink-0">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{component.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{component.type}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="component" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-3 m-4 mb-0 shrink-0">
          <TabsTrigger value="component">Componente</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
        </TabsList>
        
        <TabsContent value="component" className="flex-1 overflow-y-auto p-4 mt-0">
          {renderComponentTab()}
        </TabsContent>
        
        <TabsContent value="appearance" className="flex-1 overflow-y-auto p-4 mt-0">
          {renderAppearanceTab()}
        </TabsContent>
        
        <TabsContent value="display" className="flex-1 overflow-y-auto p-4 mt-0">
          {renderDisplayTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
