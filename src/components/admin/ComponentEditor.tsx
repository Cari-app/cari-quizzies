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
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  buttonAction?: 'next' | 'submit' | 'link';
  buttonLink?: string;
  // Options specific
  options?: OptionItem[];
  allowMultiple?: boolean;
  autoAdvance?: boolean;
  introType?: 'text' | 'image' | 'video';
  // Options appearance
  optionStyle?: 'simple' | 'card' | 'image';
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
  // Appearance
  labelStyle?: 'default' | 'floating' | 'hidden';
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  // Display/Visibility
  showAfterSeconds?: number;
  displayRules?: Array<{ id: string; condition: string }>;
  // Height/Weight specific
  layoutType?: 'input' | 'ruler';
  unit?: 'cm' | 'pol' | 'kg' | 'lb';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
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
  argumentItems?: ArgumentItem[];
  argumentLayout?: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  argumentDisposition?: 'image-text' | 'text-image' | 'image-left' | 'image-right';
  // Testimonials specific
  testimonialItems?: TestimonialItem[];
  testimonialLayout?: 'list' | 'grid-2' | 'carousel';
  testimonialBorderRadius?: 'none' | 'small' | 'medium' | 'large';
  testimonialShadow?: 'none' | 'sm' | 'md' | 'lg';
  testimonialSpacing?: 'compact' | 'simple' | 'relaxed';
}

interface ComponentEditorProps {
  component: DroppedComponent;
  onUpdate: (config: ComponentConfig) => void;
  onUpdateCustomId: (customId: string) => void;
  onDelete: () => void;
}

