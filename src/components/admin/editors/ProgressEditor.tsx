import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus } from 'lucide-react';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

interface ProgressEditorProps extends EditorProps {}

export function ProgressEditor({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: ProgressEditorProps) {
  const isGradientStyle = config.progressStyle === 'gradient' || config.progressStyle === 'neon';

  return (
    <div className="space-y-4">
      {/* ID/Name */}
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Estilo */}
      <div>
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <Select 
          value={config.progressStyle || 'bar'} 
          onValueChange={(v) => updateConfig({ progressStyle: v as 'bar' | 'gradient' | 'neon' | 'segments' | 'dots' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Barra contínua</SelectItem>
            <SelectItem value="gradient">Gradiente</SelectItem>
            <SelectItem value="neon">Neon</SelectItem>
            <SelectItem value="segments">Segmentada</SelectItem>
            <SelectItem value="dots">Pontos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Altura da barra */}
      <div>
        <Label className="text-xs text-muted-foreground">Altura (px)</Label>
        <Input
          type="number"
          value={config.progressHeight || 8}
          onChange={(e) => updateConfig({ progressHeight: parseInt(e.target.value) || 8 })}
          min={2}
          max={32}
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          CORES
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          {/* Cor da barra / Cor primária */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {isGradientStyle ? 'Cor primária' : 'Cor da barra'}
            </Label>
            <div className="flex gap-2 mt-1">
              <div 
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ backgroundColor: config.progressBarColor || '#000000' }}
              >
                <input
                  type="color"
                  value={config.progressBarColor || '#000000'}
                  onChange={(e) => updateConfig({ progressBarColor: e.target.value })}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={config.progressBarColor || '#000000'}
                onChange={(e) => updateConfig({ progressBarColor: e.target.value })}
                placeholder="#000000"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Cor secundária (só para gradient/neon) */}
          {isGradientStyle && (
            <div>
              <Label className="text-xs text-muted-foreground">Cor secundária</Label>
              <div className="flex gap-2 mt-1">
                <div 
                  className="w-10 h-10 rounded-lg border cursor-pointer"
                  style={{ backgroundColor: config.progressGradientColor || '#8B5CF6' }}
                >
                  <input
                    type="color"
                    value={config.progressGradientColor || '#8B5CF6'}
                    onChange={(e) => updateConfig({ progressGradientColor: e.target.value })}
                    className="w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.progressGradientColor || '#8B5CF6'}
                  onChange={(e) => updateConfig({ progressGradientColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Cor do fundo */}
          <div>
            <Label className="text-xs text-muted-foreground">Cor do fundo</Label>
            <div className="flex gap-2 mt-1">
              <div 
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ backgroundColor: config.progressBgColor || '#e5e7eb' }}
              >
                <input
                  type="color"
                  value={config.progressBgColor || '#e5e7eb'}
                  onChange={(e) => updateConfig({ progressBgColor: e.target.value })}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={config.progressBgColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ progressBgColor: e.target.value })}
                placeholder="#e5e7eb"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Raio da borda */}
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento (px)</Label>
            <Input
              type="number"
              value={config.progressBorderRadius ?? 9999}
              onChange={(e) => updateConfig({ progressBorderRadius: parseInt(e.target.value) || 0 })}
              min={0}
              max={9999}
              className="mt-1"
            />
          </div>

          {/* Animação */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="progressAnimated"
              checked={config.progressAnimated !== false}
              onChange={(e) => updateConfig({ progressAnimated: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="progressAnimated" className="text-sm cursor-pointer">
              Animação suave
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
