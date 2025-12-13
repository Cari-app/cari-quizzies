import { cn } from '@/lib/utils';
import { RendererProps } from './types';

export function AlertRenderer({ 
  component, 
  config,
  processTemplateHtml 
}: RendererProps) {
  const alertStyles = {
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  
  const paddingStyles = {
    compact: 'p-2',
    default: 'p-4',
    relaxed: 'p-6',
  };
  
  const style = (config as any).alertStyle || 'red';
  const padding = (config as any).alertPadding || 'default';
  
  return (
    <div className="w-full">
      <div 
        className={cn(
          "rounded-lg border",
          alertStyles[style as keyof typeof alertStyles],
          paddingStyles[padding as keyof typeof paddingStyles],
          (config as any).alertHighlight && "ring-2 ring-offset-2 ring-current"
        )}
      >
        <div 
          className="text-sm rich-text"
          dangerouslySetInnerHTML={{ __html: processTemplateHtml ? processTemplateHtml(config.description || 'Texto do alerta') : (config.description || 'Texto do alerta') }}
        />
      </div>
    </div>
  );
}
