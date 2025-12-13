import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus } from 'lucide-react';
import { EditorProps, ComponentConfig } from './types';
import { ComponentIdDisplay } from './shared';

export function PriceComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Título */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <Input
          value={config.priceTitle || ''}
          onChange={(e) => updateConfig({ priceTitle: e.target.value })}
          placeholder="De R$199 por apenas"
          className="mt-1"
        />
      </div>

      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select 
          value={config.priceLayout || 'horizontal'} 
          onValueChange={(v) => updateConfig({ priceLayout: v as ComponentConfig['priceLayout'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="vertical">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Valor */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label className="text-xs text-muted-foreground">Prefixo</Label>
          <Input
            value={config.pricePrefix || ''}
            onChange={(e) => updateConfig({ pricePrefix: e.target.value })}
            placeholder="R$"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Valor</Label>
          <Input
            value={config.priceValue || ''}
            onChange={(e) => updateConfig({ priceValue: e.target.value })}
            placeholder="99"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Sufixo</Label>
          <Input
            value={config.priceSuffix || ''}
            onChange={(e) => updateConfig({ priceSuffix: e.target.value })}
            placeholder=",90"
            className="mt-1"
          />
        </div>
      </div>

      {/* Destaque */}
      <div>
        <Label className="text-xs text-muted-foreground">Texto de destaque</Label>
        <Input
          value={config.priceHighlight || ''}
          onChange={(e) => updateConfig({ priceHighlight: e.target.value })}
          placeholder="oferta por tempo limitado"
          className="mt-1"
        />
      </div>

      {/* Tipo */}
      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select 
          value={config.priceType || 'illustrative'} 
          onValueChange={(v) => updateConfig({ priceType: v as ComponentConfig['priceType'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="illustrative">Ilustrativo</SelectItem>
            <SelectItem value="redirect">Com redirecionamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL de redirecionamento */}
      {config.priceType === 'redirect' && (
        <div>
          <Label className="text-xs text-muted-foreground">URL de redirecionamento</Label>
          <Input
            value={config.priceRedirectUrl || ''}
            onChange={(e) => updateConfig({ priceRedirectUrl: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      )}

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
