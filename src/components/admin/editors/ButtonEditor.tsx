import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ComponentIdDisplay } from './shared/ComponentIdDisplay';
import type { EditorProps, ComponentConfig } from './types';

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'shine', label: 'Brilho' },
  { value: 'pulse-glow', label: 'Pulse Glow' },
  { value: 'float', label: 'Flutuante' },
  { value: 'heartbeat', label: 'Pulsação' },
  { value: 'wiggle', label: 'Balanço' },
  { value: 'ripple', label: 'Onda' },
  { value: 'glow-border', label: 'Borda Luminosa' },
  { value: 'bounce-subtle', label: 'Quique Leve' },
  { value: 'attention', label: 'Atenção' },
];

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Muito Grande' },
  { value: 'glow', label: 'Glow' },
];


export function ButtonComponentTab({ component, config, updateConfig, onUpdateCustomId }: EditorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);

  // Debug: log when config or colors change
  console.log('ButtonEditor render - config:', JSON.stringify({
    buttonBgColor: config.buttonBgColor,
    buttonTextColor: config.buttonTextColor,
    buttonFontSize: config.buttonFontSize
  }));

  const handleUpdateConfig = (updates: Partial<typeof config>) => {
    console.log('ButtonEditor updateConfig called with:', JSON.stringify(updates));
    updateConfig(updates);
  };

  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Texto do Botão */}
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <Input
          value={config.buttonText || ''}
          onChange={(e) => updateConfig({ buttonText: e.target.value })}
          placeholder="Continuar"
          className="mt-1"
        />
      </div>

      {/* Ação */}
      <div>
        <Label className="text-xs text-muted-foreground">Ação</Label>
        <Select 
          value={config.buttonAction || 'next'} 
          onValueChange={(v) => updateConfig({ buttonAction: v as ComponentConfig['buttonAction'] })}
        >
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

      {/* Link */}
      {config.buttonAction === 'link' && (
        <div>
          <Label className="text-xs text-muted-foreground">URL</Label>
          <Input
            value={config.buttonLink || ''}
            onChange={(e) => updateConfig({ buttonLink: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      )}

      {/* Design Section */}
      <Collapsible open={designOpen} onOpenChange={setDesignOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={cn("w-4 h-4 transition-transform", designOpen && "rotate-45")} />
          DESIGN
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Tamanho */}
          <div>
            <Label className="text-xs text-muted-foreground">Tamanho</Label>
            <Select 
              value={config.buttonSize || 'md'} 
              onValueChange={(v) => updateConfig({ buttonSize: v as ComponentConfig['buttonSize'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Pequeno</SelectItem>
                <SelectItem value="md">Médio</SelectItem>
                <SelectItem value="lg">Grande</SelectItem>
                <SelectItem value="xl">Extra Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Largura total */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="fullWidth" 
              checked={config.buttonFullWidth !== false}
              onChange={(e) => updateConfig({ buttonFullWidth: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="fullWidth" className="text-sm cursor-pointer">Largura total</Label>
          </div>

          {/* Cores e Tipografia */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Cores</Label>
            
            {/* Grid de cores */}
            <div className="grid grid-cols-3 gap-3">
              {/* Cor de fundo */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Fundo</Label>
                <div className="relative w-full h-10 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.buttonBgColor || '#000000' }}>
                  <input
                    type="color"
                    value={config.buttonBgColor || '#000000'}
                    onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.buttonBgColor || '#000000'}
                  onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              {/* Cor do texto */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Texto</Label>
                <div className="relative w-full h-10 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.buttonTextColor || '#ffffff' }}>
                  <input
                    type="color"
                    value={config.buttonTextColor || '#ffffff'}
                    onChange={(e) => handleUpdateConfig({ buttonTextColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.buttonTextColor || '#ffffff'}
                  onChange={(e) => handleUpdateConfig({ buttonTextColor: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
              </div>

              {/* Cor da borda */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Borda</Label>
                <div className="relative w-full h-10 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.buttonBorderColor || '#000000' }}>
                  <input
                    type="color"
                    value={config.buttonBorderColor || '#000000'}
                    onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.buttonBorderColor || '#000000'}
                  onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                  className="mt-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Tamanho da fonte */}
          <div>
            <Label className="text-xs text-muted-foreground">Tamanho da fonte</Label>
            <div className="flex items-center gap-3 mt-1">
              <Slider
                value={[config.buttonFontSize ?? 16]}
                onValueChange={([v]) => updateConfig({ buttonFontSize: v })}
                min={10}
                max={32}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-right">{config.buttonFontSize ?? 16}px</span>
            </div>
          </div>

          {/* Espessura e Arredondamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Borda (px)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={config.buttonBorderWidth ?? 0}
                onChange={(e) => updateConfig({ buttonBorderWidth: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Arredondamento</Label>
              <Input
                type="number"
                min={0}
                max={50}
                value={config.buttonBorderRadius ?? 8}
                onChange={(e) => updateConfig({ buttonBorderRadius: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Sombra */}
          <div>
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Select 
              value={config.buttonShadow || 'none'} 
              onValueChange={(v) => updateConfig({ buttonShadow: v as ComponentConfig['buttonShadow'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHADOW_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gradiente */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="gradient" 
                checked={config.buttonGradient || false}
                onChange={(e) => updateConfig({ buttonGradient: e.target.checked })}
                className="rounded border-border"
              />
              <Label htmlFor="gradient" className="text-sm cursor-pointer">Usar gradiente</Label>
            </div>

            {config.buttonGradient && (
              <div className="space-y-3 pl-5">
                {/* Direção visual */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Direção</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { value: 'to-tl', icon: '↖' },
                      { value: 'to-t', icon: '↑' },
                      { value: 'to-tr', icon: '↗' },
                      { value: 'to-r', icon: '→' },
                      { value: 'to-bl', icon: '↙' },
                      { value: 'to-b', icon: '↓' },
                      { value: 'to-br', icon: '↘' },
                      { value: 'to-l', icon: '←' },
                    ].map(dir => (
                      <button
                        key={dir.value}
                        type="button"
                        onClick={() => updateConfig({ buttonGradientDirection: dir.value as ComponentConfig['buttonGradientDirection'] })}
                        className={cn(
                          "p-2 rounded border text-sm transition-colors",
                          config.buttonGradientDirection === dir.value 
                            ? "border-primary bg-primary/10 text-primary" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {dir.icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cores do gradiente */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Inicial</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.buttonGradientFrom || '#000000' }}>
                        <input
                          type="color"
                          value={config.buttonGradientFrom || '#000000'}
                          onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={config.buttonGradientFrom || '#000000'}
                        onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Final</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: config.buttonGradientTo || '#333333' }}>
                        <input
                          type="color"
                          value={config.buttonGradientTo || '#333333'}
                          onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={config.buttonGradientTo || '#333333'}
                        onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Animação */}
          <div>
            <Label className="text-xs text-muted-foreground">Animação</Label>
            <Select 
              value={config.buttonAnimation || 'none'} 
              onValueChange={(v) => updateConfig({ buttonAnimation: v as ComponentConfig['buttonAnimation'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ANIMATION_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Advanced Section */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-45")} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Padding */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Padding X</Label>
              <Slider
                value={[config.buttonPaddingX ?? 24]}
                onValueChange={([v]) => updateConfig({ buttonPaddingX: v })}
                min={8}
                max={64}
                step={4}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{config.buttonPaddingX ?? 24}px</span>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Padding Y</Label>
              <Slider
                value={[config.buttonPaddingY ?? 12]}
                onValueChange={([v]) => updateConfig({ buttonPaddingY: v })}
                min={4}
                max={32}
                step={2}
                className="mt-2"
              />
              <span className="text-xs text-muted-foreground">{config.buttonPaddingY ?? 12}px</span>
            </div>
          </div>

          {/* Tipografia */}
          <div>
            <Label className="text-xs text-muted-foreground">Peso da fonte</Label>
            <Select 
              value={config.buttonFontWeight || 'medium'} 
              onValueChange={(v) => updateConfig({ buttonFontWeight: v as ComponentConfig['buttonFontWeight'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="semibold">Semi-bold</SelectItem>
                <SelectItem value="bold">Bold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Letter Spacing */}
          <div>
            <Label className="text-xs text-muted-foreground">Espaçamento entre letras</Label>
            <Slider
              value={[config.buttonLetterSpacing ?? 0]}
              onValueChange={([v]) => updateConfig({ buttonLetterSpacing: v })}
              min={-2}
              max={8}
              step={0.5}
              className="mt-2"
            />
            <span className="text-xs text-muted-foreground">{config.buttonLetterSpacing ?? 0}px</span>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
