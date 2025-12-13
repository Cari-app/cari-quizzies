import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

interface NotificationVariation {
  id: string;
  name: string;
  platform: string;
  number: string;
}

export function NotificationComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  const variations: NotificationVariation[] = config.notificationVariations || [
    { id: '1', name: 'João', platform: 'Android', number: '21' }
  ];

  const addVariation = () => {
    const newVariation: NotificationVariation = {
      id: crypto.randomUUID(),
      name: 'Novo Nome',
      platform: 'Android',
      number: '11'
    };
    updateConfig({ notificationVariations: [...variations, newVariation] });
  };

  const updateVariation = (id: string, updates: Partial<NotificationVariation>) => {
    updateConfig({
      notificationVariations: variations.map(v =>
        v.id === id ? { ...v, ...updates } : v
      )
    });
  };

  const removeVariation = (id: string) => {
    updateConfig({ notificationVariations: variations.filter(v => v.id !== id) });
  };

  return (
    <div className="space-y-4">
      {/* Posição */}
      <div>
        <Label className="text-xs text-muted-foreground">Posição</Label>
        <Select
          value={config.notificationPosition || 'default'}
          onValueChange={(v) => updateConfig({ notificationPosition: v as 'default' | 'top' | 'bottom' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="top">Topo</SelectItem>
            <SelectItem value="bottom">Rodapé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duração e Intervalo */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Duração (seg.)</Label>
          <Input
            type="number"
            value={config.notificationDuration ?? 3}
            onChange={(e) => updateConfig({ notificationDuration: parseInt(e.target.value) || 3 })}
            min={1}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Intervalo (seg.)</Label>
          <Input
            type="number"
            value={config.notificationInterval ?? 5}
            onChange={(e) => updateConfig({ notificationInterval: parseInt(e.target.value) || 5 })}
            min={1}
            className="mt-1"
          />
        </div>
      </div>

      {/* Variações */}
      <div>
        <Label className="text-xs text-muted-foreground">Variações</Label>
        <div className="space-y-2 mt-2">
          {variations.map((variation) => (
            <div key={variation.id} className="flex gap-2 items-start p-2 border border-border rounded-lg">
              <div className="flex-1 space-y-2">
                <Input
                  value={variation.name}
                  onChange={(e) => updateVariation(variation.id, { name: e.target.value })}
                  placeholder="Nome"
                  className="text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={variation.platform}
                    onValueChange={(v) => updateVariation(variation.id, { platform: v })}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Android">Android</SelectItem>
                      <SelectItem value="iPhone">iPhone</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    value={variation.number}
                    onChange={(e) => updateVariation(variation.id, { number: e.target.value })}
                    placeholder="DDD"
                    className="text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => removeVariation(variation.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full"
            onClick={addVariation}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar variação
          </Button>
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