export function ComponentEditor({ component, onUpdate, onUpdateCustomId, onDelete }: ComponentEditorProps) {
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
      id: Date.now().toString(),
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
      displayRules: [...currentRules, { id: Date.now().toString(), condition: '' }]
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

  const renderInputComponentTab = () => (
    <div className="space-y-4">
      {/* ID/Name */}
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`${component.type}_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>

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
        <div>
          <Label className="text-xs text-muted-foreground">ID/Name</Label>
          <Input
            value={component.customId || ''}
            onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
            placeholder={`${component.type}_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
            className="mt-1 font-mono text-xs"
          />
        </div>

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

  const renderButtonComponentTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`button_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Texto do botão</Label>
        <RichTextInput
          value={config.buttonText || 'Continuar'}
          onChange={(buttonText) => updateConfig({ buttonText })}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <Select value={config.buttonStyle || 'primary'} onValueChange={(v) => updateConfig({ buttonStyle: v as ComponentConfig['buttonStyle'] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primário</SelectItem>
            <SelectItem value="secondary">Secundário</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
    </div>
  );

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
        <div>
          <Label className="text-xs text-muted-foreground">ID/Name</Label>
          <Input
            value={component.customId || ''}
            onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
            placeholder={`opcoes_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
            className="mt-1 font-mono text-xs"
          />
        </div>

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
              value={config.label || 'Qual a questão a ser respondida?'}
              onChange={(label) => updateConfig({ label })}
              placeholder="Título da pergunta"
              className="text-center"
            />
            <RichTextInput
              value={config.description || ''}
              onChange={(description) => updateConfig({ description })}
              placeholder="Digite aqui uma descrição de ajuda para introduzir o usuário à questão."
              className="text-sm"
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
                      
                      {/* Image URL input */}
                      {opt.mediaType === 'image' && (
                        <div className="space-y-2">
                          <Input
                            value={opt.imageUrl || ''}
                            onChange={(e) => updateOption(opt.id, { imageUrl: e.target.value })}
                            placeholder="https://exemplo.com/imagem.jpg"
                            className="text-sm"
                          />
                          <p className="text-xs text-muted-foreground">Cole a URL de uma imagem da web</p>
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
                  
                  <Input
                    value={opt.text}
                    onChange={(e) => { e.stopPropagation(); updateOption(opt.id, { text: e.target.value }); }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 border-0 bg-transparent"
                    placeholder="Texto da opção"
                  />
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
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`text_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>
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
              <div>
                <Label className="text-xs text-muted-foreground">ID/Name</Label>
                <Input
                  value={component.customId || ''}
                  onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                  placeholder={`video_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
                  className="mt-1 font-mono text-xs"
                />
              </div>
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
            <div>
              <Label className="text-xs text-muted-foreground">ID/Name</Label>
              <Input
                value={component.customId || ''}
                onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                placeholder={`media_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
                className="mt-1 font-mono text-xs"
              />
            </div>
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

  const renderSpacerComponentTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`spacer_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Altura (px)</Label>
        <Input
          type="number"
          value={config.height || 24}
          onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 24 })}
          className="mt-1"
        />
      </div>
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
          <div>
            <Label className="text-xs text-muted-foreground">ID/Name</Label>
            <Input
              value={component.customId || ''}
              onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
              placeholder={`alert_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
              className="mt-1 font-mono text-xs"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderNotificationComponentTab = () => {
    const variations = config.notificationVariations || [];
    
    const addVariation = () => {
      const newVariation = {
        id: Date.now().toString(),
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
            <div>
              <Label className="text-xs text-muted-foreground">ID/Name</Label>
              <Input
                value={component.customId || ''}
                onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                placeholder={`notification_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
                className="mt-1 font-mono text-xs"
              />
            </div>
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
          <div>
            <Label className="text-xs text-muted-foreground">ID/Name</Label>
            <Input
              value={component.customId || ''}
              onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
              placeholder={`timer_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
              className="mt-1 font-mono text-xs"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  const renderLoadingComponentTab = () => (
    <div className="space-y-4">
      {/* ID/Name */}
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`loading_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>

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

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">ID/Name</Label>
            <Input
              value={component.customId || ''}
              onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
              placeholder={`level_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
              className="mt-1 font-mono text-xs"
            />
          </div>
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
                      <Label className="text-xs text-muted-foreground">URL ou upload</Label>
                      <div className="flex gap-2">
                        <Input
                          value={item.imageUrl || ''}
                          onChange={(e) => updateArgument(item.id, { imageUrl: e.target.value })}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="flex-1 text-xs h-8"
                        />
                        <input
                          ref={(el) => { fileInputRefs[item.id] = el; }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(item.id, file);
                          }}
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRefs[item.id]?.click()}
                          className="text-xs h-8 px-3"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
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
            <div>
              <Label className="text-xs text-muted-foreground">ID/Name</Label>
              <Input
                value={component.customId || ''}
                onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                placeholder={`arguments_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
                className="mt-1 font-mono text-xs"
              />
            </div>
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
            <div>
              <Label className="text-xs text-muted-foreground">ID/Name</Label>
              <Input
                value={component.customId || ''}
                onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
                placeholder={`testimonials_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
                className="mt-1 font-mono text-xs"
              />
            </div>
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

    // Default appearance tab for other components
    return (
      <div className="space-y-4">
        {/* Label style */}
        <div>
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Select 
            value={config.labelStyle || 'default'} 
            onValueChange={(v) => updateConfig({ labelStyle: v as ComponentConfig['labelStyle'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Padrão</SelectItem>
              <SelectItem value="floating">Flutuante</SelectItem>
              <SelectItem value="hidden">Oculto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Text align */}
        <div>
          <Label className="text-xs text-muted-foreground">Alinhamento do texto</Label>
          <Select 
            value={config.textAlign || 'left'} 
            onValueChange={(v) => updateConfig({ textAlign: v as ComponentConfig['textAlign'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
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

      {/* Font size for text components */}
      {['text', 'button'].includes(component.type) && (
        <div>
          <Label className="text-xs text-muted-foreground">Tamanho da fonte</Label>
          <Select value={config.fontSize || 'base'} onValueChange={(v) => updateConfig({ fontSize: v as ComponentConfig['fontSize'] })}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Pequeno</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
              <SelectItem value="xl">Extra grande</SelectItem>
              <SelectItem value="2xl">Título</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
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
        <span className="text-2xl">{component.icon}</span>
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
