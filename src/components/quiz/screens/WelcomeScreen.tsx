import { Button } from '@/components/ui/button';
import { QuizScreen } from '@/types/quiz';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  screen: QuizScreen;
  onNext: () => void;
}

export function WelcomeScreen({ screen, onNext }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      <div className="mb-8 max-w-md">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
          {screen.title}
        </h1>
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

      <Button onClick={onNext} size="lg">
        {screen.buttonText || 'Começar'}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  );
}