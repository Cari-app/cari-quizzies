import { cn } from '@/lib/utils';
import { RendererProps } from './types';

export function SpacerRenderer({ config }: RendererProps) {
  const spacerHeight = config.spacerHeight || 24;
  const showLine = config.spacerShowLine;
  const lineColor = config.spacerLineColor || '#e5e7eb';
  const lineThickness = config.spacerLineThickness || 1;
  const lineStyle = config.spacerLineStyle || 'solid';
  
  if (showLine) {
    return (
      <div 
        className="w-full flex items-center"
        style={{ height: `${spacerHeight}px` }}
      >
        <div 
          className="w-full"
          style={{ 
            borderTopWidth: `${lineThickness}px`,
            borderTopStyle: lineStyle as any,
            borderTopColor: lineColor
          }}
        />
      </div>
    );
  }
  
  return <div style={{ height: `${spacerHeight}px` }} />;
}

export function SeparatorRenderer({ config }: RendererProps) {
  return (
    <div className="py-4">
      <hr className="border-t border-border" />
    </div>
  );
}
