import { cn } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize';
import { RendererProps } from './types';

export function ArgumentsRenderer({ 
  component, 
  config 
}: RendererProps) {
  const argumentItems = (config.argumentItems || []) as Array<{
    id: string;
    title: string;
    description: string;
    mediaType: 'none' | 'emoji' | 'image';
    emoji?: string;
    imageUrl?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }>;
  
  const layout = config.argumentLayout || 'grid-2';
  const disposition = config.argumentDisposition || 'image-text';
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[horizontalAlign];
  
  const gridClass = {
    'list': 'grid-cols-1',
    'grid-2': 'grid-cols-2',
    'grid-3': 'grid-cols-3',
    'grid-4': 'grid-cols-4',
  }[layout] || 'grid-cols-2';
  
  const isVertical = disposition === 'image-text' || disposition === 'text-image';
  const imageFirst = disposition === 'image-text' || disposition === 'image-left';
  
  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div 
        className={cn("grid gap-3", gridClass)}
        style={{ width: `${widthValue}%` }}
      >
        {argumentItems.map((item) => {
          const borderWidth = item.borderWidth ?? 1;
          const borderRadius = item.borderRadius ?? 8;
          
          return (
            <div 
              key={item.id} 
              className={cn(
                "p-4 flex",
                isVertical ? "flex-col" : "flex-row gap-3",
                !imageFirst && isVertical && "flex-col-reverse",
                !imageFirst && !isVertical && "flex-row-reverse"
              )}
              style={{
                backgroundColor: item.backgroundColor || undefined,
                borderColor: item.borderColor || 'hsl(var(--primary) / 0.3)',
                borderWidth: `${borderWidth}px`,
                borderStyle: borderWidth > 0 ? 'solid' : 'none',
                borderRadius: `${borderRadius}px`
              }}
            >
              {/* Media area */}
              {item.mediaType !== 'none' && (
                <div className={cn(
                  "flex items-center justify-center bg-muted/30 rounded",
                  isVertical ? "w-full h-20 mb-3" : "w-16 h-16 flex-shrink-0"
                )}>
                  {item.mediaType === 'image' && item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                  ) : item.mediaType === 'emoji' && item.emoji ? (
                    <span className="text-3xl">{item.emoji}</span>
                  ) : null}
                </div>
              )}
              
              {/* Content */}
              <div className={cn("text-center", !isVertical && "text-left flex-1")}>
                <div 
                  className="font-semibold text-sm rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}
                />
                <div 
                  className="text-xs text-muted-foreground mt-1 rich-text"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
