import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, ChevronDown, GripVertical, Image, Smile, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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
        <Input
          value={config.label || ''}
          onChange={(e) => updateConfig({ label: e.target.value })}
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
        <Input
          value={config.buttonText || 'Continuar'}
          onChange={(e) => updateConfig({ buttonText: e.target.value })}
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

          <div className="text-center p-4 border border-border rounded-lg bg-muted/20">
            <Input
              value={config.label || 'Qual a questão a ser respondida?'}
              onChange={(e) => updateConfig({ label: e.target.value })}
              className="text-center font-semibold border-0 bg-transparent text-lg mb-2"
              placeholder="Título da pergunta"
            />
            <Input
              value={config.description || ''}
              onChange={(e) => updateConfig({ description: e.target.value })}
              className="text-center text-sm text-muted-foreground border-0 bg-transparent"
              placeholder="Digite aqui uma descrição de ajuda para introduzir o usuário à questão."
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
        <Textarea
          value={config.content || ''}
          onChange={(e) => updateConfig({ content: e.target.value })}
          placeholder="Digite o texto aqui..."
          className="mt-1 min-h-[100px]"
        />
      </div>
    </div>
  );

  const renderMediaComponentTab = () => (
    <div className="space-y-4">
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
        <Label className="text-xs text-muted-foreground">URL da mídia</Label>
        <Input
          value={config.mediaUrl || ''}
          onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
          placeholder="https://..."
          className="mt-1"
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
    </div>
  );

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

  // =========== APARÊNCIA TAB ===========
  const renderAppearanceTab = () => {
    const isOptionsComponent = ['options', 'single', 'multiple', 'yesno'].includes(component.type);
    
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
