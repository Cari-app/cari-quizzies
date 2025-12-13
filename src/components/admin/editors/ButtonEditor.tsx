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

export function ButtonComponentTab({ component, config, updateConfig, onUpdateCustomId }: EditorProps) {
  const [designOpen, setDesignOpen] = useState(true);

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
          
          {/* Cor de Fundo */}
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
    </div>
  );
}
