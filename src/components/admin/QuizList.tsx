import { useQuizStore } from '@/store/quizStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Play, Eye, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quiz } from '@/types/quiz';

export function QuizList() {
  const { quizzes, deleteQuiz, setCurrentQuiz, startSession } = useQuizStore();
  const navigate = useNavigate();

  const handlePreview = (quiz: Quiz) => {
    startSession(quiz.id);
    navigate('/quiz');
  };

  const handleEdit = (quiz: Quiz) => {
    setCurrentQuiz(quiz);
    navigate('/admin/quiz/' + quiz.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quiz?')) {
      deleteQuiz(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Quizzes</h1>
          <p className="text-muted-foreground">Gerencie e crie novos quizzes</p>
        </div>
        <Link to="/admin/quiz/new">
          <Button className="gradient-primary text-primary-foreground rounded-xl shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            Novo Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum quiz criado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie seu primeiro quiz para começar a engajar seus usuários
            </p>
            <Link to="/admin/quiz/new">
              <Button className="gradient-primary text-primary-foreground rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-soft transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{quiz.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {quiz.description || 'Sem descrição'}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(quiz)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePreview(quiz)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(quiz.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={quiz.isPublished ? "default" : "secondary"}>
                        {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {quiz.screens.length} telas
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(quiz)}
                      className="rounded-lg"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
