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
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Quizzes</h1>
          <p className="text-base text-muted-foreground mt-2">
            Gerencie e crie novos quizzes
          </p>
        </div>
        <Link to="/admin/quiz/new">
          <Button size="lg" className="gap-2 shadow-lime-md">
            <Plus className="w-5 h-5" />
            Novo Quiz
          </Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum quiz criado</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Comece criando seu primeiro quiz para engajar seu público
          </p>
          <Link to="/admin/quiz/new">
            <Button size="lg" className="gap-2">
              <Plus className="w-5 h-5" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border">
            {quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between p-5 hover:bg-accent/30 transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0 mr-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-base font-semibold truncate">{quiz.name}</h3>
                    <Badge 
                      variant={quiz.isPublished ? "default" : "secondary"} 
                      className="rounded-full px-3 py-0.5 text-xs font-medium"
                    >
                      {quiz.isPublished ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {quiz.screens.length} telas · Atualizado em {quiz.updatedAt.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(quiz)}
                    className="gap-2 h-9"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl p-2">
                      <DropdownMenuItem 
                        onClick={() => handlePreview(quiz)}
                        className="px-3 py-2.5 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-4 h-4 mr-3" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(quiz.id)}
                        className="px-3 py-2.5 rounded-lg cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-3" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
