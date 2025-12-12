import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-6 py-8"
    >
      <div className="text-center mb-12 max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-muted-foreground">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <span className="text-6xl font-bold bg-clip-text text-transparent gradient-primary">
            {internalValue}
          </span>
          {screen.sliderUnit && (
            <span className="text-2xl text-muted-foreground ml-2">
              {screen.sliderUnit}
            </span>
          )}
        </motion.div>

        <div className="px-4">
          <Slider
            value={[internalValue]}
            onValueChange={handleChange}
            min={min}
            max={max}
            step={step}
            className="cursor-pointer"
          />
          <div className="flex justify-between mt-4 text-sm text-muted-foreground">
            <span>{min} {screen.sliderUnit}</span>
            <span>{max} {screen.sliderUnit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
