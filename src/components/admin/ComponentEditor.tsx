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
import { ImageInput } from '@/components/ui/image-input';

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

export function ComponentEditor({ component, onUpdate, onUpdateCustomId, onDelete, themeColor = '#A855F7' }: ComponentEditorProps) {
  const config = component.config || {};
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');
  };

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
    switch (component.type) {
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'textarea':
        return renderInputComponentTab();
      case 'height':
      case 'weight':
        return renderHeightWeightComponentTab();
      case 'button':
        return renderButtonComponentTab();
      case 'options':
      case 'single':
      case 'multiple':
      case 'yesno':
        return renderOptionsComponentTab();
      case 'text':
        return renderTextComponentTab();
      case 'image':
      case 'video':
      case 'audio':
        return renderMediaComponentTab();
      case 'spacer':
        return renderSpacerComponentTab();
      case 'script':
        return renderScriptComponentTab();
      case 'alert':
        return renderAlertComponentTab();
      case 'notification':
        return renderNotificationComponentTab();
      case 'timer':
        return renderTimerComponentTab();
      case 'loading':
        return renderLoadingComponentTab();
      case 'level':
        return renderLevelComponentTab();
      case 'arguments':
        return renderArgumentsComponentTab();
      case 'testimonials':
        return renderTestimonialsComponentTab();
      case 'faq':
        return renderFaqComponentTab();
      case 'price':
        return renderPriceComponentTab();
      case 'before-after':
        return renderBeforeAfterComponentTab();
      case 'carousel':
        return renderCarouselComponentTab();
      case 'metrics':
        return renderMetricsComponentTab();
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

  const renderInputComponentTab = () => (
    <div className="space-y-4">
      {/* ID/Name */}
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
        generateSlug={generateSlug}
      />

      {/* Título/Label */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <RichTextInput
          value={config.label || ''}
          onChange={(label) => updateConfig({ label })}
          placeholder="Ex: Nome"
          className="mt-1"
        />
      </div>

      {/* Campo obrigatório */}
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="required" 
          checked={config.required || false}
          onChange={(e) => updateConfig({ required: e.target.checked })}
          className="rounded border-border"
        />
        <Label htmlFor="required" className="text-sm cursor-pointer">Campo obrigatório</Label>
      </div>

      {/* Tipo */}
      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select 
          value={config.inputType || 'text'} 
          onValueChange={(v) => updateConfig({ inputType: v as ComponentConfig['inputType'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="tel">Telefone</SelectItem>
            <SelectItem value="number">Número</SelectItem>
            <SelectItem value="date">Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Placeholder */}
      <div>
        <Label className="text-xs text-muted-foreground">Placeholder</Label>
        <Input
          value={config.placeholder || ''}
          onChange={(e) => updateConfig({ placeholder: e.target.value })}
          placeholder="Digite seu nome..."
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Texto de ajuda</Label>
            <Input
              value={config.helpText || ''}
              onChange={(e) => updateConfig({ helpText: e.target.value })}
              placeholder="Ex: Usaremos para personalizar..."
              className="mt-1"
            />
          </div>
          {component.type === 'phone' && (
            <div>
              <Label className="text-xs text-muted-foreground">Máscara</Label>
              <Select value={config.mask || 'br'} onValueChange={(v) => updateConfig({ mask: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="br">(00) 00000-0000</SelectItem>
                  <SelectItem value="us">(000) 000-0000</SelectItem>
                  <SelectItem value="intl">+00 00 00000-0000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {['number', 'input', 'textarea'].includes(component.type) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Mín. caracteres</Label>
                <Input
                  type="number"
                  value={config.minLength || ''}
                  onChange={(e) => updateConfig({ minLength: parseInt(e.target.value) || undefined })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Máx. caracteres</Label>
                <Input
                  type="number"
                  value={config.maxLength || ''}
                  onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) || undefined })}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderHeightWeightComponentTab = () => {
    const isHeight = component.type === 'height';
    const defaultMin = isHeight ? 100 : 30;
    const defaultMax = isHeight ? 220 : 200;
    const defaultValue = isHeight ? 170 : 70;
    
    return (
      <div className="space-y-4">
        {/* ID/Name */}
        <ComponentIdDisplay
          id={component.id}
          customId={component.customId}
          type={component.type}
          onUpdateCustomId={onUpdateCustomId}
          generateSlug={generateSlug}
        />

        {/* Layout Type */}
        <div>
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select 
            value={config.layoutType || 'input'} 
            onValueChange={(v) => updateConfig({ layoutType: v as 'input' | 'ruler' })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="input">Input</SelectItem>
              <SelectItem value="ruler">Régua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Colors Section */}
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Cores</Label>
          
          {/* Bar Color */}
          <ThemeColorPicker
            label="Cor da barra"
            value={config.barColor || themeColor}
            useTheme={config.useThemeColor !== false}
            themeColor={themeColor}
            onChange={(color) => updateConfig({ barColor: color })}
            onUseThemeChange={(useTheme) => updateConfig({ useThemeColor: useTheme, barColor: useTheme ? themeColor : config.barColor })}
          />
          
          {/* Value Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor do valor</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.valueColor || '#000000'}
                onChange={(e) => updateConfig({ valueColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <Input
                value={config.valueColor || ''}
                onChange={(e) => updateConfig({ valueColor: e.target.value })}
                placeholder="Herdar do tema"
                className="flex-1 text-sm"
              />
            </div>
          </div>
          
          {/* Toggle Button Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor do botão toggle</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.toggleColor || '#1f2937'}
                onChange={(e) => updateConfig({ toggleColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <Input
                value={config.toggleColor || ''}
                onChange={(e) => updateConfig({ toggleColor: e.target.value })}
                placeholder="Padrão"
                className="flex-1 text-sm"
              />
            </div>
          </div>
          
          {/* Tick Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor das marcações</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.tickColor || '#808080'}
                onChange={(e) => updateConfig({ tickColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <Input
                value={config.tickColor || ''}
                onChange={(e) => updateConfig({ tickColor: e.target.value })}
                placeholder="Padrão"
                className="flex-1 text-sm"
              />
            </div>
          </div>
          
          {/* Label Color */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor dos textos</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.labelColor || '#808080'}
                onChange={(e) => updateConfig({ labelColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-border"
              />
              <Input
                value={config.labelColor || ''}
                onChange={(e) => updateConfig({ labelColor: e.target.value })}
                placeholder="Herdar"
                className="flex-1 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Campo obrigatório */}
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="required" 
            checked={config.required || false}
            onChange={(e) => updateConfig({ required: e.target.checked })}
            className="rounded border-border"
          />
          <Label htmlFor="required" className="text-sm cursor-pointer">Campo obrigatório</Label>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Unit */}
            <div>
              <Label className="text-xs text-muted-foreground">Unidade</Label>
              <Select 
                value={config.unit || (isHeight ? 'cm' : 'kg')} 
                onValueChange={(v) => updateConfig({ unit: v as ComponentConfig['unit'] })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isHeight ? (
                    <>
                      <SelectItem value="cm">Centímetros (cm)</SelectItem>
                      <SelectItem value="pol">Polegadas (pol)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
                      <SelectItem value="lb">Libras (lb)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Min/Max/Default Values */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Mínimo</Label>
                <Input
                  type="number"
                  value={config.minValue ?? defaultMin}
                  onChange={(e) => updateConfig({ minValue: parseInt(e.target.value) || defaultMin })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Máximo</Label>
                <Input
                  type="number"
                  value={config.maxValue ?? defaultMax}
                  onChange={(e) => updateConfig({ maxValue: parseInt(e.target.value) || defaultMax })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Padrão</Label>
                <Input
                  type="number"
                  value={config.defaultValue ?? defaultValue}
                  onChange={(e) => updateConfig({ defaultValue: parseInt(e.target.value) || defaultValue })}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground">Texto de ajuda</Label>
              <Input
                value={config.helpText || ''}
                onChange={(e) => updateConfig({ helpText: e.target.value })}
                placeholder="Ex: Sua altura em centímetros"
                className="mt-1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderButtonComponentTab = () => {
    const emojiList = ['🚀', '✅', '→', '↗', '💪', '🔥', '⭐', '💎', '🎯', '❤️', '👍', '✨', '🎉', '💰', '🛒', '📩'];
    
    return (
      <div className="space-y-4">
        <ComponentIdDisplay
          id={component.id}
          customId={component.customId}
          type={component.type}
          onUpdateCustomId={onUpdateCustomId}
          generateSlug={generateSlug}
        />
        
        {/* Texto do botão */}
        <div>
          <Label className="text-xs text-muted-foreground">Texto do botão</Label>
          <RichTextInput
            value={config.buttonText || 'Continuar'}
            onChange={(buttonText) => updateConfig({ buttonText })}
            className="mt-1"
          />
        </div>
        
        {/* Ação */}
        <div>
          <Label className="text-xs text-muted-foreground">Ação</Label>
          <Select value={config.buttonAction || 'next'} onValueChange={(v) => updateConfig({ buttonAction: v as ComponentConfig['buttonAction'] })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Próxima etapa</SelectItem>
              <SelectItem value="submit">Enviar formulário</SelectItem>
              <SelectItem value="link">Abrir link</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {config.buttonAction === 'link' && (
          <div>
            <Label className="text-xs text-muted-foreground">URL do link</Label>
            <Input
              value={config.buttonLink || ''}
              onChange={(e) => updateConfig({ buttonLink: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        )}


        {/* Design */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
            DESIGN
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            {/* Estilo base */}
            <div>
              <Label className="text-xs text-muted-foreground">Estilo base</Label>
              <Select value={config.buttonStyle || 'primary'} onValueChange={(v) => updateConfig({ buttonStyle: v as ComponentConfig['buttonStyle'] })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primário</SelectItem>
                  <SelectItem value="secondary">Secundário</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="custom">Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cores customizadas (só mostra se estilo for custom) */}
            {config.buttonStyle === 'custom' && (
              <>
                {/* Gradiente toggle */}
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Usar gradiente</Label>
                  <Switch
                    checked={config.buttonGradient || false}
                    onCheckedChange={(checked) => updateConfig({ buttonGradient: checked })}
                  />
                </div>

                {config.buttonGradient ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="color"
                            value={config.buttonGradientFrom || '#3b82f6'}
                            onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                            className="w-10 h-9 rounded border border-border cursor-pointer"
                          />
                          <Input
                            value={config.buttonGradientFrom || '#3b82f6'}
                            onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Cor final</Label>
                        <div className="flex gap-2 mt-1">
                          <input
                            type="color"
                            value={config.buttonGradientTo || '#8b5cf6'}
                            onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                            className="w-10 h-9 rounded border border-border cursor-pointer"
                          />
                          <Input
                            value={config.buttonGradientTo || '#8b5cf6'}
                            onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                            className="flex-1 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Direção do gradiente</Label>
                      <Select 
                        value={config.buttonGradientDirection || 'to-r'} 
                        onValueChange={(v) => updateConfig({ buttonGradientDirection: v as ComponentConfig['buttonGradientDirection'] })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="to-r">→ Para direita</SelectItem>
                          <SelectItem value="to-l">← Para esquerda</SelectItem>
                          <SelectItem value="to-t">↑ Para cima</SelectItem>
                          <SelectItem value="to-b">↓ Para baixo</SelectItem>
                          <SelectItem value="to-tr">↗ Diagonal superior</SelectItem>
                          <SelectItem value="to-br">↘ Diagonal inferior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={config.buttonBgColor || '#3b82f6'}
                        onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                        className="w-10 h-9 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={config.buttonBgColor || '#3b82f6'}
                        onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground">Cor do texto</Label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={config.buttonTextColor || '#ffffff'}
                      onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                      className="w-10 h-9 rounded border border-border cursor-pointer"
                    />
                    <Input
                      value={config.buttonTextColor || '#ffffff'}
                      onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor da borda</Label>
                    <div className="flex gap-2 mt-1">
                      <input
                        type="color"
                        value={config.buttonBorderColor || '#3b82f6'}
                        onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                        className="w-10 h-9 rounded border border-border cursor-pointer"
                      />
                      <Input
                        value={config.buttonBorderColor || '#3b82f6'}
                        onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Espessura da borda</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[config.buttonBorderWidth ?? 0]}
                        onValueChange={(vals) => updateConfig({ buttonBorderWidth: vals[0] })}
                        min={0}
                        max={8}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs w-8 text-right">{config.buttonBorderWidth ?? 0}px</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Tamanho */}
            <div>
              <Label className="text-xs text-muted-foreground">Tamanho</Label>
              <Select value={config.buttonSize || 'md'} onValueChange={(v) => updateConfig({ buttonSize: v as ComponentConfig['buttonSize'] })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Pequeno</SelectItem>
                  <SelectItem value="md">Médio</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Extra grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Largura total */}
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Largura total</Label>
              <Switch
                checked={config.buttonFullWidth !== false}
                onCheckedChange={(checked) => updateConfig({ buttonFullWidth: checked })}
              />
            </div>

            {/* Border radius */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs text-muted-foreground">Arredondamento</Label>
                <span className="text-xs">{config.buttonBorderRadius ?? 8}px</span>
              </div>
              <Slider
                value={[config.buttonBorderRadius ?? 8]}
                onValueChange={(vals) => updateConfig({ buttonBorderRadius: vals[0] })}
                min={0}
                max={50}
                step={2}
              />
            </div>

            {/* Sombra */}
            <div>
              <Label className="text-xs text-muted-foreground">Sombra</Label>
              <Select value={config.buttonShadow || 'none'} onValueChange={(v) => updateConfig({ buttonShadow: v as ComponentConfig['buttonShadow'] })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="sm">Pequena</SelectItem>
                  <SelectItem value="md">Média</SelectItem>
                  <SelectItem value="lg">Grande</SelectItem>
                  <SelectItem value="xl">Extra grande</SelectItem>
                  <SelectItem value="glow">Glow (brilho)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>


        {/* Efeitos */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className="w-4 h-4" />
            EFEITOS
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Efeito ao passar o mouse</Label>
              <Select value={config.buttonHoverEffect || 'none'} onValueChange={(v) => updateConfig({ buttonHoverEffect: v as ComponentConfig['buttonHoverEffect'] })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="darken">Escurecer</SelectItem>
                  <SelectItem value="lighten">Clarear</SelectItem>
                  <SelectItem value="scale">Aumentar</SelectItem>
                  <SelectItem value="lift">Elevar</SelectItem>
                  <SelectItem value="glow">Brilho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Animação contínua</Label>
              <Select value={config.buttonAnimation || 'none'} onValueChange={(v) => updateConfig({ buttonAnimation: v as ComponentConfig['buttonAnimation'] })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="shine">✨ Brilho deslizante</SelectItem>
                  <SelectItem value="pulse-glow">💫 Pulso luminoso</SelectItem>
                  <SelectItem value="float">🎈 Flutuação suave</SelectItem>
                  <SelectItem value="heartbeat">💓 Batida</SelectItem>
                  <SelectItem value="bounce-subtle">⬆️ Salto suave</SelectItem>
                  <SelectItem value="wiggle">〰️ Balanço</SelectItem>
                  <SelectItem value="ripple">🔘 Ondulação</SelectItem>
                  <SelectItem value="glow-border">🌟 Borda luminosa</SelectItem>
                  <SelectItem value="attention">👋 Chamada de atenção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const [expandedOptionId, setExpandedOptionId] = useState<string | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState<string | null>(null);
  const [emojiCategory, setEmojiCategory] = useState<'popular' | 'faces' | 'gestures' | 'objects' | 'symbols'>('popular');
  
  const emojiCategories = {
    popular: ['😊', '👍', '❤️', '⭐', '✅', '🎯', '💡', '🔥', '💪', '🎉', '👋', '🙏', '💰', '🏠', '🚗', '✈️'],
    faces: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘'],
    gestures: ['👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤝', '🙏', '✌️', '🤞', '🤟', '🤘', '👌'],
    objects: ['🏠', '🏢', '🏥', '🏦', '🚗', '🚕', '🚌', '✈️', '🚀', '📱', '💻', '⌚', '📷', '🎮', '🎧', '💼'],
    symbols: ['✅', '❌', '⭐', '💯', '🔥', '💡', '⚡', '❤️', '💚', '💙', '💜', '🖤', '🤍', '💛', '🧡', '💗']
  };

  const renderOptionsComponentTab = () => {
    const defaultOptions: OptionItem[] = [
      { id: '1', text: 'Opção 1', value: 'opt1', points: 1, destination: 'next' },
      { id: '2', text: 'Opção 2', value: 'opt2', points: 1, destination: 'next' },
      { id: '3', text: 'Opção 3', value: 'opt3', points: 1, destination: 'next' },
      { id: '4', text: 'Opção 4', value: 'opt4', points: 1, destination: 'next' },
    ];
    const options = config.options || defaultOptions;

    return (
      <div className="space-y-4">
        {/* ID/Name */}
        <ComponentIdDisplay
          id={component.id}
          customId={component.customId}
          type={component.type}
          onUpdateCustomId={onUpdateCustomId}
          generateSlug={generateSlug}
        />

        {/* Introdução */}
        <div className="border border-border rounded-lg p-3">
          <Label className="text-xs text-muted-foreground mb-2 block">Introdução</Label>
          <Select 
            value={config.introType || 'text'} 
            onValueChange={(v) => updateConfig({ introType: v as ComponentConfig['introType'] })}
          >
            <SelectTrigger className="mb-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Texto</SelectItem>
              <SelectItem value="image">Imagem</SelectItem>
              <SelectItem value="video">Vídeo</SelectItem>
            </SelectContent>
          </Select>

          <div className="text-center p-4 border border-border rounded-lg bg-muted/20 space-y-2">
<RichTextInput
              value={config.label || ''}
              onChange={(label) => updateConfig({ label })}
              placeholder="Qual a questão a ser respondida?"
              className="text-center"
            />
<RichTextInput
              value={config.description || ''}
              onChange={(description) => updateConfig({ description })}
              placeholder="Digite aqui uma descrição"
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>

        {/* Opções */}
        <div className="border border-border rounded-lg p-3">
          <Label className="text-xs text-muted-foreground mb-2 block">Opções</Label>
          <div className="space-y-2">
            {options.map((opt) => (
              <div key={opt.id} className="border border-border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center gap-2 p-2 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id)}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  
                  {/* Media button (icon/image) */}
                  <Popover open={showMediaSelector === opt.id} onOpenChange={(open) => setShowMediaSelector(open ? opt.id : null)}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "w-10 h-10 rounded flex items-center justify-center text-lg transition-colors",
                          opt.mediaType === 'icon' && opt.icon ? "bg-primary/10" : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {opt.mediaType === 'image' && opt.imageUrl ? (
                          <img src={opt.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                        ) : opt.mediaType === 'icon' && opt.icon ? (
                          <span>{opt.icon}</span>
                        ) : (
                          <Image className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-4" 
                      align="start" 
                      side="bottom"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Mídia da opção</span>
                        <button 
                          onClick={() => setShowMediaSelector(null)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Type selector */}
                      <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
                        <button
                          onClick={() => updateOption(opt.id, { mediaType: 'none', icon: undefined, imageUrl: undefined })}
                          className={cn(
                            "flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all",
                            (!opt.mediaType || opt.mediaType === 'none') 
                              ? "bg-background text-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Nenhum
                        </button>
                        <button
                          onClick={() => updateOption(opt.id, { mediaType: 'icon' })}
                          className={cn(
                            "flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                            opt.mediaType === 'icon' 
                              ? "bg-background text-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Smile className="w-3.5 h-3.5" />
                          Ícone
                        </button>
                        <button
                          onClick={() => updateOption(opt.id, { mediaType: 'image' })}
                          className={cn(
                            "flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5",
                            opt.mediaType === 'image' 
                              ? "bg-background text-foreground shadow-sm" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Image className="w-3.5 h-3.5" />
                          Foto
                        </button>
                      </div>
                      
                      {/* Icon picker */}
                      {opt.mediaType === 'icon' && (
                        <div className="space-y-2">
                          {/* Category tabs */}
                          <div className="flex gap-1 overflow-x-auto pb-1">
                            {(['popular', 'faces', 'gestures', 'objects', 'symbols'] as const).map((cat) => (
                              <button
                                key={cat}
                                onClick={() => setEmojiCategory(cat)}
                                className={cn(
                                  "px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors",
                                  emojiCategory === cat 
                                    ? "bg-primary/20 text-primary font-medium" 
                                    : "text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {cat === 'popular' && '⭐ Popular'}
                                {cat === 'faces' && '😊 Rostos'}
                                {cat === 'gestures' && '👍 Gestos'}
                                {cat === 'objects' && '🏠 Objetos'}
                                {cat === 'symbols' && '✅ Símbolos'}
                              </button>
                            ))}
                          </div>
                          
                          {/* Emoji grid */}
                          <div className="grid grid-cols-8 gap-1">
                            {emojiCategories[emojiCategory].map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => { 
                                  updateOption(opt.id, { icon: emoji }); 
                                  setShowMediaSelector(null);
                                }}
                                className={cn(
                                  "w-7 h-7 rounded flex items-center justify-center text-lg hover:bg-muted hover:scale-110 transition-all",
                                  opt.icon === emoji && "bg-primary/20 ring-2 ring-primary"
                                )}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Image picker with media library */}
                      {opt.mediaType === 'image' && (
                        <div className="space-y-2">
                          <ImageInput
                            value={opt.imageUrl || ''}
                            onChange={(url) => updateOption(opt.id, { imageUrl: url })}
                            placeholder="Selecione uma imagem"
                          />
                          {opt.imageUrl && (
                            <div className="relative w-full h-20 bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={opt.imageUrl} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                  
                  <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                    <RichTextInput
                      value={opt.text}
                      onChange={(text) => updateOption(opt.id, { text })}
                      placeholder="Texto da opção"
                      className="border-0 bg-transparent min-h-[36px]"
                    />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setExpandedOptionId(expandedOptionId === opt.id ? null : opt.id); }}
                    className="p-1 hover:bg-muted rounded"
                  >
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", expandedOptionId === opt.id && "rotate-180")} />
                  </button>
                </div>

                {expandedOptionId === opt.id && (
                  <div className="p-3 border-t border-border bg-muted/20 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Pontos</Label>
                        <Input
                          type="number"
                          value={opt.points || 1}
                          onChange={(e) => updateOption(opt.id, { points: parseInt(e.target.value) || 1 })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Valor</Label>
                        <Input
                          value={opt.value}
                          onChange={(e) => updateOption(opt.id, { value: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Destino</Label>
                        <Select 
                          value={opt.destination || 'next'} 
                          onValueChange={(v) => updateOption(opt.id, { destination: v as OptionItem['destination'] })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="next">Próxima etapa</SelectItem>
                            <SelectItem value="submit">Enviar</SelectItem>
                            <SelectItem value="specific">Etapa específica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeOption(opt.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={addOption} className="w-full mt-3">
            <Plus className="w-4 h-4 mr-2" />
            adicionar opção
          </Button>
        </div>

        {/* Checkboxes */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="optRequired" 
                checked={config.required !== false}
                onChange={(e) => updateConfig({ required: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="optRequired" className="text-sm cursor-pointer font-medium">Seleção obrigatória</Label>
            </div>
            <p className="text-xs text-muted-foreground ml-5">O usuário é obrigado a selecionar alguma opção para prosseguir.</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="allowMultiple" 
                checked={config.allowMultiple || false}
                onChange={(e) => updateConfig({ allowMultiple: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="allowMultiple" className="text-sm cursor-pointer font-medium">Permitir múltipla escolha</Label>
            </div>
            <p className="text-xs text-muted-foreground ml-5">O usuário poderá selecionar mais de uma opção, a próxima etapa terá que ser definida através de componente do tipo "botão".</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="autoAdvance" 
                checked={config.autoAdvance !== false}
                onChange={(e) => updateConfig({ autoAdvance: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="autoAdvance" className="text-sm cursor-pointer font-medium">Avançar automaticamente</Label>
            </div>
            <p className="text-xs text-muted-foreground ml-5">Avança para próxima etapa ao selecionar (apenas escolha única).</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTextComponentTab = () => (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
        generateSlug={generateSlug}
      />
      <div>
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <RichTextInput
          value={config.content || ''}
          onChange={(content) => updateConfig({ content })}
          placeholder="Digite o texto aqui..."
          className="mt-1"
          minHeight="100px"
        />
      </div>
    </div>
  );

  const [mediaTab, setMediaTab] = useState<'image' | 'url' | 'emoji'>('url');
  const [mediaAdvancedOpen, setMediaAdvancedOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonEmojis = ['🖼️', '📷', '🌄', '🌅', '🏞️', '🎨', '✨', '💫', '🔥', '❤️', '⭐', '🎯', '💡', '🚀', '💪', '🎉'];

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para fazer upload.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('quiz-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Erro ao fazer upload da imagem.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('quiz-images')
        .getPublicUrl(fileName);

      updateConfig({ mediaUrl: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const renderMediaComponentTab = () => {
    // Check if this is a video component
    const isVideo = component.type === 'video';
    
    if (isVideo) {
      return (
        <div className="space-y-4">
          {/* Video Type Tabs */}
          <div className="flex p-1 bg-muted rounded-lg">
            <button
              type="button"
              onClick={() => updateConfig({ videoType: 'url' })}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                (config.videoType || 'url') === 'url' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => updateConfig({ videoType: 'embed' })}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
                config.videoType === 'embed' ? "bg-background shadow-sm" : "hover:bg-background/50"
              )}
            >
              Embed
            </button>
          </div>

          {/* URL Tab */}
          {(config.videoType || 'url') === 'url' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">URL do vídeo</Label>
                <Input
                  value={config.mediaUrl || ''}
                  onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... ou vimeo.com/..."
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Suporta YouTube, Vimeo, Panda Video, Vturb e outros provedores.
              </p>
              {config.mediaUrl && (
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-xs">Preview do vídeo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Embed Tab */}
          {config.videoType === 'embed' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Código Embed</Label>
                <Textarea
                  value={config.embedCode || ''}
                  onChange={(e) => updateConfig({ embedCode: e.target.value })}
                  placeholder='<iframe src="..." width="100%" height="100%"></iframe>'
                  className="mt-1 font-mono text-xs min-h-[120px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cole o código embed fornecido pela plataforma de vídeo.
              </p>
              {config.embedCode && (
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border border-border">
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📹</div>
                      <p className="text-xs">Embed configurado</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Section */}
          <Collapsible open={mediaAdvancedOpen} onOpenChange={setMediaAdvancedOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Plus className={cn("w-4 h-4 transition-transform", mediaAdvancedOpen && "rotate-45")} />
              AVANÇADO
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-4">
              <ComponentIdDisplay
                id={component.id}
                customId={component.customId}
                type={component.type}
                onUpdateCustomId={onUpdateCustomId}
                generateSlug={generateSlug}
              />
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    }

    // Original image/audio component logic
    return (
      <div className="space-y-4">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
        />

        {/* Media Type Tabs */}
        <div className="flex p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setMediaTab('image')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              mediaTab === 'image' ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            Imagem
          </button>
          <button
            type="button"
            onClick={() => setMediaTab('url')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              mediaTab === 'url' ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMediaTab('emoji')}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
              mediaTab === 'emoji' ? "bg-background shadow-sm" : "hover:bg-background/50"
            )}
          >
            Emoji
          </button>
        </div>

        {/* Image Upload Tab */}
        {mediaTab === 'image' && (
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar imagem
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG, GIF ou WebP. Máximo 5MB.
            </p>
            {config.mediaUrl && !config.mediaUrl.match(/^[\u{1F300}-\u{1F9FF}]/u) && (
              <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={config.mediaUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateConfig({ mediaUrl: '' })}
                  className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* URL Tab */}
        {mediaTab === 'url' && (
          <div className="space-y-3">
            <Input
              value={config.mediaUrl || ''}
              onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {config.mediaUrl && (
              <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={config.mediaUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}
          </div>
        )}

        {/* Emoji Tab */}
        {mediaTab === 'emoji' && (
          <div className="space-y-3">
            <div className="grid grid-cols-8 gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => updateConfig({ mediaUrl: emoji, altText: 'emoji' })}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center text-xl rounded-md hover:bg-muted transition-colors",
                    config.mediaUrl === emoji && "bg-primary/20 ring-2 ring-primary"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Section */}
        <Collapsible open={mediaAdvancedOpen} onOpenChange={setMediaAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={cn("w-4 h-4 transition-transform", mediaAdvancedOpen && "rotate-45")} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
            <div>
              <Label className="text-xs text-muted-foreground">Texto alternativo</Label>
              <Input
                value={config.altText || ''}
                onChange={(e) => updateConfig({ altText: e.target.value })}
                placeholder="Descrição da imagem..."
                className="mt-1"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderSpacerComponentTab = () => {
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
  };

  const renderScriptComponentTab = () => (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
        generateSlug={generateSlug}
      />

      <div>
        <Label className="text-xs text-muted-foreground">Código de incorporação</Label>
        <textarea
          value={config.scriptCode || ''}
          onChange={(e) => updateConfig({ scriptCode: e.target.value })}
          placeholder={'<script>console.log("custom script")</script>'}
          className="mt-1 w-full h-32 px-3 py-2 bg-[#1e1e2e] text-emerald-400 font-mono text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Cole aqui seu código de rastreamento (Facebook Pixel, Google Analytics, etc.)
        </p>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
        <Input
          value={config.scriptDescription || ''}
          onChange={(e) => updateConfig({ scriptDescription: e.target.value })}
          placeholder="Ex: Facebook Pixel de conversão"
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-700 dark:text-yellow-400">
              <strong>Atenção:</strong> Scripts são executados quando o usuário visualiza esta etapa. 
              Certifique-se de usar apenas códigos de fontes confiáveis.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderAlertComponentTab = () => (
    <div className="space-y-4">
      {/* Descrição */}
      <div>
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <RichTextInput
          value={config.description || ''}
          onChange={(description) => updateConfig({ description })}
          placeholder="Texto do alerta..."
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
            generateSlug={generateSlug}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderNotificationComponentTab = () => {
    const variations = config.notificationVariations || [];
    
    const addVariation = () => {
      const newVariation = {
        id: crypto.randomUUID(),
        name: '',
        platform: '',
        number: ''
      };
      updateConfig({ notificationVariations: [...variations, newVariation] });
    };
    
    const updateVariation = (id: string, field: string, value: string) => {
      const updated = variations.map(v => 
        v.id === id ? { ...v, [field]: value } : v
      );
      updateConfig({ notificationVariations: updated });
    };
    
    const removeVariation = (id: string) => {
      updateConfig({ notificationVariations: variations.filter(v => v.id !== id) });
    };
    
    return (
      <div className="space-y-4">
        {/* Título */}
        <div>
          <Label className="text-xs text-muted-foreground">Título</Label>
          <Input
            value={config.notificationTitle || ''}
            onChange={(e) => updateConfig({ notificationTitle: e.target.value })}
            placeholder="@1 acabou de se cadastrar via @2!"
            className="mt-1"
          />
        </div>

        {/* Descrição */}
        <div>
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <Textarea
            value={config.notificationDescription || ''}
            onChange={(e) => updateConfig({ notificationDescription: e.target.value })}
            placeholder="Corra! Faltam apenas @3 ofertas disponíveis"
            className="mt-1"
            rows={2}
          />
        </div>

        {/* Posição na tela */}
        <div>
          <Label className="text-xs text-muted-foreground">Posição na tela</Label>
          <Select 
            value={config.notificationPosition || 'default'} 
            onValueChange={(v) => updateConfig({ notificationPosition: v as ComponentConfig['notificationPosition'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="top">Topo</SelectItem>
              <SelectItem value="bottom">Rodapé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Duração e Intervalo */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Duração (em segundos)</Label>
            <Input
              type="number"
              value={config.notificationDuration || 5}
              onChange={(e) => updateConfig({ notificationDuration: parseInt(e.target.value) || 5 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Intervalo (em segundos)</Label>
            <Input
              type="number"
              value={config.notificationInterval || 2}
              onChange={(e) => updateConfig({ notificationInterval: parseInt(e.target.value) || 2 })}
              className="mt-1"
            />
          </div>
        </div>

        {/* Variações */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Variações</Label>
          <div className="space-y-2 border border-border rounded-lg p-3">
            {variations.map((variation) => (
              <div key={variation.id} className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  value={variation.name}
                  onChange={(e) => updateVariation(variation.id, 'name', e.target.value)}
                  placeholder="Nome"
                  className="flex-1"
                />
                <Input
                  value={variation.platform}
                  onChange={(e) => updateVariation(variation.id, 'platform', e.target.value)}
                  placeholder="Plataforma"
                  className="flex-1"
                />
                <Input
                  value={variation.number}
                  onChange={(e) => updateVariation(variation.id, 'number', e.target.value)}
                  placeholder="Nº"
                  className="w-16"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeVariation(variation.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addVariation} className="w-full mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 p-3 bg-muted/50 rounded-lg">
            Utilize <strong>@1</strong>, <strong>@2</strong> ou <strong>@3</strong> como variáveis nos campos de título ou descrição, para gerar uma sequência de notificações personalizadas.
          </p>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderTimerComponentTab = () => (
    <div className="space-y-4">
      {/* Tempo em segundos */}
      <div>
        <Label className="text-xs text-muted-foreground">Tempo (seg.)</Label>
        <Input
          type="number"
          value={config.timerSeconds || 20}
          onChange={(e) => updateConfig({ timerSeconds: parseInt(e.target.value) || 20 })}
          className="mt-1"
        />
      </div>

      {/* Instrução */}
      <p className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
        Utilize <strong>[time]</strong> no texto abaixo para posicionar a contagem
      </p>

      {/* Texto */}
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <Input
          value={config.timerText || 'Resgate agora seu desconto: [time]'}
          onChange={(e) => updateConfig({ timerText: e.target.value })}
          placeholder="Resgate agora seu desconto: [time]"
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
            generateSlug={generateSlug}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderLoadingComponentTab = () => (
    <div className="space-y-4">
      {/* ID/Name */}
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
        generateSlug={generateSlug}
      />

      {/* Título */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <Input
          value={config.loadingTitle || 'Carregando...'}
          onChange={(e) => updateConfig({ loadingTitle: e.target.value })}
          placeholder="Carregando..."
          className="mt-1"
        />
      </div>

      {/* Delay e Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Começar em</Label>
          <Input
            type="number"
            value={config.loadingDelay ?? 0}
            onChange={(e) => updateConfig({ loadingDelay: parseInt(e.target.value) || 0 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Durar</Label>
          <Input
            type="number"
            value={config.loadingDuration ?? 5}
            onChange={(e) => updateConfig({ loadingDuration: parseInt(e.target.value) || 5 })}
            className="mt-1"
          />
        </div>
      </div>

      {/* Tipo de Navegação */}
      <div>
        <Label className="text-xs text-muted-foreground">Tipo de navegação</Label>
        <Select 
          value={config.loadingNavigation || 'next'} 
          onValueChange={(v) => updateConfig({ loadingNavigation: v as ComponentConfig['loadingNavigation'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next">Navegar entre etapas</SelectItem>
            <SelectItem value="submit">Enviar formulário</SelectItem>
            <SelectItem value="link">Redirecionar para URL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Destino do redirecionamento */}
      {config.loadingNavigation !== 'link' && (
        <div>
          <Label className="text-xs text-muted-foreground">Destino do redirecionamento</Label>
          <Select 
            value={config.loadingDestination || 'next'} 
            onValueChange={(v) => updateConfig({ loadingDestination: v as ComponentConfig['loadingDestination'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Etapa seguinte</SelectItem>
              <SelectItem value="specific">Etapa específica</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* URL de redirecionamento */}
      {config.loadingNavigation === 'link' && (
        <div>
          <Label className="text-xs text-muted-foreground">URL de redirecionamento</Label>
          <Input
            value={config.loadingDestinationUrl || ''}
            onChange={(e) => updateConfig({ loadingDestinationUrl: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      )}

      {/* Descrição */}
      <div>
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <Textarea
          value={config.loadingDescription || ''}
          onChange={(e) => updateConfig({ loadingDescription: e.target.value })}
          placeholder="Aguarde enquanto preparamos tudo..."
          className="mt-1"
        />
      </div>

      {/* Opções */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Opções</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showLoadingTitle !== false}
              onCheckedChange={(checked) => updateConfig({ showLoadingTitle: checked })}
            />
            <Label className="text-sm cursor-pointer">Mostrar título</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showLoadingProgress !== false}
              onCheckedChange={(checked) => updateConfig({ showLoadingProgress: checked })}
            />
            <Label className="text-sm cursor-pointer">Mostrar progresso</Label>
          </div>
        </div>
      </div>

      {/* Cores */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground block">Cores</Label>
        
        {/* Cor de fundo do card */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Fundo do card</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.loadingBgColor || 'hsl(var(--background))' }}
            >
              <input
                type="color"
                value={config.loadingBgColor || '#ffffff'}
                onChange={(e) => updateConfig({ loadingBgColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBgColor || ''}
              onChange={(e) => updateConfig({ loadingBgColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBgColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBgColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor do texto */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor do texto</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.loadingTextColor || 'hsl(var(--foreground))' }}
            >
              <input
                type="color"
                value={config.loadingTextColor || '#000000'}
                onChange={(e) => updateConfig({ loadingTextColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingTextColor || ''}
              onChange={(e) => updateConfig({ loadingTextColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingTextColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingTextColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor da barra de progresso */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor da barra</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.loadingBarColor || 'hsl(var(--primary))' }}
            >
              <input
                type="color"
                value={config.loadingBarColor || '#22c55e'}
                onChange={(e) => updateConfig({ loadingBarColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBarColor || ''}
              onChange={(e) => updateConfig({ loadingBarColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBarColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBarColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor da borda */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor da borda</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.loadingBorderColor || 'hsl(var(--border))' }}
            >
              <input
                type="color"
                value={config.loadingBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ loadingBorderColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBorderColor || ''}
              onChange={(e) => updateConfig({ loadingBorderColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBorderColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBorderColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Espessura e arredondamento da borda */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={config.loadingBorderWidth ?? 1}
              onChange={(e) => updateConfig({ loadingBorderWidth: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={config.loadingBorderRadius ?? 8}
              onChange={(e) => updateConfig({ loadingBorderRadius: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Configurações avançadas em breve
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderLevelComponentTab = () => (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <Input
          value={config.levelTitle || ''}
          onChange={(e) => updateConfig({ levelTitle: e.target.value })}
          placeholder="Nível"
          className="mt-1"
        />
      </div>

      {/* Subtítulo */}
      <div>
        <Label className="text-xs text-muted-foreground">Subtítulo</Label>
        <Input
          value={config.levelSubtitle || ''}
          onChange={(e) => updateConfig({ levelSubtitle: e.target.value })}
          placeholder="Fusce vitae tellus"
          className="mt-1"
        />
      </div>

      {/* Porcentagem */}
      <div>
        <Label className="text-xs text-muted-foreground">Porcentagem</Label>
        <Input
          type="number"
          value={config.levelPercentage ?? 75}
          onChange={(e) => updateConfig({ levelPercentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          min={0}
          max={100}
          className="mt-1"
        />
      </div>

      {/* Texto do indicador */}
      <div>
        <Label className="text-xs text-muted-foreground">Texto do indicador</Label>
        <Input
          value={config.levelIndicatorText || ''}
          onChange={(e) => updateConfig({ levelIndicatorText: e.target.value })}
          placeholder="Ex: Você esta aqui"
          className="mt-1"
        />
      </div>

      {/* Legendas */}
      <div>
        <Label className="text-xs text-muted-foreground">Legendas (separe por vírgula)</Label>
        <Input
          value={config.levelLegends || ''}
          onChange={(e) => updateConfig({ levelLegends: e.target.value })}
          placeholder="Ex: Normal, Médio, Muito"
          className="mt-1"
        />
      </div>

      {/* Opções */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="showMeter" 
            checked={config.showLevelMeter !== false}
            onChange={(e) => updateConfig({ showLevelMeter: e.target.checked })}
            className="rounded border-border"
          />
          <Label htmlFor="showMeter" className="text-sm cursor-pointer">Mostrar Medidor?</Label>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="showProgress" 
            checked={config.showLevelProgress !== false}
            onChange={(e) => updateConfig({ showLevelProgress: e.target.checked })}
            className="rounded border-border"
          />
          <Label htmlFor="showProgress" className="text-sm cursor-pointer">Mostrar progresso?</Label>
        </div>
      </div>

      {/* Navegação */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground block">Navegação</Label>
        
        {/* Tipo de Navegação */}
        <div>
          <Label className="text-xs text-muted-foreground">Tipo de navegação</Label>
          <Select 
            value={config.levelNavigation || 'none'} 
            onValueChange={(v) => updateConfig({ levelNavigation: v as ComponentConfig['levelNavigation'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma (apenas visual)</SelectItem>
              <SelectItem value="next">Navegar entre etapas</SelectItem>
              <SelectItem value="submit">Enviar formulário</SelectItem>
              <SelectItem value="link">Redirecionar para URL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Delay para navegação */}
        {config.levelNavigation && config.levelNavigation !== 'none' && (
          <div>
            <Label className="text-xs text-muted-foreground">Delay (segundos)</Label>
            <Input
              type="number"
              value={config.levelNavigationDelay ?? 2}
              onChange={(e) => updateConfig({ levelNavigationDelay: parseInt(e.target.value) || 0 })}
              min={0}
              className="mt-1"
            />
          </div>
        )}

        {/* Destino do redirecionamento */}
        {config.levelNavigation === 'next' && (
          <div>
            <Label className="text-xs text-muted-foreground">Destino do redirecionamento</Label>
            <Select 
              value={config.levelDestination || 'next'} 
              onValueChange={(v) => updateConfig({ levelDestination: v as ComponentConfig['levelDestination'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="next">Etapa seguinte</SelectItem>
                <SelectItem value="specific">Etapa específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* URL de redirecionamento */}
        {config.levelNavigation === 'link' && (
          <div>
            <Label className="text-xs text-muted-foreground">URL de redirecionamento</Label>
            <Input
              value={config.levelDestinationUrl || ''}
              onChange={(e) => updateConfig({ levelDestinationUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* Cores */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground block">Cores</Label>
        
        {/* Cor de fundo do card */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Fundo do card</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.levelBgColor || 'hsl(var(--background))' }}
            >
              <input
                type="color"
                value={config.levelBgColor || '#ffffff'}
                onChange={(e) => updateConfig({ levelBgColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.levelBgColor || ''}
              onChange={(e) => updateConfig({ levelBgColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.levelBgColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ levelBgColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor do texto */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor do texto</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.levelTextColor || 'hsl(var(--foreground))' }}
            >
              <input
                type="color"
                value={config.levelTextColor || '#000000'}
                onChange={(e) => updateConfig({ levelTextColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.levelTextColor || ''}
              onChange={(e) => updateConfig({ levelTextColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.levelTextColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ levelTextColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor da barra */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor da barra</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.levelBarColor || 'hsl(var(--foreground))' }}
            >
              <input
                type="color"
                value={config.levelBarColor || '#000000'}
                onChange={(e) => updateConfig({ levelBarColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.levelBarColor || ''}
              onChange={(e) => updateConfig({ levelBarColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.levelBarColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ levelBarColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Cor da borda */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor da borda</Label>
          <div className="flex gap-2">
            <div 
              className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
              style={{ backgroundColor: config.levelBorderColor || 'hsl(var(--border))' }}
            >
              <input
                type="color"
                value={config.levelBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ levelBorderColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.levelBorderColor || ''}
              onChange={(e) => updateConfig({ levelBorderColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.levelBorderColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ levelBorderColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Espessura e arredondamento da borda */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={config.levelBorderWidth ?? 1}
              onChange={(e) => updateConfig({ levelBorderWidth: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={config.levelBorderRadius ?? 8}
              onChange={(e) => updateConfig({ levelBorderRadius: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
            generateSlug={generateSlug}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  // =========== ARGUMENTS COMPONENT TAB ===========
  const renderArgumentsComponentTab = () => {
    const argumentItems: ArgumentItem[] = config.argumentItems || [];
    const fileInputRefs: Record<string, HTMLInputElement | null> = {};

    const addArgument = () => {
      const newArg: ArgumentItem = {
        id: crypto.randomUUID(),
        title: 'Titulo aqui',
        description: 'Descrição aqui oi tudo bem isso aqui e uma descrição',
        mediaType: 'none',
      };
      updateConfig({ argumentItems: [...argumentItems, newArg] });
    };

    const updateArgument = (id: string, updates: Partial<ArgumentItem>) => {
      const newItems = argumentItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      updateConfig({ argumentItems: newItems });
    };

    const removeArgument = (id: string) => {
      updateConfig({ argumentItems: argumentItems.filter(item => item.id !== id) });
    };

    const duplicateArgument = (item: ArgumentItem) => {
      const newArg: ArgumentItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      const index = argumentItems.findIndex(a => a.id === item.id);
      const newItems = [...argumentItems];
      newItems.splice(index + 1, 0, newArg);
      updateConfig({ argumentItems: newItems });
    };

    const handleImageUpload = async (id: string, file: File) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `arguments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(filePath);

        updateArgument(id, { imageUrl: publicUrl, mediaType: 'image' });
        toast.success('Imagem enviada com sucesso!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Erro ao enviar imagem');
      }
    };

    const commonEmojis = ['📊', '💡', '🎯', '⭐', '🔥', '💪', '✨', '🚀', '💰', '❤️', '✅', '📈', '🏆', '💎', '🌟', '👍', '🔒', '⚡', '🎁', '📱'];

    return (
      <div className="space-y-4">
        {/* Layout */}
        <div>
          <Label className="text-xs text-muted-foreground">Layout</Label>
          <Select 
            value={config.argumentLayout || 'grid-2'} 
            onValueChange={(v) => updateConfig({ argumentLayout: v as ComponentConfig['argumentLayout'] })}
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

        {/* Disposição */}
        <div>
          <Label className="text-xs text-muted-foreground">Disposição</Label>
          <Select 
            value={config.argumentDisposition || 'image-text'} 
            onValueChange={(v) => updateConfig({ argumentDisposition: v as ComponentConfig['argumentDisposition'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image-text">image | texto</SelectItem>
              <SelectItem value="text-image">texto | image</SelectItem>
              <SelectItem value="image-left">imagem à esquerda</SelectItem>
              <SelectItem value="image-right">imagem à direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Argumentos */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Argumentos</Label>
          <div className="space-y-2">
            {argumentItems.map((item, index) => (
              <div key={item.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                {/* Header with drag handle and actions */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="cursor-grab hover:text-foreground transition-colors">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted"
                      onClick={() => duplicateArgument(item)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeArgument(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-3 space-y-3">
                  {/* Image and text side by side */}
                  <div className="flex gap-3">
                    {/* Image/Emoji area */}
                    <div 
                      className={cn(
                        "flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center transition-all",
                        item.mediaType === 'none' 
                          ? "border-2 border-dashed border-muted-foreground/30 bg-muted/30" 
                          : "border border-border bg-muted/50"
                      )}
                    >
                      {item.mediaType === 'image' && item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : item.mediaType === 'emoji' && item.emoji ? (
                        <span className="text-2xl">{item.emoji}</span>
                      ) : (
                        <Image className="w-5 h-5 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Text inputs */}
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted/30 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary/50 transition-colors">
                        <RichTextInput
                          value={item.title}
                          onChange={(val) => updateArgument(item.id, { title: val })}
                          placeholder="Título do argumento"
                          className="font-medium text-sm"
                        />
                      </div>
                      <div className="bg-muted/20 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary/30 transition-colors">
                        <RichTextInput
                          value={item.description}
                          onChange={(val) => updateArgument(item.id, { description: val })}
                          placeholder="Descrição breve..."
                          className="text-xs text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media type selector */}
                  <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
                    {(['none', 'emoji', 'image'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => updateArgument(item.id, { mediaType: type })}
                        className={cn(
                          "flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all",
                          item.mediaType === type 
                            ? "bg-background shadow-sm text-foreground" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {type === 'none' ? 'Nenhum' : type === 'emoji' ? 'Emoji' : 'Imagem'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Emoji picker */}
                {item.mediaType === 'emoji' && (
                  <div className="px-3 pb-3">
                    <div className="bg-muted/20 rounded-lg p-2">
                      <Label className="text-xs text-muted-foreground mb-2 block">Escolha um emoji</Label>
                      <div className="flex flex-wrap gap-1">
                        {commonEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => updateArgument(item.id, { emoji })}
                            className={cn(
                              "w-7 h-7 flex items-center justify-center text-base rounded-md hover:bg-background transition-all",
                              item.emoji === emoji && "bg-primary/20 ring-2 ring-primary shadow-sm"
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Image input */}
                {item.mediaType === 'image' && (
                  <div className="px-3 pb-3">
                    <div className="bg-muted/20 rounded-lg p-2 space-y-2">
                      <Label className="text-xs text-muted-foreground">Imagem</Label>
                      <ImageInput
                        value={item.imageUrl || ''}
                        onChange={(url) => updateArgument(item.id, { imageUrl: url })}
                        placeholder="Selecione uma imagem"
                      />
                    </div>
                  </div>
                )}

                {/* Background color picker */}
                <div className="px-3 pb-3">
                  <div className="bg-muted/20 rounded-lg p-2">
                    <Label className="text-xs text-muted-foreground mb-2 block">Cor de fundo</Label>
                    <div className="flex gap-2">
                      <div 
                        className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
                        style={{ backgroundColor: item.backgroundColor || 'transparent' }}
                      >
                        <input
                          type="color"
                          value={item.backgroundColor || '#ffffff'}
                          onChange={(e) => updateArgument(item.id, { backgroundColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={item.backgroundColor || ''}
                        onChange={(e) => updateArgument(item.id, { backgroundColor: e.target.value })}
                        placeholder="Transparente"
                        className="flex-1 text-xs h-8 font-mono"
                      />
                      {item.backgroundColor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => updateArgument(item.id, { backgroundColor: undefined })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Border color picker */}
                <div className="px-3 pb-3">
                  <div className="bg-muted/20 rounded-lg p-2">
                    <Label className="text-xs text-muted-foreground mb-2 block">Cor da borda</Label>
                    <div className="flex gap-2">
                      <div 
                        className="relative w-10 h-8 rounded border overflow-hidden cursor-pointer"
                        style={{ backgroundColor: item.borderColor || 'hsl(var(--primary) / 0.3)' }}
                      >
                        <input
                          type="color"
                          value={item.borderColor || '#8b5cf6'}
                          onChange={(e) => updateArgument(item.id, { borderColor: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={item.borderColor || ''}
                        onChange={(e) => updateArgument(item.id, { borderColor: e.target.value })}
                        placeholder="Padrão do tema"
                        className="flex-1 text-xs h-8 font-mono"
                      />
                      {item.borderColor && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => updateArgument(item.id, { borderColor: undefined })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Border width and radius */}
                <div className="px-3 pb-3">
                  <div className="bg-muted/20 rounded-lg p-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Espessura</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={item.borderWidth ?? 1}
                          onChange={(e) => updateArgument(item.id, { borderWidth: parseInt(e.target.value) || 0 })}
                          className="text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Arredondamento</Label>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          value={item.borderRadius ?? 8}
                          onChange={(e) => updateArgument(item.id, { borderRadius: parseInt(e.target.value) || 0 })}
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add argument button */}
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={addArgument}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar argumento
          </Button>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== TESTIMONIALS COMPONENT TAB ===========
  const renderTestimonialsComponentTab = () => {
    const testimonialItems: TestimonialItem[] = config.testimonialItems || [];
    const avatarFileInputRefs: Record<string, HTMLInputElement | null> = {};
    const photoFileInputRefs: Record<string, HTMLInputElement | null> = {};

    const addTestimonial = () => {
      const newItem: TestimonialItem = {
        id: crypto.randomUUID(),
        name: 'Nome do Cliente',
        handle: '@usuario',
        rating: 5,
        text: 'Experiência incrível! Recomendo muito.',
      };
      updateConfig({ testimonialItems: [...testimonialItems, newItem] });
    };

    const updateTestimonial = (id: string, updates: Partial<TestimonialItem>) => {
      const newItems = testimonialItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      updateConfig({ testimonialItems: newItems });
    };

    const removeTestimonial = (id: string) => {
      updateConfig({ testimonialItems: testimonialItems.filter(item => item.id !== id) });
    };

    const duplicateTestimonial = (item: TestimonialItem) => {
      const newItem: TestimonialItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      const index = testimonialItems.findIndex(t => t.id === item.id);
      const newItems = [...testimonialItems];
      newItems.splice(index + 1, 0, newItem);
      updateConfig({ testimonialItems: newItems });
    };

    const handleAvatarUpload = async (id: string, file: File) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `testimonials/avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(filePath);

        updateTestimonial(id, { avatarUrl: publicUrl });
        toast.success('Avatar enviado com sucesso!');
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Erro ao enviar avatar');
      }
    };

    const handlePhotoUpload = async (id: string, file: File) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `testimonials/photos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(filePath);

        updateTestimonial(id, { photoUrl: publicUrl });
        toast.success('Foto enviada com sucesso!');
      } catch (error) {
        console.error('Error uploading photo:', error);
        toast.error('Erro ao enviar foto');
      }
    };

    return (
      <div className="space-y-4">
        {/* Layout */}
        <div>
          <Label className="text-xs text-muted-foreground">Tipo</Label>
          <Select 
            value={config.testimonialLayout || 'list'} 
            onValueChange={(v) => updateConfig({ testimonialLayout: v as ComponentConfig['testimonialLayout'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">Lista</SelectItem>
              <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
              <SelectItem value="carousel">Carrossel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Depoimentos */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Depoimentos</Label>
          <div className="space-y-2">
            {testimonialItems.map((item, index) => (
              <div key={item.id} className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                {/* Header with drag handle and actions */}
                <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="cursor-grab hover:text-foreground transition-colors">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-muted"
                      onClick={() => duplicateTestimonial(item)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeTestimonial(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-3 space-y-3">
                  {/* Avatar and basic info */}
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden transition-all cursor-pointer",
                          item.avatarUrl 
                            ? "border border-border" 
                            : "border-2 border-dashed border-muted-foreground/30 bg-muted/30"
                        )}
                        onClick={() => avatarFileInputRefs[item.id]?.click()}
                      >
                        {item.avatarUrl ? (
                          <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Smile className="w-4 h-4 text-muted-foreground/50" />
                        )}
                      </div>
                      <input
                        ref={(el) => { avatarFileInputRefs[item.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(item.id, file);
                        }}
                      />
                    </div>

                    {/* Name and handle */}
                    <div className="flex-1 space-y-1">
                      <div className="flex gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) => updateTestimonial(item.id, { name: e.target.value })}
                          placeholder="Nome"
                          className="flex-1 text-sm h-8"
                        />
                        <Input
                          type="number"
                          value={item.rating}
                          onChange={(e) => updateTestimonial(item.id, { rating: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })}
                          min={1}
                          max={5}
                          className="w-14 text-sm h-8"
                        />
                      </div>
                      <Input
                        value={item.handle}
                        onChange={(e) => updateTestimonial(item.id, { handle: e.target.value })}
                        placeholder="@usuario"
                        className="text-xs h-7 text-muted-foreground"
                      />
                    </div>
                  </div>

                  {/* Avatar URL input */}
                  <div className="bg-muted/20 rounded-lg p-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Avatar (URL ou upload)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={item.avatarUrl || ''}
                        onChange={(e) => updateTestimonial(item.id, { avatarUrl: e.target.value })}
                        placeholder="https://exemplo.com/avatar.jpg"
                        className="flex-1 text-xs h-8"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => avatarFileInputRefs[item.id]?.click()}
                        className="text-xs h-8 px-3"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                  </div>

                  {/* Testimonial text */}
                  <div className="bg-muted/30 rounded-lg px-3 py-2 border border-transparent focus-within:border-primary/50 transition-colors">
                    <RichTextInput
                      value={item.text}
                      onChange={(val) => updateTestimonial(item.id, { text: val })}
                      placeholder="Texto do depoimento..."
                      className="text-sm"
                    />
                  </div>

                  {/* Photo URL input */}
                  <div className="bg-muted/20 rounded-lg p-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Foto adicional (opcional)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={item.photoUrl || ''}
                        onChange={(e) => updateTestimonial(item.id, { photoUrl: e.target.value })}
                        placeholder="https://exemplo.com/foto.jpg"
                        className="flex-1 text-xs h-8"
                      />
                      <input
                        ref={(el) => { photoFileInputRefs[item.id] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(item.id, file);
                        }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => photoFileInputRefs[item.id]?.click()}
                        className="text-xs h-8 px-3"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                      </Button>
                    </div>
                    {item.photoUrl && (
                      <div className="mt-2 relative rounded-lg overflow-hidden">
                        <img src={item.photoUrl} alt="" className="w-full h-24 object-cover rounded-lg" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 bg-background/80 hover:bg-background"
                          onClick={() => updateTestimonial(item.id, { photoUrl: '' })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add testimonial button */}
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={addTestimonial}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar depoimento
          </Button>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== FAQ COMPONENT TAB ===========
  const renderFaqComponentTab = () => {
    const faqItems: FaqItem[] = config.faqItems || [];

    const addFaq = () => {
      const newItem: FaqItem = {
        id: crypto.randomUUID(),
        question: 'Qual a primeira dúvida a ser resolvida?',
        answer: 'Este é apenas um texto de exemplo utilizado para ilustrar como a resposta de uma dúvida frequente será exibida nesta seção.',
      };
      updateConfig({ faqItems: [...faqItems, newItem] });
    };

    const updateFaq = (id: string, updates: Partial<FaqItem>) => {
      const newItems = faqItems.map(item =>
        item.id === id ? { ...item, ...updates } : item
      );
      updateConfig({ faqItems: newItems });
    };

    const removeFaq = (id: string) => {
      updateConfig({ faqItems: faqItems.filter(item => item.id !== id) });
    };

    const duplicateFaq = (item: FaqItem) => {
      const newItem: FaqItem = {
        ...item,
        id: crypto.randomUUID(),
      };
      const index = faqItems.findIndex(f => f.id === item.id);
      const newItems = [...faqItems];
      newItems.splice(index + 1, 0, newItem);
      updateConfig({ faqItems: newItems });
    };

    return (
      <div className="space-y-4">
        {/* Perguntas */}
        <div className="border border-border rounded-lg p-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Perguntas</Label>
          
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div
                key={item.id}
                className="border border-border rounded-lg p-3 bg-muted/30 group"
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0 cursor-grab" />
                  <div className="flex-1 space-y-2">
                    {/* Question - RichText */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Pergunta</Label>
                      <RichTextInput
                        value={item.question}
                        onChange={(v) => updateFaq(item.id, { question: v })}
                        placeholder="Pergunta"
                        minHeight="50px"
                        showBorder
                      />
                    </div>
                    {/* Answer - RichText */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Resposta</Label>
                      <RichTextInput
                        value={item.answer}
                        onChange={(v) => updateFaq(item.id, { answer: v })}
                        placeholder="Resposta..."
                        minHeight="80px"
                        showBorder
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => duplicateFaq(item)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => removeFaq(item.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add FAQ button */}
          <Button
            variant="outline"
            className="w-full mt-3"
            onClick={addFaq}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar pergunta
          </Button>
        </div>

        {/* Opções */}
        <div className="border border-border rounded-lg p-3">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Opções</Label>
          <div className="flex items-center gap-2">
            <Switch
              id="faqFirstOpen"
              checked={config.faqFirstOpen !== false}
              onCheckedChange={(checked) => updateConfig({ faqFirstOpen: checked })}
            />
            <Label htmlFor="faqFirstOpen" className="text-sm cursor-pointer">Primeira pergunta ativa</Label>
          </div>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== PRICE COMPONENT TAB ===========
  const renderPriceComponentTab = () => {
    return (
      <div className="space-y-4">
        {/* Título */}
        <div>
          <Label className="text-xs text-muted-foreground">Título</Label>
          <Input
            value={config.priceTitle || ''}
            onChange={(e) => updateConfig({ priceTitle: e.target.value })}
            placeholder="Plano PRO"
            className="mt-1"
          />
        </div>

        {/* Prefixo, Valor, Sufixo */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Prefixo</Label>
            <Input
              value={config.pricePrefix || ''}
              onChange={(e) => updateConfig({ pricePrefix: e.target.value })}
              placeholder="10% off"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Valor</Label>
            <Input
              value={config.priceValue || ''}
              onChange={(e) => updateConfig({ priceValue: e.target.value })}
              placeholder="R$ 89,90"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Sufixo</Label>
            <Input
              value={config.priceSuffix || ''}
              onChange={(e) => updateConfig({ priceSuffix: e.target.value })}
              placeholder="à vista"
              className="mt-1"
            />
          </div>
        </div>

        {/* Texto destaque */}
        <div>
          <Label className="text-xs text-muted-foreground">Texto destaque</Label>
          <Input
            value={config.priceHighlight || ''}
            onChange={(e) => updateConfig({ priceHighlight: e.target.value })}
            placeholder="Ex: popular, destaque..."
            className="mt-1"
          />
        </div>

        {/* Tipo de preço */}
        <div>
          <Label className="text-xs text-muted-foreground">Tipo de preço</Label>
          <Select 
            value={config.priceType || 'illustrative'} 
            onValueChange={(v) => updateConfig({ priceType: v as ComponentConfig['priceType'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="illustrative">Ilustrativo</SelectItem>
              <SelectItem value="redirect">Redirecionar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* URL de redirecionamento - só mostra se for redirect */}
        {config.priceType === 'redirect' && (
          <div>
            <Label className="text-xs text-muted-foreground">URL de redirecionamento</Label>
            <Input
              value={config.priceRedirectUrl || ''}
              onChange={(e) => updateConfig({ priceRedirectUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </div>
        )}

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== BEFORE-AFTER COMPONENT TAB ===========
  const renderBeforeAfterComponentTab = () => {
    const image1FileInputRef = useRef<HTMLInputElement>(null);
    const image2FileInputRef = useRef<HTMLInputElement>(null);
    const [uploading1, setUploading1] = useState(false);
    const [uploading2, setUploading2] = useState(false);

    const handleImageUpload = async (imageKey: 'beforeAfterImage1' | 'beforeAfterImage2', file: File, setUploading: (v: boolean) => void) => {
      try {
        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `before-after/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('quiz-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quiz-images')
          .getPublicUrl(filePath);

        updateConfig({ [imageKey]: publicUrl });
        toast.success('Imagem enviada com sucesso!');
      } catch (error) {
        console.error('Error uploading image:', error);
        toast.error('Erro ao enviar imagem');
      } finally {
        setUploading(false);
      }
    };

    return (
      <div className="space-y-4">
        {/* Primeira imagem */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Label className="text-xs text-muted-foreground p-3 block border-b border-border bg-muted/30">Primeira imagem</Label>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid grid-cols-2 m-3 mb-0">
              <TabsTrigger value="image">Imagem</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="p-3 pt-2">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => image1FileInputRef.current?.click()}
                  disabled={uploading1}
                >
                  {uploading1 ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar imagem
                    </>
                  )}
                </Button>
                <input
                  ref={image1FileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('beforeAfterImage1', file, setUploading1);
                  }}
                />
                {config.beforeAfterImage1 && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={config.beforeAfterImage1}
                      alt="Primeira imagem"
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => updateConfig({ beforeAfterImage1: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="url" className="p-3 pt-2">
              <Input
                value={config.beforeAfterImage1 || ''}
                onChange={(e) => updateConfig({ beforeAfterImage1: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Segunda imagem */}
        <div className="border border-border rounded-lg overflow-hidden">
          <Label className="text-xs text-muted-foreground p-3 block border-b border-border bg-muted/30">Segunda imagem</Label>
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid grid-cols-2 m-3 mb-0">
              <TabsTrigger value="image">Imagem</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            <TabsContent value="image" className="p-3 pt-2">
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => image2FileInputRef.current?.click()}
                  disabled={uploading2}
                >
                  {uploading2 ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Selecionar imagem
                    </>
                  )}
                </Button>
                <input
                  ref={image2FileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload('beforeAfterImage2', file, setUploading2);
                  }}
                />
                {config.beforeAfterImage2 && (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img
                      src={config.beforeAfterImage2}
                      alt="Segunda imagem"
                      className="w-full h-32 object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => updateConfig({ beforeAfterImage2: '' })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="url" className="p-3 pt-2">
              <Input
                value={config.beforeAfterImage2 || ''}
                onChange={(e) => updateConfig({ beforeAfterImage2: e.target.value })}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== CAROUSEL COMPONENT TAB ===========
  const renderCarouselComponentTab = () => {
    const items = config.carouselItems || [
      { id: '1', image: '', description: 'Exemplo de descrição' },
      { id: '2', image: '', description: 'Exemplo de descrição' }
    ];

    const addItem = () => {
      const newItem = {
        id: crypto.randomUUID(),
        image: '',
        description: 'Exemplo de descrição'
      };
      updateConfig({ carouselItems: [...items, newItem] });
    };

    const updateItem = (id: string, updates: Partial<typeof items[0]>) => {
      updateConfig({
        carouselItems: items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      });
    };

    const removeItem = (id: string) => {
      if (items.length <= 1) return;
      updateConfig({ carouselItems: items.filter(item => item.id !== id) });
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
      const newItems = [...items];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      updateConfig({ carouselItems: newItems });
    };

    return (
      <div className="space-y-4">
        {/* Layout */}
        <div>
          <Label className="text-xs text-muted-foreground">Layout</Label>
          <Select
            value={config.carouselLayout || 'image-text'}
            onValueChange={(v) => updateConfig({ carouselLayout: v as ComponentConfig['carouselLayout'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image-text">Imagem e Texto</SelectItem>
              <SelectItem value="text-only">Apenas Texto</SelectItem>
              <SelectItem value="image-only">Apenas Imagem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pagination & Autoplay */}
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Paginação</Label>
            <Switch
              checked={config.carouselPagination !== false}
              onCheckedChange={(checked) => updateConfig({ carouselPagination: checked })}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Autoplay</Label>
              <Switch
                checked={config.carouselAutoplay === true}
                onCheckedChange={(checked) => updateConfig({ carouselAutoplay: checked })}
              />
            </div>
            {config.carouselAutoplay && (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={config.carouselAutoplayInterval || 3}
                  onChange={(e) => updateConfig({ carouselAutoplayInterval: parseInt(e.target.value) || 3 })}
                  className="w-16 h-8 text-center"
                  min={1}
                  max={30}
                />
                <span className="text-xs text-muted-foreground">(seg.)</span>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <Label className="text-xs text-muted-foreground">Itens</Label>
          <div className="space-y-3 mt-2">
            {items.map((item, index) => (
              <CarouselItemEditor
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                layout={config.carouselLayout || 'image-text'}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onRemove={() => removeItem(item.id)}
                onMoveUp={() => index > 0 && moveItem(index, index - 1)}
                onMoveDown={() => index < items.length - 1 && moveItem(index, index + 1)}
              />
            ))}
            <Button
              variant="ghost"
              className="w-full"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              adicionar
            </Button>
          </div>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== METRICS COMPONENT TAB ===========
  const renderMetricsComponentTab = () => {
    const items: MetricItem[] = config.metricItems || [
      { id: '1', type: 'bar', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' },
      { id: '2', type: 'circular', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' }
    ];

    const addItem = () => {
      const newItem: MetricItem = {
        id: crypto.randomUUID(),
        type: 'bar',
        color: 'theme',
        value: 30,
        label: 'Fusce vitae tellus in risus sagittis condimentum'
      };
      updateConfig({ metricItems: [...items, newItem] });
    };

    const updateItem = (id: string, updates: Partial<MetricItem>) => {
      updateConfig({
        metricItems: items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      });
    };

    const removeItem = (id: string) => {
      updateConfig({ metricItems: items.filter(item => item.id !== id) });
    };

    const moveItem = (fromIndex: number, toIndex: number) => {
      const newItems = [...items];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, removed);
      updateConfig({ metricItems: newItems });
    };

    return (
      <div className="space-y-4">
        {/* Layout */}
        <div>
          <Label className="text-xs text-muted-foreground">Layout</Label>
          <Select
            value={config.metricsLayout || 'grid-2'}
            onValueChange={(v) => updateConfig({ metricsLayout: v as ComponentConfig['metricsLayout'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">Itens em lista</SelectItem>
              <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
              <SelectItem value="grid-3">Grade de 3 colunas</SelectItem>
              <SelectItem value="grid-4">Grade de 4 colunas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Disposition */}
        <div>
          <Label className="text-xs text-muted-foreground">Disposição</Label>
          <Select
            value={config.metricsDisposition || 'legend-chart'}
            onValueChange={(v) => updateConfig({ metricsDisposition: v as ComponentConfig['metricsDisposition'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chart-legend">gráfico | legenda</SelectItem>
              <SelectItem value="legend-chart">legenda | gráfico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Gráficos */}
        <div>
          <Label className="text-xs text-muted-foreground">Gráficos</Label>
          <div className="space-y-3 mt-2">
            {items.map((item, index) => (
              <MetricItemEditor
                key={item.id}
                item={item}
                index={index}
                totalItems={items.length}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onRemove={() => removeItem(item.id)}
                onMoveUp={() => index > 0 && moveItem(index, index - 1)}
                onMoveDown={() => index < items.length - 1 && moveItem(index, index + 1)}
              />
            ))}
            <Button
              variant="ghost"
              className="w-full"
              onClick={addItem}
            >
              <Plus className="w-4 h-4 mr-2" />
              adicionar gráfico
            </Button>
          </div>
        </div>

        {/* Avançado */}
        <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
            AVANÇADO
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <ComponentIdDisplay
              id={component.id}
              customId={component.customId}
              type={component.type}
              onUpdateCustomId={onUpdateCustomId}
              generateSlug={generateSlug}
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  // =========== APARÊNCIA TAB ===========
  const renderAppearanceTab = () => {
    const isOptionsComponent = ['options', 'single', 'multiple', 'yesno'].includes(component.type);
    const isAlertComponent = component.type === 'alert';
    const isNotificationComponent = component.type === 'notification';
    const isTimerComponent = component.type === 'timer';
    const isLoadingComponent = component.type === 'loading';
    const isLevelComponent = component.type === 'level';
    const isTestimonialsComponent = component.type === 'testimonials';
    const isFaqComponent = component.type === 'faq';
    const isPriceComponent = component.type === 'price';
    const isBeforeAfterComponent = component.type === 'before-after';
    const isCarouselComponent = component.type === 'carousel';
    const isMetricsComponent = component.type === 'metrics';
    const isChartsComponent = component.type === 'charts';

    // Charts component appearance
    if (isChartsComponent) {
      const chartConfig = config.chartConfig || getDefaultChartConfig();
      const handleUpdateChartConfig = (updates: Partial<ChartConfig>) => {
        updateConfig({ chartConfig: { ...chartConfig, ...updates } });
      };
      return <ChartEditorAppearanceTab config={chartConfig} onUpdate={handleUpdateChartConfig} />;
    }

    // Price component appearance
    if (isPriceComponent) {
      return (
        <div className="space-y-4">
          {/* Layout */}
          <div>
            <Label className="text-xs text-muted-foreground">Layout</Label>
            <Select 
              value={config.priceLayout || 'horizontal'} 
              onValueChange={(v) => updateConfig({ priceLayout: v as ComponentConfig['priceLayout'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fundo */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Fundo</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">Tipo de fundo</Label>
              <Select 
                value={config.priceBgType || 'solid'} 
                onValueChange={(v) => updateConfig({ priceBgType: v as 'solid' | 'gradient' | 'transparent' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Cor sólida</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="transparent">Transparente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.priceBgType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                    <Input
                      type="color"
                      value={config.priceGradientStart || '#667eea'}
                      onChange={(e) => updateConfig({ priceGradientStart: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor final</Label>
                    <Input
                      type="color"
                      value={config.priceGradientEnd || '#764ba2'}
                      onChange={(e) => updateConfig({ priceGradientEnd: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ângulo ({config.priceGradientAngle ?? 135}°)</Label>
                  <Slider
                    value={[config.priceGradientAngle ?? 135]}
                    onValueChange={([v]) => updateConfig({ priceGradientAngle: v })}
                    min={0}
                    max={360}
                    step={15}
                    className="mt-2"
                  />
                </div>
                <div 
                  className="h-8 rounded-md border border-border"
                  style={{
                    background: `linear-gradient(${config.priceGradientAngle ?? 135}deg, ${config.priceGradientStart || '#667eea'}, ${config.priceGradientEnd || '#764ba2'})`
                  }}
                />
              </div>
            )}

            {(!config.priceBgType || config.priceBgType === 'solid') && (
              <div>
                <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                <Input
                  type="color"
                  value={config.priceBgColor || '#ffffff'}
                  onChange={(e) => updateConfig({ priceBgColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Cores de texto */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores de texto</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Título</Label>
                <Input
                  type="color"
                  value={config.priceTitleColor || '#1f2937'}
                  onChange={(e) => updateConfig({ priceTitleColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Valor</Label>
                <Input
                  type="color"
                  value={config.priceValueColor || '#1f2937'}
                  onChange={(e) => updateConfig({ priceValueColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prefixo/Sufixo</Label>
                <Input
                  type="color"
                  value={config.pricePrefixColor || '#6b7280'}
                  onChange={(e) => updateConfig({ pricePrefixColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bordas */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">Cor da borda</Label>
              <Input
                type="color"
                value={config.priceBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ priceBorderColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Espessura</Label>
                <Input
                  type="number"
                  value={config.priceBorderWidth ?? 1}
                  onChange={(e) => updateConfig({ priceBorderWidth: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={10}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Arredondamento</Label>
                <Input
                  type="number"
                  value={config.priceBorderRadius ?? 12}
                  onChange={(e) => updateConfig({ priceBorderRadius: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={50}
                  className="mt-1"
                />
              </div>
            </div>
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

    // Before-After component appearance
    if (isBeforeAfterComponent) {
      return (
        <div className="space-y-4">
          {/* Proporção */}
          <div>
            <Label className="text-xs text-muted-foreground">Proporção</Label>
            <Select 
              value={config.beforeAfterRatio || '1:1'} 
              onValueChange={(v) => updateConfig({ beforeAfterRatio: v as ComponentConfig['beforeAfterRatio'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                <SelectItem value="16:9">16:9 (Padrão)</SelectItem>
                <SelectItem value="4:3">4:3 (Retangular)</SelectItem>
                <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
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
                  <SelectItem value="start">Topo</SelectItem>
                  <SelectItem value="center">Meio</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    // Carousel component appearance
    if (isCarouselComponent) {
      return (
        <div className="space-y-4">
          {/* Proporção da imagem */}
          <div>
            <Label className="text-xs text-muted-foreground">Proporção da imagem</Label>
            <Select
              value={config.carouselImageRatio || '4:3'}
              onValueChange={(v) => updateConfig({ carouselImageRatio: v as ComponentConfig['carouselImageRatio'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
                <SelectItem value="4:3">4:3 (Padrão)</SelectItem>
                <SelectItem value="3:2">3:2 (Foto)</SelectItem>
                <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                <SelectItem value="2:3">2:3 (Retrato)</SelectItem>
                <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo (borda) */}
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select
              value={config.carouselBorder ? 'border' : 'no-border'}
              onValueChange={(v) => updateConfig({ carouselBorder: v === 'border' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-border">Sem borda</SelectItem>
                <SelectItem value="border">Borda</SelectItem>
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
                  <SelectItem value="start">Topo</SelectItem>
                  <SelectItem value="center">Meio</SelectItem>
                  <SelectItem value="end">Fim</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    // Metrics component appearance
    if (isMetricsComponent) {
      return (
        <div className="space-y-4">
          {/* Fundo */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Fundo</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">Tipo de fundo</Label>
              <Select 
                value={config.metricsBgType || 'solid'} 
                onValueChange={(v) => updateConfig({ metricsBgType: v as 'solid' | 'gradient' | 'transparent' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Cor sólida</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="transparent">Transparente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.metricsBgType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                    <Input
                      type="color"
                      value={config.metricsGradientStart || '#667eea'}
                      onChange={(e) => updateConfig({ metricsGradientStart: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor final</Label>
                    <Input
                      type="color"
                      value={config.metricsGradientEnd || '#764ba2'}
                      onChange={(e) => updateConfig({ metricsGradientEnd: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ângulo ({config.metricsGradientAngle ?? 135}°)</Label>
                  <Slider
                    value={[config.metricsGradientAngle ?? 135]}
                    onValueChange={([v]) => updateConfig({ metricsGradientAngle: v })}
                    min={0}
                    max={360}
                    step={15}
                    className="mt-2"
                  />
                </div>
                <div 
                  className="h-8 rounded-md border border-border"
                  style={{
                    background: `linear-gradient(${config.metricsGradientAngle ?? 135}deg, ${config.metricsGradientStart || '#667eea'}, ${config.metricsGradientEnd || '#764ba2'})`
                  }}
                />
              </div>
            )}

            {(!config.metricsBgType || config.metricsBgType === 'solid') && (
              <div>
                <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                <Input
                  type="color"
                  value={config.metricsBgColor || '#ffffff'}
                  onChange={(e) => updateConfig({ metricsBgColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Cores de texto */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores de texto</Label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Legenda</Label>
                <Input
                  type="color"
                  value={config.metricsTextColor || '#6b7280'}
                  onChange={(e) => updateConfig({ metricsTextColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Valor</Label>
                <Input
                  type="color"
                  value={config.metricsValueColor || '#6b7280'}
                  onChange={(e) => updateConfig({ metricsValueColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bordas */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">Cor da borda</Label>
              <Input
                type="color"
                value={config.metricsBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ metricsBorderColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Espessura</Label>
                <Input
                  type="number"
                  value={config.metricsBorderWidth ?? 1}
                  onChange={(e) => updateConfig({ metricsBorderWidth: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={10}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Arredondamento</Label>
                <Input
                  type="number"
                  value={config.metricsBorderRadius ?? 8}
                  onChange={(e) => updateConfig({ metricsBorderRadius: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={50}
                  className="mt-1"
                />
              </div>
            </div>
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

    // FAQ component appearance
    if (isFaqComponent) {
      return (
        <div className="space-y-4">
          {/* Detalhe */}
          <div>
            <Label className="text-xs text-muted-foreground">Detalhe</Label>
            <Select 
              value={config.faqDetailType || 'arrow'} 
              onValueChange={(v) => updateConfig({ faqDetailType: v as ComponentConfig['faqDetailType'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arrow">Seta</SelectItem>
                <SelectItem value="plus-minus">Mais e menos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Colors */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores</Label>
            
            {/* Fundo */}
            <div>
              <Label className="text-xs text-muted-foreground">Tipo de fundo</Label>
              <Select 
                value={config.faqBgType || 'solid'} 
                onValueChange={(v) => updateConfig({ faqBgType: v as 'solid' | 'gradient' | 'transparent' })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Cor sólida</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="transparent">Transparente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.faqBgType === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                    <Input
                      type="color"
                      value={config.faqGradientStart || '#667eea'}
                      onChange={(e) => updateConfig({ faqGradientStart: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cor final</Label>
                    <Input
                      type="color"
                      value={config.faqGradientEnd || '#764ba2'}
                      onChange={(e) => updateConfig({ faqGradientEnd: e.target.value })}
                      className="mt-1 h-9 w-full cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Ângulo ({config.faqGradientAngle ?? 135}°)</Label>
                  <Slider
                    value={[config.faqGradientAngle ?? 135]}
                    onValueChange={([v]) => updateConfig({ faqGradientAngle: v })}
                    min={0}
                    max={360}
                    step={15}
                    className="mt-2"
                  />
                </div>
                {/* Preview */}
                <div 
                  className="h-8 rounded-md border border-border"
                  style={{
                    background: `linear-gradient(${config.faqGradientAngle ?? 135}deg, ${config.faqGradientStart || '#667eea'}, ${config.faqGradientEnd || '#764ba2'})`
                  }}
                />
              </div>
            )}

            {(!config.faqBgType || config.faqBgType === 'solid') && (
              <div>
                <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                <Input
                  type="color"
                  value={config.faqBgColor || '#ffffff'}
                  onChange={(e) => updateConfig({ faqBgColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Título</Label>
                <Input
                  type="color"
                  value={config.faqTextColor || '#1f2937'}
                  onChange={(e) => updateConfig({ faqTextColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Resposta</Label>
                <Input
                  type="color"
                  value={config.faqAnswerColor || '#6b7280'}
                  onChange={(e) => updateConfig({ faqAnswerColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ícone</Label>
                <Input
                  type="color"
                  value={config.faqIconColor || '#6b7280'}
                  onChange={(e) => updateConfig({ faqIconColor: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Borders */}
          <div className="border border-border rounded-lg p-3 space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground">Cor da borda</Label>
              <Input
                type="color"
                value={config.faqBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ faqBorderColor: e.target.value })}
                className="mt-1 h-9 w-full cursor-pointer"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Espessura</Label>
                <Input
                  type="number"
                  value={config.faqBorderWidth ?? 1}
                  onChange={(e) => updateConfig({ faqBorderWidth: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={10}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Arredondamento</Label>
                <Input
                  type="number"
                  value={config.faqBorderRadius ?? 8}
                  onChange={(e) => updateConfig({ faqBorderRadius: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={50}
                  className="mt-1"
                />
              </div>
            </div>
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

    // Loading component appearance
    if (isLoadingComponent) {
      return (
        <div className="space-y-4">
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
              onValueChange={(vals) => updateConfig({ width: vals[0] })}
              min={10}
              max={100}
              step={5}
              className="[&>span:first-child]:bg-primary"
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

    // Testimonials component appearance
    if (isTestimonialsComponent) {
      return (
        <div className="space-y-4">
          {/* Bordas */}
          <div>
            <Label className="text-xs text-muted-foreground">Bordas</Label>
            <Select 
              value={config.testimonialBorderRadius || 'small'} 
              onValueChange={(v) => updateConfig({ testimonialBorderRadius: v as ComponentConfig['testimonialBorderRadius'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem borda</SelectItem>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sombra */}
          <div>
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Select 
              value={config.testimonialShadow || 'none'} 
              onValueChange={(v) => updateConfig({ testimonialShadow: v as ComponentConfig['testimonialShadow'] })}
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
              value={config.testimonialSpacing || 'simple'} 
              onValueChange={(v) => updateConfig({ testimonialSpacing: v as ComponentConfig['testimonialSpacing'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="simple">Simples</SelectItem>
                <SelectItem value="relaxed">Grande</SelectItem>
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

    // Level component appearance
    if (isLevelComponent) {
      return (
        <div className="space-y-4">
          {/* Tipo */}
          <div>
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select 
              value={config.levelType || 'line'} 
              onValueChange={(v) => updateConfig({ levelType: v as ComponentConfig['levelType'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Linha</SelectItem>
                <SelectItem value="segments">Traços</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cor */}
          <div>
            <Label className="text-xs text-muted-foreground">Cor</Label>
            <Select 
              value={config.levelColor || 'theme'} 
              onValueChange={(v) => updateConfig({ levelColor: v as ComponentConfig['levelColor'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theme">Tema</SelectItem>
                <SelectItem value="green-red">Verde → Vermelho</SelectItem>
                <SelectItem value="red-green">Vermelho → Verde</SelectItem>
                <SelectItem value="opaque">Opaco</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="yellow">Amarelo</SelectItem>
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

    // Timer component appearance
    if (isTimerComponent) {
      return (
        <div className="space-y-4">
          {/* Estilo */}
          <div>
            <Label className="text-xs text-muted-foreground">Estilo</Label>
            <Select 
              value={config.timerStyle || 'red'} 
              onValueChange={(v) => updateConfig({ timerStyle: v as ComponentConfig['timerStyle'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="yellow">Amarelo</SelectItem>
                <SelectItem value="gray">Cinza</SelectItem>
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

    // Notification component appearance
    if (isNotificationComponent) {
      return (
        <div className="space-y-4">
          {/* Estilo */}
          <div>
            <Label className="text-xs text-muted-foreground">Estilo</Label>
            <Select 
              value={config.notificationStyle || 'default'} 
              onValueChange={(v) => updateConfig({ notificationStyle: v as ComponentConfig['notificationStyle'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="white">Branco</SelectItem>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="yellow">Amarelo</SelectItem>
                <SelectItem value="gray">Cinza</SelectItem>
              </SelectContent>
            </Select>
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

    // Alert component appearance
    if (isAlertComponent) {
      return (
        <div className="space-y-4">
          {/* Estilo */}
          <div>
            <Label className="text-xs text-muted-foreground">Estilo</Label>
            <Select 
              value={config.alertStyle || 'red'} 
              onValueChange={(v) => updateConfig({ alertStyle: v as ComponentConfig['alertStyle'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">Vermelho</SelectItem>
                <SelectItem value="yellow">Amarelo</SelectItem>
                <SelectItem value="green">Verde</SelectItem>
                <SelectItem value="blue">Azul</SelectItem>
                <SelectItem value="gray">Cinza</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destacar */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="alertHighlight" 
              checked={config.alertHighlight || false}
              onChange={(e) => updateConfig({ alertHighlight: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="alertHighlight" className="text-sm cursor-pointer">Destacar</Label>
          </div>

          {/* Margem interna */}
          <div>
            <Label className="text-xs text-muted-foreground">Margem interna</Label>
            <Select 
              value={config.alertPadding || 'default'} 
              onValueChange={(v) => updateConfig({ alertPadding: v as ComponentConfig['alertPadding'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="default">Padrão</SelectItem>
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
    
    if (isOptionsComponent) {
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
              {/* Proporção de imagens */}
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

              {/* Disposição */}
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

          {/* ===== CORES DAS OPÇÕES ===== */}
          <Collapsible className="border border-border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
              <span className="text-sm font-medium">Cores das opções</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0 space-y-3">
              {/* Background Type */}
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de fundo</Label>
                <Select 
                  value={config.optionBgType || 'solid'} 
                  onValueChange={(v) => updateConfig({ optionBgType: v as 'solid' | 'gradient' | 'transparent' })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Cor sólida</SelectItem>
                    <SelectItem value="gradient">Gradiente</SelectItem>
                    <SelectItem value="transparent">Transparente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.optionBgType === 'solid' && (
                <div>
                  <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionBgColor || '#ffffff' }}>
                      <input
                        type="color"
                        value={config.optionBgColor || '#ffffff'}
                        onChange={(e) => updateConfig({ optionBgColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.optionBgColor || ''}
                      onChange={(e) => updateConfig({ optionBgColor: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {config.optionBgType === 'gradient' && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                      <div className="flex gap-1 mt-1">
                        <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionGradientStart || '#a855f7' }}>
                          <input
                            type="color"
                            value={config.optionGradientStart || '#a855f7'}
                            onChange={(e) => updateConfig({ optionGradientStart: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <Input
                          value={config.optionGradientStart || ''}
                          onChange={(e) => updateConfig({ optionGradientStart: e.target.value })}
                          placeholder="#a855f7"
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Cor final</Label>
                      <div className="flex gap-1 mt-1">
                        <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionGradientEnd || '#ec4899' }}>
                          <input
                            type="color"
                            value={config.optionGradientEnd || '#ec4899'}
                            onChange={(e) => updateConfig({ optionGradientEnd: e.target.value })}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <Input
                          value={config.optionGradientEnd || ''}
                          onChange={(e) => updateConfig({ optionGradientEnd: e.target.value })}
                          placeholder="#ec4899"
                          className="flex-1 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Ângulo do gradiente: {config.optionGradientAngle || 90}°</Label>
                    <Slider
                      value={[config.optionGradientAngle || 90]}
                      onValueChange={([v]) => updateConfig({ optionGradientAngle: v })}
                      min={0}
                      max={360}
                      step={15}
                      className="mt-1"
                    />
                  </div>
                </>
              )}

              {/* Text color */}
              <div>
                <Label className="text-xs text-muted-foreground">Cor do texto</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionTextColor || '#000000' }}>
                    <input
                      type="color"
                      value={config.optionTextColor || '#000000'}
                      onChange={(e) => updateConfig({ optionTextColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={config.optionTextColor || ''}
                    onChange={(e) => updateConfig({ optionTextColor: e.target.value })}
                    placeholder="#000000"
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Border color and width */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor da borda</Label>
                  <div className="flex gap-1 mt-1">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionBorderColor || '#e5e5e5' }}>
                      <input
                        type="color"
                        value={config.optionBorderColor || '#e5e5e5'}
                        onChange={(e) => updateConfig({ optionBorderColor: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.optionBorderColor || ''}
                      onChange={(e) => updateConfig({ optionBorderColor: e.target.value })}
                      placeholder="#e5e5e5"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Espessura</Label>
                  <Input
                    type="number"
                    value={config.optionBorderWidth ?? 1}
                    onChange={(e) => updateConfig({ optionBorderWidth: parseInt(e.target.value) || 0 })}
                    min={0}
                    max={10}
                    className="mt-1"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* ===== CORES QUANDO SELECIONADO ===== */}
          <Collapsible className="border border-border rounded-lg">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
              <span className="text-sm font-medium">Quando selecionado</span>
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-3 pt-0 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionSelectedBgColor || '#a855f7' }}>
                    <input
                      type="color"
                      value={config.optionSelectedBgColor || '#a855f7'}
                      onChange={(e) => updateConfig({ optionSelectedBgColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={config.optionSelectedBgColor || ''}
                    onChange={(e) => updateConfig({ optionSelectedBgColor: e.target.value })}
                    placeholder="#a855f7"
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cor do texto</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionSelectedTextColor || '#ffffff' }}>
                    <input
                      type="color"
                      value={config.optionSelectedTextColor || '#ffffff'}
                      onChange={(e) => updateConfig({ optionSelectedTextColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={config.optionSelectedTextColor || ''}
                    onChange={(e) => updateConfig({ optionSelectedTextColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cor da borda</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.optionSelectedBorderColor || '#a855f7' }}>
                    <input
                      type="color"
                      value={config.optionSelectedBorderColor || '#a855f7'}
                      onChange={(e) => updateConfig({ optionSelectedBorderColor: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={config.optionSelectedBorderColor || ''}
                    onChange={(e) => updateConfig({ optionSelectedBorderColor: e.target.value })}
                    placeholder="#a855f7"
                    className="flex-1 font-mono text-xs"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

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
