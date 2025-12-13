import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MetricItemEditor, MetricItem } from '../MetricItemEditor';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

export function MetricsComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  const items: MetricItem[] = config.metricItems || [
    { id: '1', type: 'bar', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' },
    { id: '2', type: 'circular', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' }
  ];

  const addItem = () => {
    const newItem: MetricItem = {
      id: crypto.randomUUID(),
      type: 'bar',
      color: 'theme',
      value: 30,
      label: 'Fusce vitae tellus in risus sagittis condimentum'
    };
    updateConfig({ metricItems: [...items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<MetricItem>) => {
    updateConfig({
      metricItems: items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  const removeItem = (id: string) => {
    updateConfig({ metricItems: items.filter(item => item.id !== id) });
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    updateConfig({ metricItems: newItems });
  };

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select
          value={config.metricsLayout || 'grid-2'}
          onValueChange={(v) => updateConfig({ metricsLayout: v as any })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">Itens em lista</SelectItem>
            <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
            <SelectItem value="grid-3">Grade de 3 colunas</SelectItem>
            <SelectItem value="grid-4">Grade de 4 colunas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disposition */}
      <div>
        <Label className="text-xs text-muted-foreground">Disposição</Label>
        <Select
          value={config.metricsDisposition || 'legend-chart'}
          onValueChange={(v) => updateConfig({ metricsDisposition: v as any })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chart-legend">gráfico | legenda</SelectItem>
            <SelectItem value="legend-chart">legenda | gráfico</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gráficos */}
      <div>
        <Label className="text-xs text-muted-foreground">Gráficos</Label>
        <div className="space-y-3 mt-2">
          {items.map((item, index) => (
            <MetricItemEditor
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onRemove={() => removeItem(item.id)}
              onMoveUp={() => index > 0 && moveItem(index, index - 1)}
              onMoveDown={() => index < items.length - 1 && moveItem(index, index + 1)}
            />
          ))}
          <Button
            variant="ghost"
            className="w-full"
            onClick={addItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar gráfico
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
