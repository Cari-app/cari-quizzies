import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentConfig } from '../../ComponentEditor';

// Reusable Color Picker Component
export function ColorPicker({ label, value, onChange }: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void 
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" style={{ backgroundColor: value }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}

// Reusable Width Slider Component
export function WidthSlider({ 
  config, 
  updateConfig 
}: { 
  config: ComponentConfig; 
  updateConfig: (updates: Partial<ComponentConfig>) => void 
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs text-muted-foreground">Largura</Label>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => updateConfig({ width: Math.max(10, (config.width || 100) - 5) })}
          >
            −
          </Button>
          <span className="text-sm font-medium w-12 text-center">{config.width || 100}%</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => updateConfig({ width: Math.min(100, (config.width || 100) + 5) })}
          >
            +
          </Button>
        </div>
      </div>
      <Slider
        value={[config.width || 100]}
        onValueChange={([value]) => updateConfig({ width: value })}
        min={10}
        max={100}
        step={5}
        className="w-full"
      />
    </div>
  );
}

// Reusable Alignment Selectors Component
export function AlignmentSelectors({ 
  config, 
  updateConfig 
}: { 
  config: ComponentConfig; 
  updateConfig: (updates: Partial<ComponentConfig>) => void 
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento horizontal</Label>
        <Select 
          value={config.horizontalAlign || 'start'} 
          onValueChange={(v) => updateConfig({ horizontalAlign: v as ComponentConfig['horizontalAlign'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Começo</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="end">Fim</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground">Alinhamento vertical</Label>
        <Select 
          value={config.verticalAlign || 'auto'} 
          onValueChange={(v) => updateConfig({ verticalAlign: v as ComponentConfig['verticalAlign'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="start">Começo</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="end">Fim</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
