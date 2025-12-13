import { Slider } from '@/components/ui/slider';
import { RendererProps } from './types';

export function SliderRenderer({ 
  component, 
  config, 
  value, 
  onInputChange,
  processTemplateHtml 
}: RendererProps) {
  const comp = component;
  const customId = comp.customId || config.customId;
  const sliderValue = typeof value === 'number' ? value : config.sliderMin || 0;

  const handleChange = (vals: number[]) => {
    if (onInputChange) {
      onInputChange(comp.id, customId, vals[0]);
    }
  };

  return (
    <div className="py-4">
      {config.label && (
        <div 
          className="rich-text text-sm font-medium mb-2" 
          dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.label) : config.label }} 
        />
      )}
      <div className="pt-4">
        <Slider
          value={[sliderValue]}
          onValueChange={handleChange}
          min={config.sliderMin || 0}
          max={config.sliderMax || 100}
          step={config.sliderStep || 1}
        />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{config.sliderMin || 0}</span>
          <span className="font-medium text-foreground">{sliderValue}</span>
          <span>{config.sliderMax || 100}</span>
        </div>
      </div>
    </div>
  );
}
