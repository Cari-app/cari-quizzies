import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  image1: string;
  image2: string;
  ratio?: '1:1' | '16:9' | '4:3' | '9:16';
  initialPosition?: number;
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
}

export function BeforeAfterSlider({
  image1,
  image2,
  ratio = '1:1',
  initialPosition = 50,
  width = 100,
  horizontalAlign = 'start',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '9:16': 'aspect-[9/16]',
  }[ratio];

  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }[horizontalAlign];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        handleMove(e.touches[0].clientX);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleMove]);

  return (
    <div className={cn("w-full px-4 flex", justifyClass)}>
      <div 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden rounded-2xl shadow-2xl select-none cursor-ew-resize",
          aspectRatioClass
        )}
        style={{ width: `${width}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Background image (image 2 - After) */}
        <div className="absolute inset-0">
          {image2 ? (
            <img 
              src={image2} 
              alt="Depois" 
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Depois</span>
            </div>
          )}
        </div>
        
        {/* Foreground image (image 1 - Before) with clip */}
        <div 
          className="absolute inset-0 transition-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          {image1 ? (
            <img 
              src={image1} 
              alt="Antes" 
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Antes</span>
            </div>
          )}
        </div>
        
        {/* Slider line */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white/90 shadow-lg pointer-events-none z-10"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          {/* Slider handle */}
          <div 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-12 h-12 rounded-full bg-white shadow-2xl",
              "flex items-center justify-center",
              "border-2 border-white/50",
              "transition-transform duration-150",
              isDragging && "scale-110"
            )}
          >
            <div className="flex items-center gap-0.5">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Overlay gradient for premium effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-transparent to-black/5" />
      </div>
    </div>
  );
}