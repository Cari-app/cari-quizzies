import { cn } from '@/lib/utils';

interface ProgressRendererProps {
  currentStep: number;
  totalSteps: number;
  config: {
    progressStyle?: 'bar' | 'gradient' | 'neon' | 'segments' | 'dots';
    progressHeight?: number;
    progressBarColor?: string;
    progressGradientColor?: string;
    progressBgColor?: string;
    progressBorderRadius?: number;
    progressAnimated?: boolean;
  };
}

export function ProgressRenderer({ currentStep, totalSteps, config }: ProgressRendererProps) {
  const style = config.progressStyle || 'bar';
  const height = config.progressHeight || 8;
  const barColor = config.progressBarColor || '#000000';
  const gradientColor = config.progressGradientColor || '#8B5CF6';
  const bgColor = config.progressBgColor || '#e5e7eb';
  const borderRadius = config.progressBorderRadius ?? 9999;
  const animated = config.progressAnimated !== false;

  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  // Bar style (continuous solid)
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

  // Gradient style
  const renderGradient = () => (
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
          background: `linear-gradient(90deg, ${barColor} 0%, ${gradientColor} 100%)`,
          borderRadius: `${borderRadius}px`
        }}
      />
    </div>
  );

  // Neon style with glow effect
  const renderNeon = () => (
    <div 
      className="w-full overflow-hidden relative"
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
          background: `linear-gradient(90deg, ${barColor} 0%, ${gradientColor} 100%)`,
          borderRadius: `${borderRadius}px`,
          boxShadow: `0 0 ${height}px ${barColor}, 0 0 ${height * 2}px ${gradientColor}, 0 0 ${height * 3}px ${gradientColor}40`
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
      case 'gradient': return renderGradient();
      case 'neon': return renderNeon();
      case 'segments': return renderSegments();
      case 'dots': return renderDots();
      default: return renderBar();
    }
  };

  return (
    <div className="py-2 w-full">
      {renderProgress()}
    </div>
  );
}
