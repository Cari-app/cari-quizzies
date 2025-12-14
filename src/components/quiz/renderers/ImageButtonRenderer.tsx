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
  const layoutMobile = config.imageButtonLayoutMobile; // undefined = same as desktop
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

  // Responsive layout classes
  const getLayoutClass = () => {
    // If mobile layout is defined, use responsive classes
    if (layoutMobile) {
      const mobileClass = layoutMobile === 'grid-2' ? 'grid-cols-2' 
        : layoutMobile === 'grid-3' ? 'grid-cols-3' 
        : 'grid-cols-1';
      
      const desktopClass = layout === 'grid-2' ? 'sm:grid-cols-2' 
        : layout === 'grid-3' ? 'sm:grid-cols-3' 
        : 'sm:grid-cols-1';
      
      return `grid ${mobileClass} ${desktopClass}`;
    }
    
    // Default behavior (same for all devices)
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
      className={cn(getLayoutClass(), "w-full")}
      style={{ gap: `${gap}px` }}
    >
      {items.map((item) => {
        const isSelected = selectedValues.includes(item.value);
        
        return (
          <div
            key={item.id}
            className={cn(
              "relative cursor-pointer transition-all duration-200 overflow-hidden group flex-1",
              isSelected && "ring-2 ring-primary"
            )}
            style={{
              backgroundColor: containerBgColor,
              borderRadius: `${containerRadius}px`,
              minWidth: layout === 'grid-2' ? 'calc(50% - 8px)' : layout === 'grid-3' ? 'calc(33.33% - 11px)' : undefined,
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
                  className="w-full h-auto object-cover aspect-[4/5] group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Sem imagem</span>
                </div>
              )}
            </div>

            {/* Button */}
            {position === 'overlay' ? (
              <div 
                className={cn(
                  "absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-2",
                  "backdrop-blur-sm"
                )}
                style={{
                  backgroundColor: bgColor,
                  borderRadius: `${getButtonRadius()}px`,
                }}
              >
                <span 
                  className="font-medium text-xs sm:text-sm leading-tight"
                  style={{ color: textColor }}
                >
                  {item.buttonText}
                </span>
                <div 
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 ml-2"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <ChevronRight 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
                    style={{ color: iconColor }}
                  />
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3"
                style={{
                  backgroundColor: bgColor,
                  borderRadius: `0 0 ${getButtonRadius()}px ${getButtonRadius()}px`,
                }}
              >
                <span 
                  className="font-medium text-xs sm:text-sm leading-tight"
                  style={{ color: textColor }}
                >
                  {item.buttonText}
                </span>
                <div 
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0 ml-2"
                  style={{ backgroundColor: iconBgColor }}
                >
                  <ChevronRight 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4" 
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
