import { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SingleChoiceScreen } from './screens/SingleChoiceScreen';
import { MultipleChoiceScreen } from './screens/MultipleChoiceScreen';
import { SliderScreen } from './screens/SliderScreen';
import { ResultScreen } from './screens/ResultScreen';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Quiz, QuizScreen } from '@/types/quiz';

interface QuizPlayerProps {
  slug?: string;
}

export function QuizPlayer({ slug }: QuizPlayerProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { 
    currentQuiz, 
    currentSession, 
    quizzes,
    setCurrentQuiz,
    nextScreen, 
    previousScreen, 
    answerQuestion,
    endSession,
    startSession
  } = useQuizStore();

  // Load quiz by slug or id from Supabase
  useEffect(() => {
    const loadQuiz = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        // Try to find by slug first
        let { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        // If not found by slug, try by id
        if (!quizData) {
          const { data } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', slug)
            .eq('is_active', true)
            .maybeSingle();
          quizData = data;
        }

        if (!quizData) {
          // Fallback to local store
          const localQuiz = quizzes.find(q => q.slug === slug) || quizzes.find(q => q.id === slug);
          if (localQuiz) {
            setCurrentQuiz(localQuiz);
            startSession(localQuiz.id);
            setIsLoading(false);
            return;
          }
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        // Load etapas
        const { data: etapasData } = await supabase
          .from('etapas')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('ordem', { ascending: true });

        // Convert to Quiz format
        const screens: QuizScreen[] = (etapasData || []).map((etapa) => {
          const config = etapa.configuracoes as Record<string, any> || {};
          return {
            id: etapa.id,
            type: etapa.tipo as QuizScreen['type'],
            title: etapa.titulo || '',
            subtitle: etapa.subtitulo || undefined,
            description: etapa.descricao || undefined,
            buttonText: etapa.texto_botao || undefined,
            options: etapa.opcoes as any,
            required: config.required,
            sliderMin: config.sliderMin,
            sliderMax: config.sliderMax,
            sliderStep: config.sliderStep,
            sliderUnit: config.sliderUnit,
            ...config,
          };
        });

        const quiz: Quiz = {
          id: quizData.id,
          name: quizData.titulo,
          description: quizData.descricao || '',
          slug: quizData.slug || undefined,
          screens,
          createdAt: new Date(quizData.criado_em || ''),
          updatedAt: new Date(quizData.atualizado_em || ''),
          isPublished: quizData.is_active || false,
        };

        setCurrentQuiz(quiz);
        startSession(quiz.id);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

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