import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil, FileQuestion, Loader2, Link2, Calendar, Users, TrendingUp } from 'lucide-react';
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

export function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [metrics, setMetrics] = useState<Record<string, QuizMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

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
      // Delete etapas first
      await supabase.from('etapas').delete().eq('quiz_id', quizToDelete);
      // Then delete quiz
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

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action Bar */}
      <div className="flex items-center justify-end">
        <Link to="/admin/quiz/new">
          <Button size="sm" className="gap-1.5 h-8">
            <Plus className="w-3.5 h-3.5" />
            Novo Quiz
          </Button>
        </Link>
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
            <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
              <Plus className="w-3 h-3" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {quizzes.map((quiz) => {
            const quizMetrics = metrics[quiz.id] || { totalSessions: 0, completedSessions: 0, conversionRate: 0 };
            
            return (
              <div
                key={quiz.id}
                className="group border border-border rounded-lg p-3 hover:border-foreground/20 hover:shadow-sm transition-all bg-card"
              >
                <div className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div 
                    className={`w-1 h-10 rounded-full shrink-0 ${
                      quiz.isPublished ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                  
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">{quiz.name}</h3>
                      <Badge 
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 h-4 font-normal ${
                          quiz.isPublished 
                            ? 'border-green-500/50 text-green-600 bg-green-500/10' 
                            : 'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {quiz.isPublished ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1">
                      {quiz.slug && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Link2 className="w-3 h-3" />
                          <span className="text-foreground/70">/{quiz.slug}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {quiz.updatedAt.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden sm:flex items-center gap-4 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5" title="Total de leads">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{quizMetrics.totalSessions}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Taxa de conclusão">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-medium text-foreground">{quizMetrics.conversionRate}%</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch
                      checked={quiz.isPublished}
                      onCheckedChange={() => handleToggleActive(quiz)}
                      aria-label="Ativar/Desativar quiz"
                      className="scale-90"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(quiz)}
                      className="gap-1 h-7 text-xs px-2"
                    >
                      <Pencil className="w-3 h-3" />
                      Editar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem 
                          onClick={() => handlePreview(quiz)}
                          className="text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 mr-2" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(quiz.id)}
                          className="text-xs text-destructive focus:text-destructive"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
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
