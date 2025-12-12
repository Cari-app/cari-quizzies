import { motion } from 'framer-motion';
import { QuizScreen } from '@/types/quiz';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultipleChoiceScreenProps {
  screen: QuizScreen;
  selectedValues?: string[];
  onSelect: (values: string[]) => void;
}

export function MultipleChoiceScreen({ screen, selectedValues = [], onSelect }: MultipleChoiceScreenProps) {
  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelect(newValues);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center px-6 py-8"
    >
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-muted-foreground">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-md space-y-3">
        {screen.options?.map((option, index) => {
          const isSelected = selectedValues.includes(option.value as string);
          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleToggle(option.value as string)}
              className={cn(
                "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between group",
                isSelected
                  ? "border-primary bg-primary/10 shadow-soft"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <span className="font-medium">{option.text}</span>
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              )}>
                {isSelected && (
                  <Check className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
