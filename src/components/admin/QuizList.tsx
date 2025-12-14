import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, MoreHorizontal, Eye, Trash2, Pencil, FileQuestion, Loader2, Link2, Calendar, Users, TrendingUp, LayoutGrid, List, ImageIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ImageInput } from '@/components/ui/image-input';
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
  thumbnail_url: string | null;
}

interface QuizWithThumbnail extends Quiz {
  thumbnailUrl?: string;
}

interface QuizMetrics {
  totalSessions: number;
  completedSessions: number;
  conversionRate: number;
}

type ViewMode = 'grid' | 'list';

export function QuizList() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizWithThumbnail[]>([]);
  const [metrics, setMetrics] = useState<Record<string, QuizMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Cover dialog
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [selectedQuizForCover, setSelectedQuizForCover] = useState<QuizWithThumbnail | null>(null);
  const [coverUrl, setCoverUrl] = useState('');

  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .order('atualizado_em', { ascending: false });

        if (error) throw error;

        const formattedQuizzes: QuizWithThumbnail[] = (data || []).map((q: SupabaseQuiz) => ({
          id: q.id,
          name: q.titulo,
          description: q.descricao || '',
          slug: q.slug || undefined,
          screens: [],
          createdAt: new Date(q.criado_em || ''),
          updatedAt: new Date(q.atualizado_em || ''),
          isPublished: q.is_active || false,
          thumbnailUrl: q.thumbnail_url || undefined,
        }));

        setQuizzes(formattedQuizzes);

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

  const handleOpenCoverDialog = (quiz: QuizWithThumbnail) => {
    setSelectedQuizForCover(quiz);
    setCoverUrl(quiz.thumbnailUrl || '');
    setCoverDialogOpen(true);
  };

  const handleSaveCover = async () => {
    if (!selectedQuizForCover) return;
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ thumbnail_url: coverUrl || null })
        .eq('id', selectedQuizForCover.id);

      if (error) throw error;

      setQuizzes(prev => prev.map(q => 
        q.id === selectedQuizForCover.id ? { ...q, thumbnailUrl: coverUrl || undefined } : q
      ));
      
      toast.success('Capa atualizada');
      setCoverDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating cover:', error);
      toast.error('Erro ao atualizar capa');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const QuizCardGrid = ({ quiz }: { quiz: QuizWithThumbnail }) => {
    const quizMetrics = metrics[quiz.id] || { totalSessions: 0, completedSessions: 0, conversionRate: 0 };
    
    return (
      <div className="group border border-border rounded-lg overflow-hidden hover:border-foreground/30 hover:shadow-md transition-all bg-card">
        {/* Cover/Preview area */}
        <div 
          className="h-36 bg-muted/30 relative cursor-pointer flex items-center justify-center overflow-hidden"
          onClick={() => handleEdit(quiz)}
        >
          {quiz.thumbnailUrl ? (
            <img 
              src={quiz.thumbnailUrl} 
              alt={quiz.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground/30 flex flex-col items-center gap-2">
              <ImageIcon className="w-10 h-10" />
              <span className="text-xs">Sem capa</span>
            </div>
          )}
          
          {/* Status badge */}
          <Badge 
            variant="outline"
            className={cn(
              "absolute top-2.5 left-2.5 text-[10px] px-2 py-0.5 font-normal backdrop-blur-sm",
              quiz.isPublished 
                ? 'border-foreground/20 text-foreground bg-background/80' 
                : 'border-muted-foreground/30 text-muted-foreground bg-background/80'
            )}
          >
            {quiz.isPublished ? 'Ativo' : 'Inativo'}
          </Badge>

          {/* Actions overlay */}
          <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-7 w-7 bg-background/90 hover:bg-background">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => handleEdit(quiz)} className="text-xs">
                  <Pencil className="w-3.5 h-3.5 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handlePreview(quiz)} className="text-xs">
                  <Eye className="w-3.5 h-3.5 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenCoverDialog(quiz)} className="text-xs">
                  <ImageIcon className="w-3.5 h-3.5 mr-2" />
                  Capa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium truncate">{quiz.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {quiz.updatedAt.toLocaleDateString('pt-BR')}
              </p>
            </div>
            <Switch
              checked={quiz.isPublished}
              onCheckedChange={() => handleToggleActive(quiz)}
              className="shrink-0"
            />
          </div>
          
          {/* Metrics */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{quizMetrics.totalSessions}</span>
              <span>leads</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{quizMetrics.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const QuizCardList = ({ quiz }: { quiz: QuizWithThumbnail }) => {
    const quizMetrics = metrics[quiz.id] || { totalSessions: 0, completedSessions: 0, conversionRate: 0 };
    
    return (
      <div className="group border border-border rounded-lg px-4 py-3 hover:border-foreground/20 hover:shadow-sm transition-all flex items-center gap-4">
        {/* Thumbnail */}
        <div 
          className="w-16 h-12 rounded-md bg-muted/30 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer"
          onClick={() => handleEdit(quiz)}
        >
          {quiz.thumbnailUrl ? (
            <img 
              src={quiz.thumbnailUrl} 
              alt={quiz.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium truncate">{quiz.name}</h3>
            <Badge 
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0 h-4 font-normal",
                quiz.isPublished 
                  ? 'border-foreground/20 text-foreground' 
                  : 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {quiz.isPublished ? 'Ativo' : 'Inativo'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 mt-1">
            {quiz.slug && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Link2 className="w-3 h-3" />
                <span>/{quiz.slug}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {quiz.updatedAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Metrics */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{quizMetrics.totalSessions}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="font-medium text-foreground">{quizMetrics.conversionRate}%</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Switch
            checked={quiz.isPublished}
            onCheckedChange={() => handleToggleActive(quiz)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(quiz)}
            className="gap-1 h-8 text-xs px-2"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => handlePreview(quiz)} className="text-xs">
                <Eye className="w-3.5 h-3.5 mr-2" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenCoverDialog(quiz)} className="text-xs">
                <ImageIcon className="w-3.5 h-3.5 mr-2" />
                Capa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
    );
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </h2>
        
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center border border-border rounded-md p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-sm",
                viewMode === 'grid' && "bg-muted"
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-sm",
                viewMode === 'list' && "bg-muted"
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          <Link to="/admin/quiz/new">
            <Button size="sm" className="gap-1.5 h-8">
              <Plus className="w-4 h-4" />
              Novo Quiz
            </Button>
          </Link>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">Nenhum quiz criado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Comece criando seu primeiro quiz
          </p>
          <Link to="/admin/quiz/new">
            <Button variant="outline" size="default" className="gap-2">
              <Plus className="w-4 h-4" />
              Criar primeiro quiz
            </Button>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {quizzes.map((quiz) => (
            <QuizCardGrid key={quiz.id} quiz={quiz} />
          ))}
          
          {/* Create new card - always last */}
          <Link 
            to="/admin/quiz/new"
            className="border border-dashed border-border rounded-lg h-[220px] flex flex-col items-center justify-center gap-3 hover:border-foreground/30 hover:bg-muted/30 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">Novo Quiz</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-2">
          {quizzes.map((quiz) => (
            <QuizCardList key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}

      {/* Cover Dialog */}
      <Dialog open={coverDialogOpen} onOpenChange={setCoverDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Capa do Quiz</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageInput
              value={coverUrl}
              onChange={setCoverUrl}
              placeholder="Cole a URL da imagem ou faça upload"
            />
            {coverUrl && (
              <div className="rounded-lg overflow-hidden border border-border">
                <img 
                  src={coverUrl} 
                  alt="Preview da capa" 
                  className="w-full h-32 object-cover"
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCoverDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCover}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
