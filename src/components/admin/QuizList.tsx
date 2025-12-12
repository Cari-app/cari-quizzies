import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie e crie novos quizzes
          </p>
        </div>
        <Link to="/admin/quiz/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="border border-dashed border-border rounded-md p-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Nenhum quiz criado ainda
          </p>
          <Link to="/admin/quiz/new">
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-md divide-y divide-border">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium truncate">{quiz.name}</h3>
                  <Badge variant={quiz.isPublished ? "default" : "secondary"} className="text-xs">
                    {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {quiz.screens.length} telas · Atualizado em {quiz.updatedAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(quiz)}
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}