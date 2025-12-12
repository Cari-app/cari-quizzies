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
        
        {/* Slider handle - no line, just floating handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: `translateX(-50%) translateY(-50%)` }}
        >
          <div 
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-white/95 backdrop-blur-sm",
              "shadow-[0_2px_12px_rgba(0,0,0,0.15)]",
              "flex items-center justify-center",
              "transition-all duration-150",
              isDragging ? "scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.2)]" : "hover:scale-105"
            )}
          >
            <div className="flex items-center">
              <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 -ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}