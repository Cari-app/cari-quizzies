import { QuizScreen } from '@/types/quiz';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SingleChoiceScreenProps {
  screen: QuizScreen;
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function SingleChoiceScreen({ screen, selectedValue, onSelect }: SingleChoiceScreenProps) {
  return (
    <div className="flex flex-col items-center px-6 py-8">
      <div className="text-center mb-8 max-w-lg">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-2">{screen.title}</h2>
        {screen.subtitle && (
          <p className="text-sm text-muted-foreground">{screen.subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-md space-y-2">
        {screen.options?.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.value as string)}
            className={cn(
              "w-full p-3 rounded-md border text-left transition-colors flex items-center justify-between text-sm",
              selectedValue === option.value
                ? "border-foreground bg-accent"
                : "border-border hover:bg-accent/50"
            )}
          >
            <span>{option.text}</span>
            {selectedValue === option.value && (
              <Check className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}