import { cn } from '@/lib/utils';
import { RendererProps } from './types';

interface TimerRendererProps extends RendererProps {
  timerValue: number;
}

export function TimerRenderer({ 
  component, 
  config,
  timerValue,
  processTemplateHtml 
}: TimerRendererProps) {
  const timerStyles = {
    default: 'bg-primary text-primary-foreground',
    red: 'bg-red-100 text-red-700 border border-red-200',
    blue: 'bg-blue-100 text-blue-700 border border-blue-200',
    green: 'bg-green-100 text-green-700 border border-green-200',
    yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
  };
  
  const style = config.timerStyle || 'default';
  const timerSeconds = config.timerSeconds || 60;
  const minutes = Math.floor(timerValue / 60);
  const seconds = timerValue % 60;
  
  return (
    <div className="py-4">
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "px-6 py-3 rounded-lg font-mono text-2xl font-bold",
          timerStyles[style as keyof typeof timerStyles]
        )}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {config.timerText && (
          <div 
            className="text-sm text-muted-foreground rich-text"
            dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.timerText) : config.timerText }}
          />
        )}
      </div>
    </div>
  );
}
