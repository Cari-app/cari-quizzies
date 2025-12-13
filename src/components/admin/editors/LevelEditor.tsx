import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, X } from 'lucide-react';
import { EditorProps, ComponentConfig } from './types';
import { ComponentIdDisplay } from './shared';

export function LevelComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  return (
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
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
