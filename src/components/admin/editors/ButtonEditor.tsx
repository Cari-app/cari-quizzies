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

const SHADOW_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'sm', label: 'Pequena' },
  { value: 'md', label: 'Média' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Muito Grande' },
];

const ANIMATION_OPTIONS = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'pulse', label: 'Pulsar' },
  { value: 'bounce', label: 'Quicar' },
  { value: 'shake', label: 'Tremer' },
];

export function ButtonComponentTab({ component, config, updateConfig, onUpdateCustomId }: EditorProps) {
  const [designOpen, setDesignOpen] = useState(true);
  const [effectsOpen, setEffectsOpen] = useState(false);

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
        <Label className="text-xs text-muted-foreground">Texto do botão</Label>
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
          
          {/* Usar Gradiente */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="useGradient" 
              checked={config.buttonGradient || false}
              onChange={(e) => updateConfig({ buttonGradient: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="useGradient" className="text-sm cursor-pointer">Usar gradiente</Label>
          </div>

          {config.buttonGradient ? (
            <>
              {/* Direção do Gradiente */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Direção do gradiente</Label>
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
                        (config.buttonGradientDirection || 'to-r') === dir.value 
                          ? "border-primary bg-primary/10" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {dir.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor Inicial */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Cor inicial</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.buttonGradientFrom || '#000000'}
                    onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={config.buttonGradientFrom || '#000000'}
                    onChange={(e) => updateConfig({ buttonGradientFrom: e.target.value })}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>

              {/* Cor Final */}
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Cor final</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.buttonGradientTo || '#333333'}
                    onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                    className="w-10 h-10 rounded border border-border cursor-pointer"
                  />
                  <Input
                    value={config.buttonGradientTo || '#333333'}
                    onChange={(e) => updateConfig({ buttonGradientTo: e.target.value })}
                    className="flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Cor de Fundo */
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.buttonBgColor || '#000000'}
                  onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input
                  value={config.buttonBgColor || '#000000'}
                  onChange={(e) => updateConfig({ buttonBgColor: e.target.value })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Opacidade do Fundo */}
          <div>
            <Label className="text-xs text-muted-foreground">Opacidade do fundo ({Math.round((config.buttonBgOpacity ?? 1) * 100)}%)</Label>
            <Slider
              value={[config.buttonBgOpacity ?? 1]}
              onValueChange={([v]) => updateConfig({ buttonBgOpacity: v })}
              min={0}
              max={1}
              step={0.05}
              className="mt-2"
            />
          </div>

          {/* Cor do Texto */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor do texto</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.buttonTextColor || '#ffffff'}
                onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={config.buttonTextColor || '#ffffff'}
                onChange={(e) => updateConfig({ buttonTextColor: e.target.value })}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* Tamanho da Fonte */}
          <div>
            <Label className="text-xs text-muted-foreground">Tamanho da fonte ({config.buttonFontSize || 16}px)</Label>
            <Slider
              value={[config.buttonFontSize || 16]}
              onValueChange={([v]) => updateConfig({ buttonFontSize: v })}
              min={12}
              max={32}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Cor da Borda */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Cor da borda</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.buttonBorderColor || '#000000'}
                onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                className="w-10 h-10 rounded border border-border cursor-pointer"
              />
              <Input
                value={config.buttonBorderColor || '#000000'}
                onChange={(e) => updateConfig({ buttonBorderColor: e.target.value })}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>

          {/* Espessura da Borda */}
          <div>
            <Label className="text-xs text-muted-foreground">Espessura da borda ({config.buttonBorderWidth || 0}px)</Label>
            <Slider
              value={[config.buttonBorderWidth || 0]}
              onValueChange={([v]) => updateConfig({ buttonBorderWidth: v })}
              min={0}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Arredondamento */}
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento ({config.buttonBorderRadius ?? 8}px)</Label>
            <Slider
              value={[config.buttonBorderRadius ?? 8]}
              onValueChange={([v]) => updateConfig({ buttonBorderRadius: v })}
              min={0}
              max={50}
              step={1}
              className="mt-2"
            />
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

        </CollapsibleContent>
      </Collapsible>

      {/* Effects Section */}
      <Collapsible open={effectsOpen} onOpenChange={setEffectsOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={cn("w-4 h-4 transition-transform", effectsOpen && "rotate-45")} />
          EFEITOS
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          
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

          {/* Efeito Hover */}
          <div>
            <Label className="text-xs text-muted-foreground">Efeito ao passar mouse</Label>
            <Select 
              value={config.buttonHoverEffect || 'none'} 
              onValueChange={(v) => updateConfig({ buttonHoverEffect: v as ComponentConfig['buttonHoverEffect'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="darken">Escurecer</SelectItem>
                <SelectItem value="lighten">Clarear</SelectItem>
                <SelectItem value="scale">Aumentar</SelectItem>
                <SelectItem value="lift">Elevar</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
