import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SingleChoiceScreen } from './screens/SingleChoiceScreen';
import { MultipleChoiceScreen } from './screens/MultipleChoiceScreen';
import { SliderScreen } from './screens/SliderScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
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
        <p>Nenhum quiz ativo</p>
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
        return <p>Tipo de tela não suportado</p>;
    }
  };

  const showNavigation = currentScreen.type !== 'welcome' && currentScreen.type !== 'result';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar */}
      {showNavigation && (
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50 px-6 py-4">
          <div className="max-w-2xl mx-auto">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              {currentSession.currentScreenIndex + 1} de {currentQuiz.screens.length}
            </p>
          </div>
        </div>
      )}

      {/* Screen content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <div key={currentScreen.id}>
            {renderScreen()}
          </div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      {showNavigation && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-lg border-t border-border/50 px-6 py-4">
          <div className="max-w-2xl mx-auto flex justify-between gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={previousScreen}
              disabled={isFirstScreen}
              className="rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              size="lg"
              onClick={nextScreen}
              disabled={!canProceed() || isLastScreen}
              className="gradient-primary text-primary-foreground rounded-xl px-8"
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
