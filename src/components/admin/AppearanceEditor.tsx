import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Extended appearance config
export interface AppearanceConfig {
  // Layout
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  labelStyle?: 'default' | 'floating' | 'hidden';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  
  // Spacing
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  
  // Border
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  
  // Colors
  backgroundColor?: string;
  textColor?: string;
  
  // Effects
  opacity?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

interface AppearanceEditorProps {
  config: AppearanceConfig;
  onUpdate: (updates: Partial<AppearanceConfig>) => void;
  componentType: string;
  themeColor?: string;
}

// Color picker with input
function ColorPickerInput({ 
  label, 
  value, 
  onChange,
  placeholder = '#000000'
}: { 
  label: string; 
  value?: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 mt-1">
        <div 
          className="w-10 h-9 rounded-md border border-input cursor-pointer relative overflow-hidden shrink-0"
          style={{ backgroundColor: value || 'transparent' }}
        >
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-mono text-xs"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-xs"
            onClick={() => onChange('')}
          >
            Limpar
          </Button>
        )}
      </div>
    </div>
  );
}

// Collapsible section
function Section({ 
  title, 
  children, 
  defaultOpen = true 
}: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:bg-muted/50 rounded-md px-2 -mx-2">
        {title}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 space-y-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

// Slider with label and value display
function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix = '',
  showButtons = true,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  showButtons?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          {showButtons && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onChange(Math.max(min, value - step))}
            >
              −
            </Button>
          )}
          <span className="text-sm font-medium w-14 text-center">{value}{suffix}</span>
          {showButtons && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onChange(Math.min(max, value + step))}
            >
              +
            </Button>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}

export function AppearanceEditor({ config, onUpdate, componentType, themeColor }: AppearanceEditorProps) {
  // Components that support each feature
  const inputComponents = ['input', 'email', 'phone', 'number', 'date', 'textarea', 'height', 'weight'];
  const textComponents = ['text', 'heading', 'button'];
  const layoutOnlyComponents = ['spacer', 'divider', 'script'];
  
  const showLabelStyle = inputComponents.includes(componentType);
  const showTextAlign = [...textComponents, ...inputComponents].includes(componentType);
  const showSpacing = !layoutOnlyComponents.includes(componentType);
  const showBorder = !['spacer', 'script'].includes(componentType);
  const showColors = !layoutOnlyComponents.includes(componentType);
  const showEffects = !layoutOnlyComponents.includes(componentType);

  return (
    <div className="space-y-4">
      {/* Basic Layout */}
      <Section title="Layout" defaultOpen={true}>
        {/* Label Style */}
        {showLabelStyle && (
          <div>
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Select 
              value={config.labelStyle || 'default'} 
              onValueChange={(v) => onUpdate({ labelStyle: v as AppearanceConfig['labelStyle'] })}
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
        )}

        {/* Width */}
        <SliderField
          label="Largura"
          value={config.width || 100}
          onChange={(v) => onUpdate({ width: v })}
          min={10}
          max={100}
          step={5}
          suffix="%"
        />

      </Section>

      {/* Spacing */}
      {showSpacing && (
        <Section title="Espaçamento" defaultOpen={false}>
          {/* Padding */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground font-medium">Padding interno</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Superior</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.paddingTop ?? 16]}
                    onValueChange={([v]) => onUpdate({ paddingTop: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.paddingTop ?? 16}px</span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Inferior</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.paddingBottom ?? 16]}
                    onValueChange={([v]) => onUpdate({ paddingBottom: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.paddingBottom ?? 16}px</span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Esquerda</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.paddingLeft ?? 16]}
                    onValueChange={([v]) => onUpdate({ paddingLeft: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.paddingLeft ?? 16}px</span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Direita</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.paddingRight ?? 16]}
                    onValueChange={([v]) => onUpdate({ paddingRight: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.paddingRight ?? 16}px</span>
                </div>
              </div>
            </div>
          </div>

          {/* Margin */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground font-medium">Margem externa</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Superior</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.marginTop ?? 0]}
                    onValueChange={([v]) => onUpdate({ marginTop: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.marginTop ?? 0}px</span>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground/70">Inferior</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[config.marginBottom ?? 0]}
                    onValueChange={([v]) => onUpdate({ marginBottom: v })}
                    min={0}
                    max={64}
                    step={4}
                    className="flex-1"
                  />
                  <span className="text-xs w-8 text-right">{config.marginBottom ?? 0}px</span>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Border */}
      {showBorder && (
        <Section title="Borda" defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Arredondamento</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[config.borderRadius ?? 8]}
                  onValueChange={([v]) => onUpdate({ borderRadius: v })}
                  min={0}
                  max={32}
                  step={2}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right">{config.borderRadius ?? 8}px</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Espessura</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[config.borderWidth ?? 0]}
                  onValueChange={([v]) => onUpdate({ borderWidth: v })}
                  min={0}
                  max={8}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right">{config.borderWidth ?? 0}px</span>
              </div>
            </div>
          </div>
          
          <ColorPickerInput
            label="Cor da borda"
            value={config.borderColor}
            onChange={(v) => onUpdate({ borderColor: v })}
            placeholder="Automático"
          />
        </Section>
      )}

      {/* Colors */}
      {showColors && (
        <Section title="Cores" defaultOpen={false}>
          <ColorPickerInput
            label="Cor de fundo"
            value={config.backgroundColor}
            onChange={(v) => onUpdate({ backgroundColor: v })}
            placeholder="Transparente"
          />
          
          <ColorPickerInput
            label="Cor do texto"
            value={config.textColor}
            onChange={(v) => onUpdate({ textColor: v })}
            placeholder="Herdar do tema"
          />
        </Section>
      )}

      {/* Effects */}
      {showEffects && (
        <Section title="Efeitos" defaultOpen={false}>
          <div>
            <Label className="text-xs text-muted-foreground">Opacidade</Label>
            <div className="flex items-center gap-2 mt-1">
              <Slider
                value={[config.opacity ?? 100]}
                onValueChange={([v]) => onUpdate({ opacity: v })}
                min={0}
                max={100}
                step={5}
                className="flex-1"
              />
              <span className="text-xs w-10 text-right">{config.opacity ?? 100}%</span>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Select 
              value={config.shadow || 'none'} 
              onValueChange={(v) => onUpdate({ shadow: v as AppearanceConfig['shadow'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="sm">Pequena</SelectItem>
                <SelectItem value="md">Média</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
                <SelectItem value="xl">Extra grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>
      )}
    </div>
  );
}
