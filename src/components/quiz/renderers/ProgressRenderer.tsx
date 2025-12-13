import { cn } from '@/lib/utils';

interface ProgressRendererProps {
  currentStep: number;
  totalSteps: number;
  config: {
    progressStyle?: 'bar' | 'segments' | 'steps' | 'dots';
    progressShowText?: 'none' | 'percent' | 'steps' | 'both';
    progressTextPosition?: 'left' | 'right' | 'center' | 'above' | 'below';
    progressHeight?: number;
    progressBarColor?: string;
    progressBgColor?: string;
    progressTextColor?: string;
    progressBorderRadius?: number;
    progressAnimated?: boolean;
  };
}

export function ProgressRenderer({ currentStep, totalSteps, config }: ProgressRendererProps) {
  const style = config.progressStyle || 'bar';
  const showText = config.progressShowText || 'none';
  const textPosition = config.progressTextPosition || 'right';
  const height = config.progressHeight || 8;
  const barColor = config.progressBarColor || '#000000';
  const bgColor = config.progressBgColor || '#e5e7eb';
  const textColor = config.progressTextColor || '#374151';
  const borderRadius = config.progressBorderRadius ?? 9999;
  const animated = config.progressAnimated !== false;

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const percentText = `${Math.round(progress)}%`;
  const stepsText = `${currentStep} de ${totalSteps}`;

  const getText = () => {
    if (showText === 'percent') return percentText;
    if (showText === 'steps') return stepsText;
    if (showText === 'both') return `${stepsText} (${percentText})`;
    return null;
  };

  const text = getText();
  const isVerticalText = textPosition === 'above' || textPosition === 'below';

  // Bar style (continuous)
  const renderBar = () => (
    <div 
      className="w-full overflow-hidden"
      style={{ 
        backgroundColor: bgColor, 
        height: `${height}px`,
        borderRadius: `${borderRadius}px`
      }}
    >
      <div 
        className={cn(animated && "transition-all duration-500 ease-out")}
        style={{ 
          width: `${progress}%`, 
          height: '100%',
          backgroundColor: barColor,
          borderRadius: `${borderRadius}px`
        }}
      />
    </div>
  );

  // Segments style
  const renderSegments = () => (
    <div className="flex gap-1 w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "flex-1 overflow-hidden",
            animated && "transition-all duration-300"
          )}
          style={{ 
            backgroundColor: i < currentStep ? barColor : bgColor,
            height: `${height}px`,
            borderRadius: `${borderRadius}px`
          }}
        />
      ))}
    </div>
  );

  // Steps style (numbered circles)
  const renderSteps = () => (
    <div className="flex items-center justify-between w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div 
            className={cn(
              "flex items-center justify-center text-xs font-medium shrink-0",
              animated && "transition-all duration-300"
            )}
            style={{ 
              width: `${Math.max(height * 2.5, 24)}px`,
              height: `${Math.max(height * 2.5, 24)}px`,
              backgroundColor: i < currentStep ? barColor : bgColor,
              color: i < currentStep ? '#fff' : textColor,
              borderRadius: '50%'
            }}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div 
              className="flex-1 mx-1"
              style={{ 
                height: `${Math.max(height / 2, 2)}px`,
                backgroundColor: i < currentStep - 1 ? barColor : bgColor
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Dots style
  const renderDots = () => (
    <div className="flex gap-2 justify-center w-full">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={cn(animated && "transition-all duration-300")}
          style={{ 
            width: `${Math.max(height * 1.5, 8)}px`,
            height: `${Math.max(height * 1.5, 8)}px`,
            backgroundColor: i < currentStep ? barColor : bgColor,
            borderRadius: '50%',
            transform: i === currentStep - 1 ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );

  const renderProgress = () => {
    switch (style) {
      case 'segments': return renderSegments();
      case 'steps': return renderSteps();
      case 'dots': return renderDots();
      default: return renderBar();
    }
  };

  const textElement = text && (
    <span 
      className="text-sm font-medium whitespace-nowrap"
      style={{ color: textColor }}
    >
      {text}
    </span>
  );

  if (isVerticalText) {
    return (
      <div className="py-2 w-full">
        {textPosition === 'above' && text && (
          <div className={cn(
            "mb-2",
            textPosition === 'above' && "text-center"
          )}>
            {textElement}
          </div>
        )}
        {renderProgress()}
        {textPosition === 'below' && text && (
          <div className="mt-2 text-center">
            {textElement}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="py-2 w-full">
      <div className={cn(
        "flex items-center gap-3",
        textPosition === 'center' && "flex-col"
      )}>
        {textPosition === 'left' && textElement}
        <div className="flex-1 w-full">
          {renderProgress()}
        </div>
        {textPosition === 'right' && textElement}
        {textPosition === 'center' && textElement}
      </div>
    </div>
  );
}
