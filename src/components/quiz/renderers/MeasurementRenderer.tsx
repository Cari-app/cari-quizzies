import { Input } from '@/components/ui/input';
import { SlidingRuler } from '../SlidingRuler';
import { RendererProps } from './types';

interface MeasurementRendererProps extends RendererProps {
  type: 'height' | 'weight';
}

export function MeasurementRenderer({ 
  component, 
  config, 
  value, 
  type,
  onInputChange, 
  processTemplate, 
  processTemplateHtml 
}: MeasurementRendererProps) {
  const customId = component.customId || config.customId;
  const isRulerLayout = config.layoutType === 'ruler';
  const unit = config.unit || (type === 'height' ? 'cm' : 'kg');
  const altUnit = type === 'height' ? 'pol' : 'lb';
  const minVal = config.minValue || (type === 'height' ? 100 : 30);
  const maxVal = config.maxValue || (type === 'height' ? 220 : 200);
  const defaultVal = config.defaultValue || (type === 'height' ? 170 : 70);
  const currentValue = typeof value === 'number' ? value : defaultVal;
  
  if (isRulerLayout) {
    return (
      <div className="py-4">
        <SlidingRuler
          value={currentValue}
          onChange={(val) => onInputChange(component.id, customId, val)}
          min={minVal}
          max={maxVal}
          step={1}
          unit={unit}
          altUnit={altUnit}
          barColor={config.barColor}
          valueColor={config.valueColor}
          toggleColor={config.toggleColor}
          tickColor={config.tickColor}
          labelColor={config.labelColor}
        />
      </div>
    );
  }
  
  return (
    <div className="py-4">
      {config.label && (
        <div 
          className="rich-text text-sm font-medium mb-2" 
          dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} 
        />
      )}
      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder={processTemplate(config.placeholder || '')}
          value={value}
          onChange={(e) => onInputChange(component.id, customId, parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent"
          required={config.required}
          min={minVal}
          max={maxVal}
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      {config.helpText && (
        <p className="text-xs text-muted-foreground mt-1">
          {processTemplate(config.helpText)}
        </p>
      )}
    </div>
  );
}
