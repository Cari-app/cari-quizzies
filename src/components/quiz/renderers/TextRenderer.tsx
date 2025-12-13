import { cn } from '@/lib/utils';
import { RendererProps } from './types';

export function TextRenderer({ config, processTemplateHtml }: RendererProps) {
  return (
    <div className={cn(
      "py-4",
      config.textAlign === 'center' && 'text-center',
      config.textAlign === 'right' && 'text-right'
    )}>
      <div 
        className="rich-text text-foreground"
        dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.content || '') }}
      />
    </div>
  );
}
