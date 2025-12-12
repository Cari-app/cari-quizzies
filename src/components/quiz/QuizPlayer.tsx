import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SingleChoiceScreen } from './screens/SingleChoiceScreen';
import { MultipleChoiceScreen } from './screens/MultipleChoiceScreen';
import { SliderScreen } from './screens/SliderScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuizPlayer() {
  const navigate = useNavigate();
  const { 
    currentQuiz, 
    currentSession, 
    nextScreen, 
    previousScreen, 
    answerQuestion,
    endSession 
  } = useQuizStore();

  if (!currentQuiz || !currentSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-sm">Nenhum quiz ativo</p>
      </div>
    );
  }

  const currentScreen = currentQuiz.screens[currentSession.currentScreenIndex];
  const currentAnswer = currentSession.answers.find(a => a.screenId === currentScreen.id);
  const progress = ((currentSession.currentScreenIndex + 1) / currentQuiz.screens.length) * 100;
  const isFirstScreen = currentSession.currentScreenIndex === 0;
  const isLastScreen = currentSession.currentScreenIndex === currentQuiz.screens.length - 1;

  const handleComplete = () => {
    endSession();
    navigate('/');
  };

  const handleAnswer = (value: string | string[] | number) => {
    answerQuestion({ screenId: currentScreen.id, value });
  };

  const canProceed = () => {
    if (!currentScreen.required) return true;
    if (currentScreen.type === 'welcome' || currentScreen.type === 'info' || currentScreen.type === 'result') return true;
    return currentAnswer !== undefined;
  };

  const renderScreen = () => {
    switch (currentScreen.type) {
      case 'welcome':
        return <WelcomeScreen screen={currentScreen} onNext={nextScreen} />;
      case 'single-choice':
        return (
          <SingleChoiceScreen 
            screen={currentScreen} 
            selectedValue={currentAnswer?.value as string}
            onSelect={handleAnswer}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoiceScreen 
            screen={currentScreen} 
            selectedValues={currentAnswer?.value as string[]}
            onSelect={handleAnswer}
          />
        );
      case 'slider':
        return (
          <SliderScreen 
            screen={currentScreen} 
            value={currentAnswer?.value as number}
            onChange={handleAnswer}
          />
        );
      case 'result':
        return <ResultScreen screen={currentScreen} onComplete={handleComplete} />;
      default:
        return <p className="text-muted-foreground text-sm">Tipo de tela não suportado</p>;
    }
  };

  const showNavigation = currentScreen.type !== 'welcome' && currentScreen.type !== 'result';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {showNavigation && (
        <div className="sticky top-0 z-50 bg-background border-b border-border px-6 py-3">
          <div className="max-w-md mx-auto">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-muted-foreground text-center mt-2">
              {currentSession.currentScreenIndex + 1} / {currentQuiz.screens.length}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1">
        {renderScreen()}
      </div>

      {showNavigation && (
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4">
          <div className="max-w-md mx-auto flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={previousScreen}
              disabled={isFirstScreen}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={nextScreen}
              disabled={!canProceed() || isLastScreen}
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}