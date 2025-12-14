import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageButtonItem {
  id: string;
  imageUrl: string;
  buttonText: string;
  value: string;
  destination?: 'next' | 'submit' | 'specific';
  destinationStageId?: string;
}

interface ImageButtonRendererProps {
  config: Record<string, any>;
  onSelect?: (value: string, destination?: string, destinationStageId?: string) => void;
  selectedValues?: string[];
}

export function ImageButtonRenderer({ config, onSelect, selectedValues = [] }: ImageButtonRendererProps) {
  const items: ImageButtonItem[] = config.imageButtonItems || [];
  const orientation = config.imageButtonOrientation || 'vertical';
  const layout = config.imageButtonLayout || 'list';
  const position = config.imageButtonPosition || 'overlay';
  const style = config.imageButtonStyle || 'rounded';
  
  // Colors
  const bgColor = config.imageButtonBgColor || '#3f3f46';
  const textColor = config.imageButtonTextColor || '#ffffff';
  const iconColor = config.imageButtonIconColor || '#ffffff';
  const iconBgColor = config.imageButtonIconBgColor || '#000000';
  const containerBgColor = config.imageButtonContainerBgColor || 'transparent';
  
  // Sizing
  const imageRadius = config.imageButtonImageRadius ?? 16;
  const containerRadius = config.imageButtonContainerRadius ?? 24;
  const gap = config.imageButtonGap ?? 16;

  const getLayoutClass = () => {
    switch (layout) {
      case 'grid-2': return 'grid grid-cols-2';
      case 'grid-3': return 'grid grid-cols-3';
      default: return orientation === 'horizontal' ? 'flex flex-row flex-wrap' : 'flex flex-col';
    }
  };

  const getButtonRadius = () => {
    switch (style) {
      case 'pill': return 9999;
      case 'square': return 4;
      default: return 12;
    }
  };

  const handleClick = (item: ImageButtonItem) => {
    if (onSelect) {
      onSelect(item.value, item.destination, item.destinationStageId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Nenhum item configurado
      </div>
    );
  }

  return (
    <div 
      className={cn(getLayoutClass())}
      style={{ gap: `${gap}px` }}
    >
      {items.map((item) => {
        const isSelected = selectedValues.includes(item.value);
        
        return (
          <div
            key={item.id}
            className={cn(
              "relative cursor-pointer transition-all duration-200 overflow-hidden group",
              layout === 'list' && "w-full",
              layout.startsWith('grid') && "w-full",
              isSelected && "ring-2 ring-primary"
            )}
            style={{
              backgroundColor: containerBgColor,
              borderRadius: `${containerRadius}px`,
            }}
            onClick={() => handleClick(item)}
          >
            {/* Image */}
            <div 
              className="w-full overflow-hidden"
              style={{ 
                borderRadius: position === 'overlay' ? `${imageRadius}px` : `${imageRadius}px ${imageRadius}px 0 0`,
              }}
            >
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.buttonText}
                  className="w-full h-auto object-cover aspect-square group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Button */}
            {position === 'overlay' ? (
              <div 
                className={cn(
                  "absolute bottom-3 left-3 right-3 flex items-center justify-between px-4 py-2.5",
                  "backdrop-blur-sm"
                )}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: `${getButtonRadius()}px`,
                }}
              >
                <span 
                  className="font-medium text-sm"
                  style={{ color: textColor }}
                >
                  {item.buttonText}
                </span>
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <ChevronRight 
                    className="w-4 h-4" 
                    style={{ color: iconColor }}
                  />
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center justify-between px-4 py-3"
                style={{
                  backgroundColor: bgColor,
                  borderRadius: `0 0 ${getButtonRadius()}px ${getButtonRadius()}px`,
                }}
              >
                <span 
                  className="font-medium text-sm"
                  style={{ color: textColor }}
                >
                  {item.buttonText}
                </span>
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <ChevronRight 
                    className="w-4 h-4" 
                    style={{ color: iconColor }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
