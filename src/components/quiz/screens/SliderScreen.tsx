import { QuizScreen } from '@/types/quiz';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect } from 'react';

interface SliderScreenProps {
  screen: QuizScreen;
  value?: number;
  onChange: (value: number) => void;
}

export function SliderScreen({ screen, value, onChange }: SliderScreenProps) {
  const min = screen.sliderMin ?? 0;
  const max = screen.sliderMax ?? 100;
  const step = screen.sliderStep ?? 1;
  const [internalValue, setInternalValue] = useState(value ?? Math.round((min + max) / 2));

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (newValue: number[]) => {
    setInternalValue(newValue[0]);
    onChange(newValue[0]);
  };

  return (
    <div className="flex flex-col items-center px-6 py-8">
      <div className="text-center mb-12 max-w-lg">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-muted-foreground">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl font-semibold tabular-nums">
            {internalValue}
          </span>
          {screen.sliderUnit && (
            <span className="text-lg text-muted-foreground ml-2">
              {screen.sliderUnit}
            </span>
          )}
        </div>

        <div className="px-2">
          <Slider
            value={[internalValue]}
            onValueChange={handleChange}
            min={min}
            max={max}
            step={step}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    </div>
  );
}