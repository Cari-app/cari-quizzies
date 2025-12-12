import { QuizScreen } from '@/types/quiz';
import { WelcomeScreen } from '@/components/quiz/screens/WelcomeScreen';
import { SingleChoiceScreen } from '@/components/quiz/screens/SingleChoiceScreen';
import { MultipleChoiceScreen } from '@/components/quiz/screens/MultipleChoiceScreen';
import { SliderScreen } from '@/components/quiz/screens/SliderScreen';
import { ResultScreen } from '@/components/quiz/screens/ResultScreen';

interface ScreenPreviewProps {
  screen: QuizScreen;
}

export function ScreenPreview({ screen }: ScreenPreviewProps) {
  const renderScreen = () => {
    switch (screen.type) {
      case 'welcome':
        return <WelcomeScreen screen={screen} onNext={() => {}} />;
      case 'single-choice':
        return <SingleChoiceScreen screen={screen} onSelect={() => {}} />;
      case 'multiple-choice':
        return <MultipleChoiceScreen screen={screen} onSelect={() => {}} />;
      case 'slider':
        return <SliderScreen screen={screen} onChange={() => {}} />;
      case 'result':
        return <ResultScreen screen={screen} onComplete={() => {}} />;
      case 'info':
        return (
          <div className="flex flex-col items-center justify-center min-h-full text-center p-6">
            <h2 className="text-lg font-semibold mb-2">{screen.title}</h2>
            {screen.subtitle && <p className="text-sm text-muted-foreground">{screen.subtitle}</p>}
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center min-h-full text-muted-foreground text-xs">
            Preview indisponível
          </div>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto scale-[0.55] origin-top">
      {renderScreen()}
    </div>
  );
}