import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SlidingRulerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  altUnit?: string;
  className?: string;
}

export function SlidingRuler({ 
  value, 
  onChange, 
  min, 
  max, 
  step = 1,
  unit,
  altUnit,
  className 
}: SlidingRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeUnit, setActiveUnit] = useState(unit);
  
  // Calculate the ruler width and positioning
  const range = max - min;
  const tickCount = range / step;
  const tickSpacing = 8; // pixels between each tick
  const rulerWidth = tickCount * tickSpacing;
  
  // Calculate the offset to center the current value
  const valueRatio = (value - min) / range;
  const offset = valueRatio * rulerWidth;
  
  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current || !rulerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerCenter = containerRect.width / 2;
    const rulerRect = rulerRef.current.getBoundingClientRect();
    
    // Calculate the delta from center
    const currentOffset = containerCenter - (rulerRect.left - containerRect.left);
    const deltaX = clientX - containerRect.left - containerCenter;
    
    // New offset based on drag
    const newOffset = currentOffset + deltaX;
    const newRatio = newOffset / rulerWidth;
    let newValue = min + (newRatio * range);
    
    // Clamp and round to step
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [min, max, range, rulerWidth, step, value, onChange]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleDrag(e.clientX);
  }, [handleDrag]);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    handleDrag(e.touches[0].clientX);
  }, [handleDrag]);
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      handleDrag(e.touches[0].clientX);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleDrag]);
  
  // Generate tick marks
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const tickValue = min + (i * step);
    const isMajor = tickValue % 10 === 0;
    const isLabel = tickValue % 30 === 0 || tickValue === min || tickValue === max;
    
    ticks.push(
      <div 
        key={i} 
        className="flex flex-col items-center"
        style={{ width: tickSpacing }}
      >
        <div 
          className={cn(
            "w-px transition-colors",
            isMajor ? "h-5 bg-muted-foreground/60" : "h-3 bg-border"
          )} 
        />
        {isLabel && (
          <span className="text-[10px] text-muted-foreground mt-1 select-none">
            {tickValue}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("select-none", className)}>
      {/* Unit Toggle */}
      {altUnit && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-muted rounded-full p-1">
            <button 
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                activeUnit === unit 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveUnit(unit)}
            >
              {unit}
            </button>
            <button 
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                activeUnit === altUnit 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveUnit(altUnit)}
            >
              {altUnit}
            </button>
          </div>
        </div>
      )}
      
      {/* Value Display */}
      <div className="text-center mb-6">
        <span className="text-5xl font-semibold tabular-nums">{value}</span>
        <span className="text-xl text-muted-foreground ml-1">{activeUnit}</span>
      </div>
      
      {/* Fixed Indicator */}
      <div className="relative flex justify-center mb-1">
        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-foreground" />
      </div>
      <div className="relative flex justify-center">
        <div className="w-0.5 h-4 bg-foreground rounded-full" />
      </div>
      
      {/* Ruler Container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative overflow-hidden cursor-grab active:cursor-grabbing py-2",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Sliding Ruler */}
        <div 
          ref={rulerRef}
          className="flex items-start transition-transform duration-75 ease-out"
          style={{ 
            transform: `translateX(calc(50% - ${offset}px))`,
            width: rulerWidth,
          }}
        >
          {ticks}
        </div>
        
        {/* Progress overlay */}
        <div 
          className="absolute top-2 left-0 h-5 bg-primary/20 pointer-events-none rounded-r-full"
          style={{ 
            width: '50%',
          }}
        />
      </div>
      
      {/* Slider track visualization */}
      <div className="relative h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-75"
          style={{ width: `${valueRatio * 100}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full shadow-sm transition-all duration-75"
          style={{ left: `calc(${valueRatio * 100}% - 8px)` }}
        />
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-4">Arraste para ajustar</p>
    </div>
  );
}
