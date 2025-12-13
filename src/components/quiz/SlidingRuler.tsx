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
  barColor?: string;
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
  barColor = '#22c55e',
  className 
}: SlidingRulerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const [activeUnit, setActiveUnit] = useState(unit);
  
  // Calculate ruler dimensions
  const range = max - min;
  const pixelsPerUnit = 4; // How many pixels per unit of value
  
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartValue(value);
  }, [value]);
  
  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    
    // Calculate delta in pixels (negative because dragging left should increase value)
    const deltaX = startX - clientX;
    
    // Convert pixels to value change
    const deltaValue = deltaX / pixelsPerUnit;
    
    // Calculate new value
    let newValue = startValue + deltaValue;
    
    // Clamp and round to step
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));
    
    if (newValue !== value) {
      onChange(newValue);
    }
  }, [isDragging, startX, startValue, pixelsPerUnit, step, min, max, value, onChange]);
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);
  
  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);
  
  // Global event listeners for drag
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleDragEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);
  
  // Calculate ruler offset for visual display
  const rulerOffset = (value - min) * pixelsPerUnit;
  
  // Generate tick marks for visible area (centered around current value)
  const visibleRange = 60; // Show ±60 units
  const tickStart = Math.max(min, value - visibleRange);
  const tickEnd = Math.min(max, value + visibleRange);
  
  const ticks = [];
  for (let tickValue = tickStart; tickValue <= tickEnd; tickValue += step) {
    const isMajor = tickValue % 10 === 0;
    const isLabel = tickValue % 20 === 0;
    const offsetFromCenter = (tickValue - value) * pixelsPerUnit;
    
    ticks.push(
      <div 
        key={tickValue} 
        className="absolute flex flex-col items-center"
        style={{ 
          left: `calc(50% + ${offsetFromCenter}px)`,
          transform: 'translateX(-50%)'
        }}
      >
        <div 
          className={cn(
            "w-px",
            isMajor ? "h-6 bg-muted-foreground/50" : "h-3 bg-border"
          )} 
        />
        {isLabel && (
          <span className="text-[10px] text-muted-foreground mt-1 select-none whitespace-nowrap">
            {tickValue}
          </span>
        )}
      </div>
    );
  }
  
  // Calculate progress percentage
  const progressPercent = ((value - min) / range) * 100;
  
  return (
    <div className={cn("select-none", className)}>
      {/* Unit Toggle */}
      {altUnit && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex bg-foreground/10 backdrop-blur-sm rounded-full p-1">
            <button 
              type="button"
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
              type="button"
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
      
      {/* Fixed Indicator Arrow */}
      <div className="flex justify-center mb-0">
        <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-foreground" />
      </div>
      <div className="flex justify-center">
        <div className="w-0.5 h-3 bg-foreground" />
      </div>
      
      {/* Ruler Container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative h-16 overflow-hidden cursor-grab",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Tick marks */}
        <div className="relative h-full">
          {ticks}
        </div>
      </div>
      
      {/* Progress Track */}
      <div className="relative h-3 mt-2 px-3">
        {/* Track Background */}
        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-1.5 bg-foreground/20 rounded-full" />
        {/* Progress Fill */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full left-3"
          style={{ width: `calc(${progressPercent}% - 12px)`, backgroundColor: barColor }}
        />
        {/* Thumb */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2"
          style={{ 
            left: `calc(${progressPercent}%)`,
            transform: 'translate(-50%, -50%)',
            borderColor: barColor
          }}
        />
      </div>
      
      {/* Min/Max labels */}
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      
      <p className="text-center text-xs text-muted-foreground mt-3">Arraste para ajustar</p>
    </div>
  );
}
