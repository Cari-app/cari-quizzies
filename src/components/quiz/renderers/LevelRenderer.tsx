import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { RendererProps } from './types';

export function LevelRenderer({ 
  component, 
  config,
  processTemplate,
  processTemplateHtml 
}: RendererProps) {
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
  
  const title = config.levelTitle || 'Nível';
  const subtitle = config.levelSubtitle;
  const percentage = typeof config.levelPercentage === 'number' ? config.levelPercentage : 50;
  const indicatorText = config.levelIndicatorText;
  const legends = config.levelLegends;
  const showMeter = config.showLevelMeter !== false;
  const showProgress = config.showLevelProgress !== false;
  const levelType = config.levelType || 'line';
  const levelColor = config.levelColor || 'theme';
  
  const bgColor = config.levelBgColor;
  const textColor = config.levelTextColor;
  const barColor = config.levelBarColor;
  const borderColor = config.levelBorderColor;
  const borderWidth = config.levelBorderWidth ?? 0;
  const borderRadius = config.levelBorderRadius ?? 12;

  const getBarColor = () => {
    if (barColor) return barColor;
    switch (levelColor) {
      case 'green-red':
        return percentage <= 33 ? '#22c55e' : percentage <= 66 ? '#eab308' : '#ef4444';
      case 'red-green':
        return percentage <= 33 ? '#ef4444' : percentage <= 66 ? '#eab308' : '#22c55e';
      case 'red':
        return '#ef4444';
      case 'blue':
        return '#3b82f6';
      case 'green':
        return '#22c55e';
      case 'yellow':
        return '#eab308';
      case 'opaque':
        return '#6b7280';
      default:
        return undefined;
    }
  };

  const processedTitle = processTemplate ? processTemplate(title) : title;
  const processedSubtitle = subtitle ? (processTemplate ? processTemplate(subtitle) : subtitle) : null;
  const processedIndicator = indicatorText ? (processTemplate ? processTemplate(indicatorText) : indicatorText) : null;

  return (
    <div className={cn("py-4 flex", justifyClass)}>
      <div 
        className="p-4 text-center"
        style={{
          width: `${widthValue}%`,
          backgroundColor: bgColor || undefined,
          borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
          borderStyle: borderWidth > 0 ? 'solid' : 'none',
          borderColor: borderColor || undefined,
          borderRadius: `${borderRadius}px`,
        }}
      >
        <h3 
          className="text-lg font-semibold mb-1"
          style={{ color: textColor || undefined }}
          dangerouslySetInnerHTML={{ __html: processedTitle }}
        />
        {processedSubtitle && (
          <p 
            className="text-sm text-muted-foreground mb-3"
            style={{ color: textColor ? `${textColor}99` : undefined }}
            dangerouslySetInnerHTML={{ __html: processedSubtitle }}
          />
        )}
        
        {showMeter && levelType === 'line' && (
          <div className="relative mb-2">
            <Progress 
              value={percentage} 
              className="h-3"
              style={{
                ['--progress-color' as any]: getBarColor(),
              }}
            />
            {processedIndicator && (
              <div 
                className="absolute -top-6 text-xs font-medium px-2 py-0.5 bg-background border rounded shadow-sm"
                style={{ 
                  left: `${percentage}%`, 
                  transform: 'translateX(-50%)',
                  color: textColor || undefined,
                }}
              >
                {processedIndicator}
              </div>
            )}
          </div>
        )}
        
        {showMeter && levelType === 'segments' && (
          <div className="flex gap-1 mb-2">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-1 h-3 rounded-sm transition-colors"
                style={{
                  backgroundColor: (i + 1) * 10 <= percentage ? getBarColor() : 'hsl(var(--muted))',
                }}
              />
            ))}
          </div>
        )}
        
        {showProgress && (
          <div 
            className="text-2xl font-bold"
            style={{ color: getBarColor() }}
          >
            {percentage}%
          </div>
        )}
        
        {legends && (
          <div 
            className="text-xs text-muted-foreground mt-2"
            style={{ color: textColor ? `${textColor}99` : undefined }}
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(legends) : legends }}
          />
        )}
      </div>
    </div>
  );
}
