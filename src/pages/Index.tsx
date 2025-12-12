import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Play, ChevronRight, LogIn } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { quizzes } = useQuizStore();
  const { isAuthenticated } = useAuth();
  const publishedQuizzes = quizzes.filter(q => q.isPublished);

  const handleStartQuiz = (quiz: typeof quizzes[0]) => {
    if (quiz.slug) {
      navigate(`/${quiz.slug}`);
    } else {
      navigate(`/${quiz.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-medium">QuizFlow</span>
          </div>
          {isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Entrar
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight mb-3">
            Quizzes
          </h1>
          <p className="text-muted-foreground">
            Responda nossos quizzes e receba recomendações personalizadas.
          </p>
        </div>

        {publishedQuizzes.length === 0 ? (
          <div className="border border-dashed border-border rounded-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Play className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nenhum quiz disponível</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isAuthenticated 
                ? 'Acesse o painel admin para criar e publicar quizzes.'
                : 'Entre com sua conta para criar quizzes.'
              }
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/admin' : '/login')}
            >
              {isAuthenticated ? 'Ir para Admin' : 'Fazer login'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {publishedQuizzes.map((quiz) => (
              <button
                key={quiz.id}
                onClick={() => handleStartQuiz(quiz)}
                className="w-full text-left p-4 rounded-md border border-border hover:bg-accent transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{quiz.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {quiz.description || `${quiz.screens.length} perguntas`}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-4" />
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;