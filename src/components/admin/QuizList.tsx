import { useEffect, useState } from 'react';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil, FileQuestion, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SupabaseQuiz {
  id: string;
  titulo: string;
  descricao: string | null;
  slug: string | null;
  is_active: boolean | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

export function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load quizzes from Supabase
  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('atualizado_em', { ascending: false });

        if (error) throw error;

        const formattedQuizzes: Quiz[] = (data || []).map((q: SupabaseQuiz) => ({
          id: q.id,
          name: q.titulo,
          description: q.descricao || '',
          slug: q.slug || undefined,
          screens: [],
          createdAt: new Date(q.criado_em || ''),
          updatedAt: new Date(q.atualizado_em || ''),
          isPublished: q.is_active || false,
        }));

        setQuizzes(formattedQuizzes);
      } catch (error: any) {
        console.error('Error loading quizzes:', error);
        toast.error('Erro ao carregar quizzes');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const handlePreview = (quiz: Quiz) => {
    if (quiz.slug) {
      navigate(`/${quiz.slug}`);
    } else {
      navigate(`/${quiz.id}`);
    }
  };

  const handleEdit = (quiz: Quiz) => {
    navigate('/admin/quiz/' + quiz.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este quiz?')) {
      try {
        // Delete etapas first
        await supabase.from('etapas').delete().eq('quiz_id', id);
        // Then delete quiz
        const { error } = await supabase.from('quizzes').delete().eq('id', id);
        if (error) throw error;
        
        setQuizzes(prev => prev.filter(q => q.id !== id));
        toast.success('Quiz excluído com sucesso');
      } catch (error: any) {
        console.error('Error deleting quiz:', error);
        toast.error('Erro ao excluir quiz');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                  {quiz.slug && <span className="text-primary">/{quiz.slug}</span>}
                  {quiz.slug && ' · '}
                  Atualizado em {quiz.updatedAt.toLocaleDateString('pt-BR')}
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
