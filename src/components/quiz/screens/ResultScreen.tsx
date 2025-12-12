import { Button } from '@/components/ui/button';
import { QuizScreen } from '@/types/quiz';
import { Check } from 'lucide-react';

interface ResultScreenProps {
  screen: QuizScreen;
  onComplete: () => void;
}

export function ResultScreen({ screen, onComplete }: ResultScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center mb-6">
        <Check className="w-6 h-6 text-background" />
      </div>

      <div className="mb-8 max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">{screen.title}</h1>
        {screen.subtitle && (
          <p className="text-muted-foreground">
            {screen.subtitle}
          </p>
        )}
        {screen.description && (
          <p className="text-sm text-muted-foreground mt-3">
            {screen.description}
          </p>
        )}
      </div>

      <Button onClick={onComplete} size="lg">
        {screen.buttonText || 'Concluir'}
      </Button>
    </div>
  );
}