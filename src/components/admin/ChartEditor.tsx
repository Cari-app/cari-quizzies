import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { GripVertical, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ====== TYPES ======
export interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
}

export interface ChartDataSet {
  id: string;
  name: string;
  data: ChartDataPoint[];
  fillType: 'solid' | 'gradient';
  color: string;
  gradientColors: string[];
}

export interface ChartConfig {
  chartType: 'cartesian' | 'bar' | 'circular';
  dataSets: ChartDataSet[];
  selectedDataSetId: string;
  // Display options (for cartesian)
  showArea: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showGridX: boolean;
  showGridY: boolean;
  // Layout
  width: number;
  horizontalAlign: 'start' | 'center' | 'end';
  verticalAlign: 'auto' | 'start' | 'center' | 'end';
}

interface ChartEditorProps {
  config: ChartConfig;
  onUpdate: (updates: Partial<ChartConfig>) => void;
}

// ====== COMPONENT TAB ======
export function ChartEditorComponentTab({ config, onUpdate }: ChartEditorProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const selectedDataSet = config.dataSets.find(ds => ds.id === config.selectedDataSetId) || config.dataSets[0];

  const addDataSet = () => {
    const newDataSet: ChartDataSet = {
      id: Date.now().toString(),
      name: `Conjunto ${String.fromCharCode(65 + config.dataSets.length)}`,
      data: [
        { id: '1', label: 'Ontem', value: 20 },
        { id: '2', label: 'Hoje', value: 60 },
        { id: '3', label: 'Amanhã', value: 80 },
      ],
      fillType: 'solid',
      color: '#71717A',
      gradientColors: ['#dc2626', '#fbbf24', '#22c55e'],
    };
    onUpdate({ 
      dataSets: [...config.dataSets, newDataSet],
      selectedDataSetId: newDataSet.id 
    });
  };

  const updateDataSet = (dataSetId: string, updates: Partial<ChartDataSet>) => {
    onUpdate({
      dataSets: config.dataSets.map(ds =>
        ds.id === dataSetId ? { ...ds, ...updates } : ds
      )
    });
  };

  const addDataPoint = (dataSetId: string) => {
    const dataSet = config.dataSets.find(ds => ds.id === dataSetId);
    if (!dataSet) return;

    const newPoint: ChartDataPoint = {
      id: Date.now().toString(),
      label: '',
      value: 0,
    };
    updateDataSet(dataSetId, { data: [...dataSet.data, newPoint] });
  };

  const updateDataPoint = (dataSetId: string, pointId: string, updates: Partial<ChartDataPoint>) => {
    const dataSet = config.dataSets.find(ds => ds.id === dataSetId);
    if (!dataSet) return;

    updateDataSet(dataSetId, {
      data: dataSet.data.map(point =>
        point.id === pointId ? { ...point, ...updates } : point
      )
    });
  };

  const removeDataPoint = (dataSetId: string, pointId: string) => {
    const dataSet = config.dataSets.find(ds => ds.id === dataSetId);
    if (!dataSet) return;

    updateDataSet(dataSetId, {
      data: dataSet.data.filter(point => point.id !== pointId)
    });
  };

  const moveDataPoint = (dataSetId: string, fromIndex: number, toIndex: number) => {
    const dataSet = config.dataSets.find(ds => ds.id === dataSetId);
    if (!dataSet) return;

    const newData = [...dataSet.data];
    const [removed] = newData.splice(fromIndex, 1);
    newData.splice(toIndex, 0, removed);
    updateDataSet(dataSetId, { data: newData });
  };

  return (
    <div className="space-y-5">
      {/* Chart Type */}
      <div>
        <Label className="text-xs text-muted-foreground">Tipo de gráfico</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {(['cartesian', 'bar', 'circular'] as const).map((type) => (
            <button
              key={type}
              onClick={() => onUpdate({ chartType: type })}
              className={cn(
                "h-16 rounded-lg border-2 transition-all text-sm font-medium",
                config.chartType === type
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {type === 'cartesian' && 'Cartesiano'}
              {type === 'bar' && 'Barra'}
              {type === 'circular' && 'Circular'}
            </button>
          ))}
        </div>
      </div>

      {/* Data Sets */}
      <div>
        <Label className="text-xs text-muted-foreground">Conjuntos de dados</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {config.dataSets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => onUpdate({ selectedDataSetId: ds.id })}
              className={cn(
                "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                config.selectedDataSetId === ds.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {ds.name}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={addDataSet}
            className="h-10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      {/* Data Points */}
      {selectedDataSet && (
        <div>
          <Label className="text-xs text-muted-foreground">Dados do conjunto</Label>
          
          {/* Header */}
          <div className="grid grid-cols-[24px_1fr_80px_32px] gap-2 mt-2 mb-1 px-1">
            <div></div>
            <span className="text-xs text-muted-foreground">Legenda</span>
            <span className="text-xs text-muted-foreground text-center">Valor</span>
            <div></div>
          </div>

          {/* Data Rows */}
          <div className="space-y-2">
            {selectedDataSet.data.map((point, index) => (
              <div 
                key={point.id}
                className="grid grid-cols-[24px_1fr_80px_32px] gap-2 items-center"
              >
                <button 
                  className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground flex items-center justify-center"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <Input
                  value={point.label}
                  onChange={(e) => updateDataPoint(selectedDataSet.id, point.id, { label: e.target.value })}
                  placeholder="Legenda..."
                  className="h-9"
                />
                <Input
                  type="number"
                  value={point.value}
                  onChange={(e) => updateDataPoint(selectedDataSet.id, point.id, { value: parseInt(e.target.value) || 0 })}
                  className="h-9 text-center"
                  min={0}
                  max={100}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => removeDataPoint(selectedDataSet.id, point.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="w-full mt-3"
            onClick={() => addDataPoint(selectedDataSet.id)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      )}

      {/* Advanced */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-45")} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Configurações avançadas de gráficos em breve.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ====== APPEARANCE TAB ======
export function ChartEditorAppearanceTab({ config, onUpdate }: ChartEditorProps) {
  const selectedDataSet = config.dataSets.find(ds => ds.id === config.selectedDataSetId) || config.dataSets[0];

  const updateDataSet = (updates: Partial<ChartDataSet>) => {
    if (!selectedDataSet) return;
    onUpdate({
      dataSets: config.dataSets.map(ds =>
        ds.id === selectedDataSet.id ? { ...ds, ...updates } : ds
      )
    });
  };

  const updateGradientColor = (index: number, color: string) => {
    if (!selectedDataSet) return;
    const newColors = [...selectedDataSet.gradientColors];
    newColors[index] = color;
    updateDataSet({ gradientColors: newColors });
  };

  const addGradientColor = () => {
    if (!selectedDataSet) return;
    updateDataSet({ gradientColors: [...selectedDataSet.gradientColors, '#000000'] });
  };

  const removeGradientColor = (index: number) => {
    if (!selectedDataSet) return;
    updateDataSet({ gradientColors: selectedDataSet.gradientColors.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      {/* Display Options (for Cartesian) */}
      {config.chartType === 'cartesian' && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Exibição</Label>
          <div className="space-y-2 pl-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showArea}
                onCheckedChange={(v) => onUpdate({ showArea: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar área?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showXAxis}
                onCheckedChange={(v) => onUpdate({ showXAxis: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar eixo X?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showYAxis}
                onCheckedChange={(v) => onUpdate({ showYAxis: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar eixo Y?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showGridX}
                onCheckedChange={(v) => onUpdate({ showGridX: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar grade X?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showGridY}
                onCheckedChange={(v) => onUpdate({ showGridY: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar grade Y?</span>
            </label>
          </div>
        </div>
      )}

      {/* Display Options (for Bar) */}
      {config.chartType === 'bar' && (
        <div className="space-y-3">
          <Label className="text-xs text-muted-foreground">Exibição</Label>
          <div className="space-y-2 pl-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showXAxis}
                onCheckedChange={(v) => onUpdate({ showXAxis: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar eixo X?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showYAxis}
                onCheckedChange={(v) => onUpdate({ showYAxis: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar eixo Y?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showGridX}
                onCheckedChange={(v) => onUpdate({ showGridX: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar grade X?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch
                checked={config.showGridY}
                onCheckedChange={(v) => onUpdate({ showGridY: v })}
                className="scale-75"
              />
              <span className="text-sm">Mostrar grade Y?</span>
            </label>
          </div>
        </div>
      )}

      {/* Data Set Selector */}
      <div>
        <Label className="text-xs text-muted-foreground">Conjuntos de dados</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {config.dataSets.map((ds) => (
            <button
              key={ds.id}
              onClick={() => onUpdate({ selectedDataSetId: ds.id })}
              className={cn(
                "px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium",
                config.selectedDataSetId === ds.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              {ds.name}
            </button>
          ))}
        </div>
      </div>

      {selectedDataSet && (
        <>
          {/* Fill Type */}
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de preenchimento</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => updateDataSet({ fillType: 'solid' })}
                className={cn(
                  "h-10 rounded-lg border-2 transition-all text-sm font-medium",
                  selectedDataSet.fillType === 'solid'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                Cor sólida
              </button>
              <button
                onClick={() => updateDataSet({ fillType: 'gradient' })}
                className={cn(
                  "h-10 rounded-lg border-2 transition-all text-sm font-medium",
                  selectedDataSet.fillType === 'gradient'
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                Cor degradê
              </button>
            </div>
          </div>

          {/* Solid Color */}
          {selectedDataSet.fillType === 'solid' && (
            <div>
              <Label className="text-xs text-muted-foreground">Cor</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={selectedDataSet.color}
                  onChange={(e) => updateDataSet({ color: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                />
                <div 
                  className="w-20 h-10 rounded-lg border border-border"
                  style={{ backgroundColor: selectedDataSet.color }}
                />
              </div>
            </div>
          )}

          {/* Gradient Colors */}
          {selectedDataSet.fillType === 'gradient' && (
            <div>
              <Label className="text-xs text-muted-foreground">Paleta de cor</Label>
              <div className="space-y-2 mt-2">
                {selectedDataSet.gradientColors.map((color, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <Input
                      value={color}
                      onChange={(e) => updateGradientColor(index, e.target.value)}
                      placeholder="#000000"
                      className="flex-1 font-mono"
                    />
                    <div 
                      className="w-20 h-10 rounded-lg border border-border"
                      style={{ backgroundColor: color }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                      onClick={() => removeGradientColor(index)}
                      disabled={selectedDataSet.gradientColors.length <= 2}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={addGradientColor}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar cor
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Width */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-xs text-muted-foreground">Largura</Label>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onUpdate({ width: Math.max(10, (config.width || 100) - 5) })}
            >
              −
            </Button>
            <span className="text-sm font-medium w-12 text-center">{config.width || 100}%</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onUpdate({ width: Math.min(100, (config.width || 100) + 5) })}
            >
              +
            </Button>
          </div>
        </div>
        <Slider
          value={[config.width || 100]}
          onValueChange={([value]) => onUpdate({ width: value })}
          min={10}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Alignments */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Alinhamento horizontal</Label>
          <Select 
            value={config.horizontalAlign || 'start'} 
            onValueChange={(v) => onUpdate({ horizontalAlign: v as ChartConfig['horizontalAlign'] })}
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
            onValueChange={(v) => onUpdate({ verticalAlign: v as ChartConfig['verticalAlign'] })}
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
    </div>
  );
}

// ====== DEFAULT CONFIG ======
export function getDefaultChartConfig(): ChartConfig {
  return {
    chartType: 'cartesian',
    dataSets: [
      {
        id: 'a',
        name: 'Conjunto A',
        data: [
          { id: '1', label: 'Ontem', value: 10 },
          { id: '2', label: 'Hoje', value: 30 },
          { id: '3', label: 'Amanhã', value: 90 },
        ],
        fillType: 'gradient',
        color: '#dc2626',
        gradientColors: ['#dc2626', '#fbbf24', '#22c55e'],
      },
      {
        id: 'b',
        name: 'Conjunto B',
        data: [
          { id: '1', label: 'Ontem', value: 20 },
          { id: '2', label: 'Hoje', value: 60 },
          { id: '3', label: 'Amanhã', value: 80 },
        ],
        fillType: 'solid',
        color: '#71717A',
        gradientColors: ['#71717A'],
      },
    ],
    selectedDataSetId: 'a',
    showArea: true,
    showXAxis: true,
    showYAxis: true,
    showGridX: true,
    showGridY: true,
    width: 100,
    horizontalAlign: 'start',
    verticalAlign: 'auto',
  };
}
