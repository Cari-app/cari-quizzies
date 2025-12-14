import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil, FileQuestion, Loader2, Link2, Calendar, Users, TrendingUp, LayoutGrid, List } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Quiz } from '@/types/quiz';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SupabaseQuiz {
  id: string;
  titulo: string;
  descricao: string | null;
  slug: string | null;
  is_active: boolean | null;
  criado_em: string | null;
  atualizado_em: string | null;
}

interface QuizMetrics {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
}

type ViewMode = 'grid' | 'list';

export function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [metrics, setMetrics] = useState<Record<string, QuizMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Load quizzes and metrics from Supabase
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

        // Load metrics for each quiz
        const metricsData: Record<string, QuizMetrics> = {};
        for (const quiz of formattedQuizzes) {
          const { data: sessions } = await supabase
            .from('quiz_sessions')
            .select('id, is_completed')
            .eq('quiz_id', quiz.id);

          const total = sessions?.length || 0;
          const completed = sessions?.filter(s => s.is_completed)?.length || 0;
          metricsData[quiz.id] = {
            totalSessions: total,
            completedSessions: completed,
            conversionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
          };
        }
        setMetrics(metricsData);
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

  const handleDeleteClick = (id: string) => {
    setQuizToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!quizToDelete) return;
    
    try {
      await supabase.from('etapas').delete().eq('quiz_id', quizToDelete);
      const { error } = await supabase.from('quizzes').delete().eq('id', quizToDelete);
      if (error) throw error;
      
      setQuizzes(prev => prev.filter(q => q.id !== quizToDelete));
      toast.success('Quiz excluído com sucesso');
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast.error('Erro ao excluir quiz');
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const handleToggleActive = async (quiz: Quiz) => {
    try {
      const newStatus = !quiz.isPublished;
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: newStatus })
        .eq('id', quiz.id);
      
      if (error) throw error;
      
      setQuizzes(prev => prev.map(q => 
        q.id === quiz.id ? { ...q, isPublished: newStatus } : q
      ));
      
      toast.success(newStatus ? 'Quiz ativado' : 'Quiz desativado');
    } catch (error: any) {
      console.error('Error toggling quiz status:', error);
      toast.error('Erro ao alterar status do quiz');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const QuizCardGrid = ({ quiz }: { quiz: Quiz }) => {
    const quizMetrics = metrics[quiz.id] || { totalSessions: 0, completedSessions: 0, conversionRate: 0 };
    
    return (
      <div className="group border border-border rounded-lg overflow-hidden hover:border-foreground/30 transition-all bg-card">
        {/* Preview area */}
        <div 
          className="h-28 bg-muted/50 relative cursor-pointer flex items-center justify-center"
          onClick={() => handleEdit(quiz)}
        >
          <div className="text-muted-foreground/40">
            <FileQuestion className="w-8 h-8" />
          </div>
          
          {/* Status badge */}
          <Badge 
            variant="outline"
            className={cn(
              "absolute top-2 left-2 text-[9px] px-1.5 py-0 h-4 font-normal",
              quiz.isPublished 
                ? 'border-foreground/20 text-foreground bg-background' 
                : 'border-muted-foreground/30 text-muted-foreground bg-background'
            )}
          >
            {quiz.isPublished ? 'Ativo' : 'Inativo'}
          </Badge>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-6 w-6 bg-background/90 hover:bg-background">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => handleEdit(quiz)} className="text-[11px] h-7">
                  <Pencil className="w-3 h-3 mr-1.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePreview(quiz)} className="text-[11px] h-7">
                  <Eye className="w-3 h-3 mr-1.5" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteClick(quiz.id)}
                  className="text-[11px] h-7 text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1.5" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info */}
        <div className="p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-medium truncate">{quiz.name}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {quiz.updatedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Switch
              checked={quiz.isPublished}
              onCheckedChange={() => handleToggleActive(quiz)}
              className="scale-75 shrink-0"
            />
          </div>
          
          {/* Metrics */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{quizMetrics.totalSessions}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>{quizMetrics.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuizCardList = ({ quiz }: { quiz: Quiz }) => {
    const quizMetrics = metrics[quiz.id] || { totalSessions: 0, completedSessions: 0, conversionRate: 0 };
    
    return (
      <div className="group border border-border rounded-md px-3 py-2 hover:border-foreground/20 transition-all flex items-center gap-3">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium truncate">{quiz.name}</h3>
            <Badge 
              variant="outline"
              className={cn(
                "text-[9px] px-1 py-0 h-3.5 font-normal",
                quiz.isPublished 
                  ? 'border-foreground/20 text-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {quiz.isPublished ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 mt-0.5">
            {quiz.slug && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Link2 className="w-2.5 h-2.5" />
                <span>/{quiz.slug}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Calendar className="w-2.5 h-2.5" />
              {quiz.updatedAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{quizMetrics.totalSessions}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{quizMetrics.conversionRate}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          <Switch
            checked={quiz.isPublished}
            onCheckedChange={() => handleToggleActive(quiz)}
            className="scale-75"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(quiz)}
            className="gap-0.5 h-6 text-[11px] px-1.5"
          >
            <Pencil className="w-2.5 h-2.5" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handlePreview(quiz)} className="text-[11px] h-7">
                <Eye className="w-3 h-3 mr-1.5" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleDeleteClick(quiz.id)}
                className="text-[11px] h-7 text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3 h-3 mr-1.5" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </h2>
        
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-sm",
                viewMode === 'grid' && "bg-muted"
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 rounded-sm",
                viewMode === 'list' && "bg-muted"
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Link to="/admin/quiz/new">
            <Button size="sm" className="gap-1 h-7 text-xs">
              <Plus className="w-3 h-3" />
              Novo Quiz
            </Button>
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto mb-3">
            <FileQuestion className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-medium mb-1">Nenhum quiz criado</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Comece criando seu primeiro quiz
          </p>
          <Link to="/admin/quiz/new">
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
              <Plus className="w-3 h-3" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Create new card */}
          <Link 
            to="/admin/quiz/new"
            className="border border-dashed border-border rounded-lg h-[168px] flex flex-col items-center justify-center gap-2 hover:border-foreground/30 hover:bg-muted/30 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center">
              <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Novo Quiz</span>
          </Link>
          
          {quizzes.map((quiz) => (
            <QuizCardGrid key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="grid gap-1.5">
          {quizzes.map((quiz) => (
            <QuizCardList key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir quiz"
        description="Tem certeza que deseja excluir este quiz? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />
    </div>
  );
}
