import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
  customId?: string;
}

export interface ComponentConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
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
  options?: Array<{ id: string; text: string; value: string }>;
  allowMultiple?: boolean;
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
    updateConfig({
      options: [
        ...currentOptions,
        { id: Date.now().toString(), text: `Opção ${currentOptions.length + 1}`, value: `opt_${currentOptions.length + 1}` }
      ]
    });
  };

  const updateOption = (id: string, text: string) => {
    const options = (config.options || []).map(opt => 
      opt.id === id ? { ...opt, text } : opt
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

  const renderOptionsComponentTab = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">ID/Name</Label>
        <Input
          value={component.customId || ''}
          onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
          placeholder={`options_${component.id.split('-')[1]?.slice(0, 6) || 'id'}`}
          className="mt-1 font-mono text-xs"
        />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Título da pergunta</Label>
        <Input
          value={config.label || ''}
          onChange={(e) => updateConfig({ label: e.target.value })}
          placeholder="Ex: Qual sua preferência?"
          className="mt-1"
        />
      </div>
      
      {['multiple', 'options'].includes(component.type) && (
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="allowMultiple" 
            checked={config.allowMultiple || component.type === 'multiple'}
            onChange={(e) => updateConfig({ allowMultiple: e.target.checked })}
            className="rounded border-border"
          />
          <Label htmlFor="allowMultiple" className="text-sm cursor-pointer">Permitir múltiplas seleções</Label>
        </div>
      )}
      
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Opções</Label>
        <div className="space-y-2">
          {(config.options || [{ id: '1', text: 'Opção 1', value: 'opt1' }, { id: '2', text: 'Opção 2', value: 'opt2' }]).map((opt) => (
            <div key={opt.id} className="flex gap-2">
              <Input
                value={opt.text}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeOption(opt.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="w-full mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar opção
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="optRequired" 
          checked={config.required || false}
          onChange={(e) => updateConfig({ required: e.target.checked })}
          className="rounded border-border"
        />
        <Label htmlFor="optRequired" className="text-sm cursor-pointer">Obrigatório</Label>
      </div>
    </div>
  );

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
  const renderAppearanceTab = () => (
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
            <SelectItem value="left">text-left</SelectItem>
            <SelectItem value="center">text-center</SelectItem>
            <SelectItem value="right">text-right</SelectItem>
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
