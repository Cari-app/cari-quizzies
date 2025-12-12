import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil, FileQuestion } from 'lucide-react';
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
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie e crie novos quizzes
          </p>
        </div>
        <Link to="/admin/quiz/new">
          <Button size="default" className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">Nenhum quiz criado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece criando seu primeiro quiz
          </p>
          <Link to="/admin/quiz/new">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              className={`flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${
                index !== quizzes.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-medium truncate">{quiz.name}</h3>
                  <Badge 
                    variant={quiz.isPublished ? "default" : "secondary"} 
                    className="text-xs"
                  >
                    {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quiz.screens.length} telas · Atualizado em {quiz.updatedAt.toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(quiz)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem 
                      onClick={() => handlePreview(quiz)}
                      className="text-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(quiz.id)}
                      className="text-sm text-destructive focus:text-destructive"
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
