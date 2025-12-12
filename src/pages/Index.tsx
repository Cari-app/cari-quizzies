import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Play, Settings, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { quizzes, startSession } = useQuizStore();
  const publishedQuizzes = quizzes.filter(q => q.isPublished);

  const handleStartQuiz = (quizId: string) => {
    startSession(quizId);
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen gradient-surface">
      {/* Hero Section */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
              <span className="text-xl">🎯</span>
            </div>
            <span className="font-bold text-xl">QuizFlow</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="rounded-xl"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Descubra seu{' '}
            <span className="bg-clip-text text-transparent gradient-primary">
              potencial
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Responda nossos quizzes personalizados e receba recomendações feitas especialmente para você
          </p>
        </motion.div>

        {publishedQuizzes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="max-w-md mx-auto border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Play className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhum quiz disponível</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Acesse o painel admin para criar e publicar quizzes
                </p>
                <Button onClick={() => navigate('/admin')} className="gradient-primary text-primary-foreground rounded-xl">
                  <Settings className="w-4 h-4 mr-2" />
                  Ir para Admin
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {publishedQuizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="group hover:shadow-soft transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  <div className="h-2 gradient-primary" />
                  <CardHeader>
                    <CardTitle className="text-xl">{quiz.name}</CardTitle>
                    <CardDescription>
                      {quiz.description || 'Clique para começar'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {quiz.screens.length} perguntas
                      </span>
                      <Button
                        size="sm"
                        className="gradient-primary text-primary-foreground rounded-xl group-hover:shadow-glow transition-all"
                      >
                        Iniciar
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 mt-12 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Feito com</span>
          <span className="text-red-500">❤️</span>
          <span>usando QuizFlow</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
