import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentConfig } from '../../ComponentEditor';
import { ColorPicker, WidthSlider, AlignmentSelectors } from './shared';

interface AppearanceProps {
  config: ComponentConfig;
  updateConfig: (updates: Partial<ComponentConfig>) => void;
}

export function MetricsAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      {/* Fundo */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Fundo</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Tipo de fundo</Label>
          <Select 
            value={config.metricsBgType || 'solid'} 
            onValueChange={(v) => updateConfig({ metricsBgType: v as 'solid' | 'gradient' | 'transparent' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Cor sólida</SelectItem>
              <SelectItem value="gradient">Gradiente</SelectItem>
              <SelectItem value="transparent">Transparente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.metricsBgType === 'gradient' && (
          <div className="space-y-3">
            <ColorPicker 
              label="Cor inicial" 
              value={config.metricsGradientStart || '#667eea'} 
              onChange={(v) => updateConfig({ metricsGradientStart: v })} 
            />
            <ColorPicker 
              label="Cor final" 
              value={config.metricsGradientEnd || '#764ba2'} 
              onChange={(v) => updateConfig({ metricsGradientEnd: v })} 
            />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ângulo ({config.metricsGradientAngle ?? 135}°)</Label>
              <Slider
                value={[config.metricsGradientAngle ?? 135]}
                onValueChange={([v]) => updateConfig({ metricsGradientAngle: v })}
                min={0}
                max={360}
                step={15}
              />
            </div>
          </div>
        )}

        {(!config.metricsBgType || config.metricsBgType === 'solid') && (
          <ColorPicker 
            label="Cor de fundo" 
            value={config.metricsBgColor || '#ffffff'} 
            onChange={(v) => updateConfig({ metricsBgColor: v })} 
          />
        )}
      </div>

      {/* Cores de texto */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores de texto</Label>
        
        <div className="grid grid-cols-2 gap-3">
          <ColorPicker 
            label="Legenda" 
            value={config.metricsTextColor || '#6b7280'} 
            onChange={(v) => updateConfig({ metricsTextColor: v })} 
          />
          <ColorPicker 
            label="Valor" 
            value={config.metricsValueColor || '#6b7280'} 
            onChange={(v) => updateConfig({ metricsValueColor: v })} 
          />
        </div>
      </div>

      {/* Bordas */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
        
        <ColorPicker 
          label="Cor da borda" 
          value={config.metricsBorderColor || '#e5e7eb'} 
          onChange={(v) => updateConfig({ metricsBorderColor: v })} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              value={config.metricsBorderWidth ?? 1}
              onChange={(e) => updateConfig({ metricsBorderWidth: parseInt(e.target.value) || 0 })}
              min={0}
              max={10}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              value={config.metricsBorderRadius ?? 8}
              onChange={(e) => updateConfig({ metricsBorderRadius: parseInt(e.target.value) || 0 })}
              min={0}
              max={50}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function FaqAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Detalhe</Label>
        <Select 
          value={config.faqDetailType || 'arrow'} 
          onValueChange={(v) => updateConfig({ faqDetailType: v as ComponentConfig['faqDetailType'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="arrow">Seta</SelectItem>
            <SelectItem value="plus-minus">Mais e menos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CORES section */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores</Label>
        
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Tipo de fundo</Label>
          <Select 
            value={config.faqBgType || 'solid'} 
            onValueChange={(v) => updateConfig({ faqBgType: v as 'solid' | 'gradient' | 'transparent' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Cor sólida</SelectItem>
              <SelectItem value="gradient">Gradiente</SelectItem>
              <SelectItem value="transparent">Transparente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(!config.faqBgType || config.faqBgType === 'solid') && (
          <ColorPicker 
            label="Cor de fundo" 
            value={config.faqBgColor || '#ffffff'} 
            onChange={(v) => updateConfig({ faqBgColor: v })} 
          />
        )}

        {config.faqBgType === 'gradient' && (
          <div className="space-y-3">
            <ColorPicker 
              label="Cor inicial" 
              value={config.faqGradientStart || '#667eea'} 
              onChange={(v) => updateConfig({ faqGradientStart: v })} 
            />
            <ColorPicker 
              label="Cor final" 
              value={config.faqGradientEnd || '#764ba2'} 
              onChange={(v) => updateConfig({ faqGradientEnd: v })} 
            />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ângulo ({config.faqGradientAngle ?? 135}°)</Label>
              <Slider
                value={[config.faqGradientAngle ?? 135]}
                onValueChange={([v]) => updateConfig({ faqGradientAngle: v })}
                min={0}
                max={360}
                step={15}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ColorPicker 
            label="Título" 
            value={config.faqTextColor || '#1f2937'} 
            onChange={(v) => updateConfig({ faqTextColor: v })} 
          />
          <ColorPicker 
            label="Resposta" 
            value={config.faqAnswerColor || '#6b7280'} 
            onChange={(v) => updateConfig({ faqAnswerColor: v })} 
          />
        </div>
        
        <ColorPicker 
          label="Ícone" 
          value={config.faqIconColor || '#6b7280'} 
          onChange={(v) => updateConfig({ faqIconColor: v })} 
        />
      </div>

      {/* BORDAS section */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
        
        <ColorPicker 
          label="Cor da borda" 
          value={config.faqBorderColor || '#e5e7eb'} 
          onChange={(v) => updateConfig({ faqBorderColor: v })} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              value={config.faqBorderWidth ?? 1}
              onChange={(e) => updateConfig({ faqBorderWidth: parseInt(e.target.value) || 0 })}
              min={0}
              max={10}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              value={config.faqBorderRadius ?? 8}
              onChange={(e) => updateConfig({ faqBorderRadius: parseInt(e.target.value) || 0 })}
              min={0}
              max={50}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}
