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
    <div className="flex flex-col items-center px-6 py-8">
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-muted-foreground">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-md space-y-2">
        {screen.options?.map((option) => {
          const isSelected = selectedValues.includes(option.value as string);
          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.value as string)}
              className={cn(
                "w-full p-3 rounded-md border text-left transition-colors flex items-center justify-between text-sm",
                isSelected
                  ? "border-foreground bg-accent"
                  : "border-border hover:bg-accent/50"
              )}
            >
              <span>{option.text}</span>
              <div className={cn(
                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                isSelected ? "bg-foreground border-foreground" : "border-muted-foreground"
              )}>
                {isSelected && <Check className="w-3 h-3 text-background" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}