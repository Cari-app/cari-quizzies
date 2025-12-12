import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2 } from 'lucide-react';

export interface MetricItem {
  id: string;
  type: 'bar' | 'circular';
  color: 'theme' | 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'black';
  value: number;
  label: string;
}

interface MetricItemEditorProps {
  item: MetricItem;
  index: number;
  totalItems: number;
  onUpdate: (updates: Partial<MetricItem>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function MetricItemEditor({
  item,
  index,
  totalItems,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown
}: MetricItemEditorProps) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-3">
      {/* Header with drag handle */}
      <div className="flex items-center justify-center">
        <button 
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          onMouseDown={(e) => e.preventDefault()}
        >
          <GripVertical className="w-4 h-4 rotate-90" />
        </button>
      </div>

      {/* Controls Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* Type */}
        <Select
          value={item.type}
          onValueChange={(v) => onUpdate({ type: v as MetricItem['type'] })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bar">Barra</SelectItem>
            <SelectItem value="circular">Circular</SelectItem>
          </SelectContent>
        </Select>

        {/* Color */}
        <Select
          value={item.color}
          onValueChange={(v) => onUpdate({ color: v as MetricItem['color'] })}
        >
          <SelectTrigger className="h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theme">Cor tema</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
            <SelectItem value="orange">Laranja</SelectItem>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="black">Preto</SelectItem>
          </SelectContent>
        </Select>

        {/* Value */}
        <Input
          type="number"
          value={item.value}
          onChange={(e) => onUpdate({ value: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
          className="h-9 text-xs text-center"
          min={0}
          max={100}
        />
      </div>

      {/* Label */}
      <Input
        value={item.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Legenda do gráfico"
        className="text-sm"
      />

      {/* Delete button */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
