import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentIdDisplay } from './shared/ComponentIdDisplay';
import type { EditorProps, ComponentConfig } from './types';

interface HeightWeightEditorProps extends EditorProps {
  themeColor?: string;
}

export function HeightWeightComponentTab({ component, config, updateConfig, onUpdateCustomId, themeColor = '#000000' }: HeightWeightEditorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
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
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor da barra</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.barColor || themeColor }}>
              <input
                type="color"
                value={config.barColor || themeColor}
                onChange={(e) => updateConfig({ barColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.barColor || themeColor}
              onChange={(e) => updateConfig({ barColor: e.target.value })}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        {/* Value Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor do valor</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.valueColor || '#000000' }}>
              <input
                type="color"
                value={config.valueColor || '#000000'}
                onChange={(e) => updateConfig({ valueColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.valueColor || '#000000'}
              onChange={(e) => updateConfig({ valueColor: e.target.value })}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        {/* Toggle Button Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor do botão toggle</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.toggleColor || '#1f2937' }}>
              <input
                type="color"
                value={config.toggleColor || '#1f2937'}
                onChange={(e) => updateConfig({ toggleColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.toggleColor || '#1f2937'}
              onChange={(e) => updateConfig({ toggleColor: e.target.value })}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        {/* Tick Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor das marcações</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.tickColor || '#808080' }}>
              <input
                type="color"
                value={config.tickColor || '#808080'}
                onChange={(e) => updateConfig({ tickColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.tickColor || '#808080'}
              onChange={(e) => updateConfig({ tickColor: e.target.value })}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
        
        {/* Label Color */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Cor dos textos</Label>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.labelColor || '#808080' }}>
              <input
                type="color"
                value={config.labelColor || '#808080'}
                onChange={(e) => updateConfig({ labelColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.labelColor || '#808080'}
              onChange={(e) => updateConfig({ labelColor: e.target.value })}
              className="flex-1 font-mono text-sm"
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
          <Plus className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-45")} />
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
}
