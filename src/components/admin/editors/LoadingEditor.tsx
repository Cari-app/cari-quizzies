import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, X } from 'lucide-react';
import { EditorProps, ComponentConfig } from './types';
import { ComponentIdDisplay } from './shared';

export function LoadingComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Mostrar título */}
      <div className="flex items-center gap-2">
        <Switch
          id="showLoadingTitle"
          checked={config.showLoadingTitle !== false}
          onCheckedChange={(checked) => updateConfig({ showLoadingTitle: checked })}
        />
        <Label htmlFor="showLoadingTitle" className="text-sm cursor-pointer">Mostrar título</Label>
      </div>

      {/* Título */}
      {config.showLoadingTitle !== false && (
        <div>
          <Label className="text-xs text-muted-foreground">Título</Label>
          <RichTextInput
            value={config.loadingTitle || 'Analisando suas respostas...'}
            onChange={(v) => updateConfig({ loadingTitle: v })}
            placeholder="Título..."
            minHeight="50px"
            showBorder
          />
        </div>
      )}

      {/* Descrição */}
      <div>
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <RichTextInput
          value={config.loadingDescription || ''}
          onChange={(v) => updateConfig({ loadingDescription: v })}
          placeholder="Descrição..."
          minHeight="50px"
          showBorder
        />
      </div>

      {/* Mostrar barra de progresso */}
      <div className="flex items-center gap-2">
        <Switch
          id="showLoadingProgress"
          checked={config.showLoadingProgress !== false}
          onCheckedChange={(checked) => updateConfig({ showLoadingProgress: checked })}
        />
        <Label htmlFor="showLoadingProgress" className="text-sm cursor-pointer">Mostrar barra de progresso</Label>
      </div>

      {/* Duração */}
      <div>
        <Label className="text-xs text-muted-foreground">Duração (segundos)</Label>
        <Input
          type="number"
          value={config.loadingDuration ?? 3}
          onChange={(e) => updateConfig({ loadingDuration: parseInt(e.target.value) || 1 })}
          min={1}
          max={60}
          className="mt-1"
        />
      </div>

      {/* Delay para aparecer */}
      <div>
        <Label className="text-xs text-muted-foreground">Delay para aparecer (segundos)</Label>
        <Input
          type="number"
          value={config.loadingDelay ?? 0}
          onChange={(e) => updateConfig({ loadingDelay: parseInt(e.target.value) || 0 })}
          min={0}
          max={60}
          className="mt-1"
        />
      </div>

      {/* Navegação */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground block">Navegação</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground">Após carregamento</Label>
          <Select 
            value={config.loadingNavigation || 'next'} 
            onValueChange={(v) => updateConfig({ loadingNavigation: v as ComponentConfig['loadingNavigation'] })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Próxima etapa</SelectItem>
              <SelectItem value="submit">Enviar formulário</SelectItem>
              <SelectItem value="specific">Etapa específica</SelectItem>
              <SelectItem value="link">Redirecionar para URL</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              style={{ backgroundColor: config.loadingBgColor || 'hsl(var(--background))' }}
            >
              <input
                type="color"
                value={config.loadingBgColor || '#ffffff'}
                onChange={(e) => updateConfig({ loadingBgColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBgColor || ''}
              onChange={(e) => updateConfig({ loadingBgColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBgColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBgColor: undefined })}>
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
              style={{ backgroundColor: config.loadingTextColor || 'hsl(var(--foreground))' }}
            >
              <input
                type="color"
                value={config.loadingTextColor || '#000000'}
                onChange={(e) => updateConfig({ loadingTextColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingTextColor || ''}
              onChange={(e) => updateConfig({ loadingTextColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingTextColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingTextColor: undefined })}>
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
              style={{ backgroundColor: config.loadingBarColor || 'hsl(var(--foreground))' }}
            >
              <input
                type="color"
                value={config.loadingBarColor || '#000000'}
                onChange={(e) => updateConfig({ loadingBarColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBarColor || ''}
              onChange={(e) => updateConfig({ loadingBarColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBarColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBarColor: undefined })}>
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
              style={{ backgroundColor: config.loadingBorderColor || 'hsl(var(--border))' }}
            >
              <input
                type="color"
                value={config.loadingBorderColor || '#e5e7eb'}
                onChange={(e) => updateConfig({ loadingBorderColor: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <Input
              value={config.loadingBorderColor || ''}
              onChange={(e) => updateConfig({ loadingBorderColor: e.target.value })}
              placeholder="Padrão"
              className="flex-1 text-xs h-8 font-mono"
            />
            {config.loadingBorderColor && (
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => updateConfig({ loadingBorderColor: undefined })}>
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Espessura e arredondamento */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={config.loadingBorderWidth ?? 1}
              onChange={(e) => updateConfig({ loadingBorderWidth: parseInt(e.target.value) || 0 })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={config.loadingBorderRadius ?? 8}
              onChange={(e) => updateConfig({ loadingBorderRadius: parseInt(e.target.value) || 0 })}
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
          <p className="text-xs text-muted-foreground">
            Configurações avançadas em breve
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
