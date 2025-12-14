import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical, Undo, Redo, Smartphone, Monitor, PanelLeftClose, PanelLeftOpen, Globe, Copy, Check, Save, Upload, Loader2, ArrowLeft, Image, GitBranch, Layers, Palette, Users, Webhook, BarChart3, Bell, Sun, Moon, LogOut, Settings, Sparkles, MessageSquare, Megaphone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Reorder } from 'framer-motion';
import { Quiz } from '@/types/quiz';
import { TemplateSelector } from './TemplateSelector';
import { ComponentPalette } from './ComponentPalette';
import { DropZone, DroppedComponent, ComponentConfig } from './DropZone';
import { ReadonlyDropZone } from './ReadonlyDropZone';
import { ComponentEditor } from './ComponentEditor';
import { DesignEditor, QuizDesignSettings, defaultDesignSettings } from './DesignEditor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { screenTemplates } from '@/data/screenTemplates';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas, FlowAnalyticsCanvas } from './flow';
import { StageBackgroundEditor, StageBackground, defaultStageBackground, getStageBackgroundCSS } from './StageBackgroundEditor';
import { QuizHeaderPreview } from './QuizHeaderPreview';
import { LeadsView } from './LeadsView';
import { IntegrationsEditor } from './IntegrationsEditor';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const editorNotifications = [
  {
    id: 1,
    type: 'update',
    title: 'Nova atualização disponível',
    description: 'Adicionamos novos templates de quiz e melhorias de performance.',
    time: 'Agora',
    unread: true,
  },
  {
    id: 2,
    type: 'response',
    title: '3 novas respostas',
    description: 'Seu quiz recebeu novas respostas.',
    time: '5 min atrás',
    unread: true,
  },
];

// Stage type - cada etapa contém seus próprios componentes
interface Stage {
  id: string;
  name: string;
  components: DroppedComponent[];
  position?: { x: number; y: number };
  connections?: { targetId: string; sourceHandle?: string }[];
  background?: StageBackground;
}

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, setCurrentQuiz, addQuiz, updateQuiz } = useQuizStore();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [rightTab, setRightTab] = useState<'stage' | 'appearance'>('stage');
  const [widgetsExpanded, setWidgetsExpanded] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const [editorView, setEditorView] = useState<'editor' | 'flow' | 'design' | 'leads' | 'integrations'>('editor');
  const [flowMode, setFlowMode] = useState<'edit' | 'analytics'>('edit');
  
  // Webhook settings
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSettings, setWebhookSettings] = useState<{
    sendName?: boolean;
    sendEmail?: boolean;
    sendPhone?: boolean;
    customFieldIds?: string;
    triggerOnFirstResponse?: boolean;
  }>({});
  
  // Design settings
  const [designSettings, setDesignSettings] = useState<QuizDesignSettings>(defaultDesignSettings);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  // Stages management
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<DroppedComponent | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Page settings
  const [pageSettings, setPageSettings] = useState({
    showLogo: true,
    showProgress: true,
    allowBack: true,
    logoUrl: '',
    logoSize: '32' as string,
  });
  const [logoInputMode, setLogoInputMode] = useState<'image' | 'url'>('url');
  
  // Delete stage dialog
  const [deleteStageDialogOpen, setDeleteStageDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  // Get current stage
  const currentStage = stages.find(s => s.id === selectedStageId);
  const currentComponents = currentStage?.components || [];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // Ignore errors
    }
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const handleCopyUrl = () => {
    if (currentQuiz?.slug) {
      const url = `${window.location.origin}/${currentQuiz.slug}`;
      navigator.clipboard.writeText(url);
      setSlugCopied(true);
      setTimeout(() => setSlugCopied(false), 2000);
    }
  };

  // Load quiz and stages
  useEffect(() => {
    const loadQuiz = async () => {
      if (id === 'new') {
        const newId = crypto.randomUUID();
        const newQuiz: Quiz = {
          id: newId,
          name: 'Novo Quiz',
          description: '',
          screens: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isPublished: false,
        };
        addQuiz(newQuiz);
        setCurrentQuiz(newQuiz);
        setStages([]);
        setHasUnsavedChanges(false);
      } else {
        // Load from Supabase
        const { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (quizData) {
          const quiz: Quiz = {
            id: quizData.id,
            name: quizData.titulo,
            description: quizData.descricao || '',
            slug: quizData.slug || undefined,
            screens: [],
            createdAt: new Date(quizData.criado_em || ''),
            updatedAt: new Date(quizData.atualizado_em || ''),
            isPublished: quizData.is_active || false,
          };
          setCurrentQuiz(quiz);
          
          // Load webhook settings
          setWebhookUrl((quizData as any).webhook_url || '');
          setWebhookEnabled((quizData as any).webhook_enabled || false);
          setWebhookSettings((quizData as any).webhook_settings || {});
          
          // Load thumbnail
          setThumbnailUrl((quizData as any).thumbnail_url || '');

          // Load etapas (stages)
          const { data: etapasData } = await supabase
            .from('etapas')
            .select('*')
            .eq('quiz_id', id)
            .order('ordem', { ascending: true });

          if (etapasData && etapasData.length > 0) {
            const loadedStages: Stage[] = etapasData.map((etapa) => {
              const config = etapa.configuracoes as Record<string, any> || {};
              const components = config.components || [];
              console.log(`Loading stage ${etapa.titulo}:`, {
                position: config.position,
                connections: config.connections,
              });
              return {
                id: etapa.id,
                name: etapa.titulo || 'Nova etapa',
                components: components as DroppedComponent[],
                position: config.position,
                connections: config.connections || [],
                background: config.background,
              };
            });
            console.log('Loaded stages with connections:', loadedStages.map(s => ({ name: s.name, connections: s.connections })));
            setStages(loadedStages);
            // Select first stage by default
            if (loadedStages.length > 0) {
              setSelectedStageId(loadedStages[0].id);
            }
            
            // Load designSettings and pageSettings from first stage
            const firstEtapa = etapasData[0];
            const firstConfig = firstEtapa.configuracoes as Record<string, any> || {};
            if (firstConfig.designSettings) {
              setDesignSettings({ ...defaultDesignSettings, ...firstConfig.designSettings });
            }
            if (firstConfig.pageSettings) {
              setPageSettings(prev => ({ ...prev, ...firstConfig.pageSettings }));
            }
          }
          setHasUnsavedChanges(false);
        }
      }
      setIsInitialLoad(false);
    };

    loadQuiz();
  }, [id]);

  // Add new stage
  const handleAddStage = () => {
    const newStage: Stage = {
      id: crypto.randomUUID(),
      name: 'Nova etapa',
      components: [],
    };
    setStages(prev => [...prev, newStage]);
    setSelectedStageId(newStage.id);
    setHasUnsavedChanges(true);
  };

  // Delete stage - open dialog
  const handleDeleteStageClick = (stageId: string) => {
    setStageToDelete(stageId);
    setDeleteStageDialogOpen(true);
  };

  // Confirm delete stage
  const handleDeleteStageConfirm = () => {
    if (!stageToDelete) return;
    
    setStages(prev => prev.filter(s => s.id !== stageToDelete));
    if (selectedStageId === stageToDelete) {
      setSelectedStageId(stages.length > 1 ? stages[0].id : null);
    }
    setHasUnsavedChanges(true);
    setDeleteStageDialogOpen(false);
    setStageToDelete(null);
  };

  // Reorder stages
  const handleReorderStages = (newStages: Stage[]) => {
    setStages(newStages);
    setHasUnsavedChanges(true);
  };

  // Update stage name
  const handleUpdateStageName = (stageId: string, name: string) => {
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, name } : s));
    setHasUnsavedChanges(true);
  };

  // Update components of current stage
  const updateCurrentStageComponents = useCallback((components: DroppedComponent[]) => {
    if (!selectedStageId) return;
    setStages(prev => prev.map(s => 
      s.id === selectedStageId ? { ...s, components } : s
    ));
    setHasUnsavedChanges(true);
  }, [selectedStageId]);

  // Save quiz and stages to Supabase
  const handleSave = async () => {
    if (!currentQuiz) return;
    
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para salvar');
        return;
      }

      // Check if quiz exists
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('id', currentQuiz.id)
        .maybeSingle();

      if (existingQuiz) {
        await supabase
          .from('quizzes')
          .update({
            titulo: currentQuiz.name,
            descricao: currentQuiz.description || null,
            slug: currentQuiz.slug || null,
            atualizado_em: new Date().toISOString(),
            webhook_url: webhookUrl || null,
            webhook_enabled: webhookEnabled,
            thumbnail_url: thumbnailUrl || null,
          })
          .eq('id', currentQuiz.id);
      } else {
        await supabase
          .from('quizzes')
          .insert({
            id: currentQuiz.id,
            titulo: currentQuiz.name,
            descricao: currentQuiz.description || null,
            slug: currentQuiz.slug || null,
            criado_por: user.id,
            is_active: false,
          });
      }

      // Delete existing etapas
      await supabase
        .from('etapas')
        .delete()
        .eq('quiz_id', currentQuiz.id);

      // Insert stages
      if (stages.length > 0) {
        const etapas = stages.map((stage, index) => {
          console.log(`Stage ${stage.name} connections:`, stage.connections);
          return {
            id: stage.id,
            quiz_id: currentQuiz.id,
            tipo: 'stage',
            titulo: stage.name,
            ordem: index,
            configuracoes: JSON.parse(JSON.stringify({
              components: stage.components,
              pageSettings: pageSettings,
              position: stage.position,
              connections: stage.connections || [],
              background: stage.background,
              // Save designSettings only on first stage
              ...(index === 0 ? { designSettings } : {}),
            })),
          };
        });

        console.log('Saving etapas with configurations:', etapas.map(e => ({ 
          id: e.id, 
          titulo: e.titulo, 
          connections: e.configuracoes.connections 
        })));

        const { error: etapasError } = await supabase
          .from('etapas')
          .insert(etapas);

        if (etapasError) throw etapasError;
      }

      setHasUnsavedChanges(false);
      toast.success('Quiz salvo com sucesso!');
    } catch (error: any) {
      console.error('Error saving quiz:', error);
      toast.error('Erro ao salvar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish quiz
  const handlePublish = async () => {
    if (!currentQuiz) return;
    
    if (hasUnsavedChanges) {
      toast.error('Salve as alterações antes de publicar');
      return;
    }

    setIsPublishing(true);
    try {
      await supabase
        .from('quizzes')
        .update({ is_active: true, atualizado_em: new Date().toISOString() })
        .eq('id', currentQuiz.id);

      updateQuiz(currentQuiz.id, { isPublished: true });
      toast.success('Quiz publicado com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao publicar: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Track unsaved changes
  useEffect(() => {
    if (isInitialLoad) return;
    setHasUnsavedChanges(true);
  }, [stages, currentQuiz?.name, currentQuiz?.slug, currentQuiz?.description, pageSettings]);

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
      </div>
    );
  }

  // Calculate progress for preview
  const currentStageIndex = stages.findIndex(s => s.id === selectedStageId);
  const progressValue = stages.length > 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      {/* Global Header */}
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
        {/* Left: Logo & Quiz Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link 
            to="/admin"
            className="flex items-center gap-2 group shrink-0"
          >
            <Logo className="h-6" />
          </Link>
          <span className="text-muted-foreground/50">/</span>
          <Input
            value={currentQuiz.name}
            onChange={(e) => {
              const newName = e.target.value;
              const updates: Partial<Quiz> = { name: newName };
              if (!currentQuiz.slug) {
                updates.slug = generateSlug(newName);
              }
              updateQuiz(currentQuiz.id, updates);
            }}
            className="font-medium border-none bg-transparent px-1 h-auto text-sm focus-visible:ring-0 shadow-none w-auto max-w-[180px]"
            placeholder="Nome do quiz"
          />
        </div>

        {/* Center: Navigation Tabs */}
        <nav className="flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          <button
            onClick={() => setEditorView('editor')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
              editorView === 'editor' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            Construtor
            {editorView === 'editor' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setEditorView('flow')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
              editorView === 'flow' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GitBranch className="w-4 h-4" />
            Fluxo
            {editorView === 'flow' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setEditorView('design')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
              editorView === 'design' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Palette className="w-4 h-4" />
            Design
            {editorView === 'design' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setEditorView('leads')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
              editorView === 'leads' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="w-4 h-4" />
            Leads
            {editorView === 'leads' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setEditorView('integrations')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors relative",
              editorView === 'integrations' 
                ? "text-foreground" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Webhook className="w-4 h-4" />
            Integrações
            {editorView === 'integrations' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => currentQuiz.slug && navigate(`/${currentQuiz.slug}`)}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          {/* URL Slug */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <Input
              value={currentQuiz.slug || ''}
              onChange={(e) => updateQuiz(currentQuiz.id, { slug: generateSlug(e.target.value) })}
              className="text-xs border-none bg-transparent px-0 h-auto focus-visible:ring-0 shadow-none text-muted-foreground w-[100px]"
              placeholder="url-do-quiz"
            />
            {currentQuiz.slug && (
              <button
                onClick={handleCopyUrl}
                className="p-0.5 hover:text-foreground transition-colors shrink-0"
                title="Copiar URL"
              >
                {slugCopied ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {hasUnsavedChanges ? 'Salvar*' : 'Salvar'}
          </Button>
          <Button 
            size="sm"
            onClick={handlePublish}
            disabled={isPublishing || hasUnsavedChanges}
            className="gap-2"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Publicar
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
      {/* Left Sidebar - Stages (hidden in flow view) */}
      {editorView === 'editor' && (
      <div className="flex shrink-0">
        <div className="w-72 bg-background border-r border-border flex flex-col">
          {/* Add Stage Buttons */}
          <div className="p-4">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={handleAddStage}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Em branco
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => setShowTemplates(true)}
              >
                Modelos
              </Button>
            </div>
          </div>

          {/* Stages List */}
          <div className="flex-1 overflow-y-auto px-2">
            {stages.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="border border-dashed border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">Nenhuma etapa criada</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique em "Em branco" ou "Modelos"</p>
                </div>
              </div>
            ) : (
              <Reorder.Group axis="y" values={stages} onReorder={handleReorderStages} className="p-2">
                {stages.map((stage, index) => (
                  <Reorder.Item key={stage.id} value={stage}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors group mb-1",
                        selectedStageId === stage.id
                          ? "bg-muted border border-border"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => {
                        setSelectedStageId(stage.id);
                        setSelectedComponent(null);
                      }}
                    >
                      <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}</span>
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0" />
                      <Input
                        value={stage.name}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateStageName(stage.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 text-sm border-none bg-transparent px-0 h-auto focus-visible:ring-0 shadow-none truncate"
                        placeholder="Nome da etapa"
                      />
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-destructive transition-opacity shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStageClick(stage.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* User section at bottom */}
          <div className="px-3 py-3 border-t border-border flex items-center gap-2 shrink-0">
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 shrink-0"
                >
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-foreground text-background font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-muted-foreground leading-none">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme toggle */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme} 
                  className="h-9 w-9 shrink-0"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative shrink-0">
                  <Bell className="h-4 w-4" />
                  {editorNotifications.some(n => n.unread) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-80">
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4" />
                  Notificações
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {editorNotifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {notification.type === 'update' && <Sparkles className="h-4 w-4 text-primary" />}
                      {notification.type === 'response' && <MessageSquare className="h-4 w-4 text-primary" />}
                      <span className="font-medium text-sm flex-1">{notification.title}</span>
                      {notification.unread && (
                        <span className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">{notification.description}</p>
                    <span className="text-xs text-muted-foreground/70 pl-6">{notification.time}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>

        {/* Widgets Palette - Toggle (shown in sub-header when closed) */}
        
        {/* Widgets Palette - Expanded */}
        {widgetsExpanded && (
          <div 
            className="w-64 border-r border-border bg-background flex flex-col overflow-hidden animate-fade-in"
          >
            {/* Toggle Button */}
            <div className="p-3 flex items-center justify-between shrink-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Componentes</span>
              <button
                onClick={() => setWidgetsExpanded(false)}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Component Palette */}
            <div className="flex-1 overflow-y-auto p-3">
              <ComponentPalette />
            </div>
          </div>
        )}
      </div>
      )}

      {/* Preview Area */}
      <div className="flex-1 flex flex-col bg-muted/30 overflow-hidden">
        {/* Preview Content */}
        {editorView === 'flow' ? (
          <div className="flex-1 overflow-hidden relative">
            {/* Flow Mode Toggle */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setFlowMode('edit')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  flowMode === 'edit' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Editar
              </button>
              <button
                onClick={() => setFlowMode('analytics')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  flowMode === 'analytics' 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <BarChart3 className="w-3 h-3" />
                Analytics
              </button>
            </div>
            
            {flowMode === 'edit' ? (
              <FlowCanvas
                stages={stages}
                selectedStageId={selectedStageId}
                onSelectStage={(stageId) => {
                  setSelectedStageId(stageId);
                  setSelectedComponent(null);
                  setEditorView('editor');
                }}
                onStagesChange={(updatedStages) => {
                  setStages(updatedStages);
                  setHasUnsavedChanges(true);
                }}
              />
            ) : (
              <FlowAnalyticsCanvas
                quizId={currentQuiz.id}
                stages={stages}
                selectedStageId={selectedStageId}
                onSelectStage={(stageId) => {
                  setSelectedStageId(stageId);
                  setSelectedComponent(null);
                }}
              />
            )}
          </div>
        ) : editorView === 'design' ? (
          /* Design View - Exact same structure as constructor for each stage */
          <div className="flex-1 flex flex-col items-center p-6 overflow-y-auto gap-6">
            {stages.length === 0 ? (
              <div 
                className={cn(
                  "bg-background rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col",
                  "w-[375px] h-[667px]"
                )}
              >
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Nenhuma etapa criada</p>
                </div>
              </div>
            ) : (
              stages.map((stage, index) => {
                // Helper functions for design settings
                const getSpacingClass = () => {
                  switch (designSettings.spacing) {
                    case 'compact': return 'gap-1';
                    case 'spacious': return 'gap-4';
                    default: return 'gap-2';
                  }
                };
                
                const getBorderRadiusClass = () => {
                  switch (designSettings.borderRadius) {
                    case 'none': return 'rounded-none';
                    case 'small': return 'rounded-md';
                    case 'large': return 'rounded-2xl';
                    case 'full': return 'rounded-3xl';
                    default: return 'rounded-xl';
                  }
                };

                const getAlignmentClass = () => {
                  switch (designSettings.alignment) {
                    case 'left': return 'items-start text-left';
                    case 'right': return 'items-end text-right';
                    default: return 'items-center text-center';
                  }
                };

                return (
                  <div 
                    key={stage.id}
                    onClick={() => {
                      setSelectedStageId(stage.id);
                      setEditorView('editor');
                    }}
                    className={cn(
                      "overflow-hidden flex flex-col cursor-pointer transition-all hover:shadow-xl shrink-0 shadow-lg border border-border",
                      getBorderRadiusClass()
                    )}
                    style={{ 
                      width: '375px', 
                      height: '667px',
                      backgroundColor: designSettings.backgroundColor,
                      color: designSettings.textColor,
                      fontFamily: designSettings.bodyFont || 'Inter',
                      fontSize: `${designSettings.fontSize}px`,
                    }}
                  >
                    {/* Quiz Header with design settings */}
                    <QuizHeaderPreview
                      designSettings={designSettings}
                      pageSettings={pageSettings}
                      progressValue={((index + 1) / stages.length) * 100}
                      currentStageIndex={index}
                      totalStages={stages.length}
                      position="top"
                    />
                    
                    {/* Stage Components with design settings applied */}
                    <div 
                      className={cn(
                        "flex-1 min-h-0 overflow-y-auto pointer-events-none design-preview-mode quiz-content",
                        getAlignmentClass(),
                        getSpacingClass()
                      )}
                      style={{
                        '--quiz-primary-color': designSettings.primaryColor,
                        '--quiz-text-color': designSettings.textColor,
                        '--quiz-title-color': designSettings.titleColor,
                        '--quiz-bg-color': designSettings.backgroundColor,
                        '--quiz-title-font': designSettings.titleFont || 'Montserrat',
                        '--quiz-body-font': designSettings.bodyFont || 'Inter',
                      } as React.CSSProperties}
                    >
                      <DropZone 
                        components={stage.components}
                        onComponentsChange={() => {}}
                        selectedComponentId={null}
                        onSelectComponent={() => {}}
                      />
                    </div>

                    {/* Bottom progress bar */}
                    <QuizHeaderPreview
                      designSettings={designSettings}
                      pageSettings={pageSettings}
                      progressValue={((index + 1) / stages.length) * 100}
                      currentStageIndex={index}
                      totalStages={stages.length}
                      position="bottom"
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : editorView === 'leads' ? (
          /* Leads View */
          <LeadsView 
            quizId={currentQuiz.id} 
            stages={stages.map(s => ({ id: s.id, name: s.name }))}
          />
        ) : editorView === 'integrations' ? (
          /* Integrations View */
          <IntegrationsEditor quizId={currentQuiz.id} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50">
              {/* Left: Component palette toggle */}
              {!widgetsExpanded ? (
                <button
                  onClick={() => setWidgetsExpanded(true)}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                  title="Abrir paleta de componentes"
                >
                  <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
                </button>
              ) : (
                <div className="w-7" />
              )}
              
              {/* Center: Device toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === 'mobile' ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={cn(
                    "p-1.5 rounded transition-colors",
                    previewMode === 'desktop' ? "bg-background shadow-sm" : "hover:bg-background/50"
                  )}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
              
              {/* Right: Spacer for balance */}
              <div className="w-7" />
            </div>
            
            <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
              {(() => {
                const stageBackgroundCSS = getStageBackgroundCSS(currentStage?.background);
                return (
                  <div 
                    className={cn(
                      "rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col relative quiz-content",
                      previewMode === 'mobile' 
                        ? "w-[375px] h-[667px]" 
                        : "w-full max-w-4xl h-[640px]"
                    )}
                    style={{
                      backgroundColor: currentStage?.background ? undefined : designSettings.backgroundColor,
                      color: designSettings.textColor,
                      fontFamily: designSettings.bodyFont || 'Inter',
                      fontSize: `${designSettings.fontSize}px`,
                      '--quiz-title-font': designSettings.titleFont || 'Montserrat',
                      '--quiz-body-font': designSettings.bodyFont || 'Inter',
                      '--quiz-title-color': designSettings.titleColor,
                      '--quiz-text-color': designSettings.textColor,
                      ...stageBackgroundCSS.backgroundStyle,
                    } as React.CSSProperties}
                  >
                    {/* Stage background overlay */}
                    {stageBackgroundCSS.overlayStyle && (
                      <div style={stageBackgroundCSS.overlayStyle} />
                    )}
                {/* Quiz Header Preview - using design settings */}
                <QuizHeaderPreview
                  designSettings={designSettings}
                  pageSettings={pageSettings}
                  progressValue={progressValue}
                  currentStageIndex={selectedStageId ? stages.findIndex(s => s.id === selectedStageId) : 0}
                  totalStages={stages.length}
                  position="top"
                />
                
                {/* Drop Zone - shows components for current stage */}
                {selectedStageId ? (
                  <DropZone 
                    components={currentComponents}
                    onComponentsChange={updateCurrentStageComponents}
                    selectedComponentId={selectedComponent?.id}
                    onSelectComponent={setSelectedComponent}
                    designSettings={designSettings}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p style={{ color: designSettings.textColor, opacity: 0.6 }} className="text-sm">
                      Selecione uma etapa para editar
                    </p>
                  </div>
                )}

                {/* Bottom progress bar */}
                <QuizHeaderPreview
                  designSettings={designSettings}
                  pageSettings={pageSettings}
                  progressValue={progressValue}
                  currentStageIndex={selectedStageId ? stages.findIndex(s => s.id === selectedStageId) : 0}
                  totalStages={stages.length}
                  position="bottom"
                />
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
      {/* Right Sidebar - Editor or Design */}
      {editorView === 'editor' && (
      <div className="w-96 bg-background border-l border-border flex flex-col shrink-0 overflow-hidden">
        {selectedComponent ? (
          <ComponentEditor 
            component={selectedComponent}
            themeColor={designSettings.primaryColor}
            onUpdate={(config) => {
              const updatedComponents = currentComponents.map(c => 
                c.id === selectedComponent.id ? { ...c, config } : c
              );
              updateCurrentStageComponents(updatedComponents);
              setSelectedComponent(prev => prev ? { ...prev, config } : null);
            }}
            onUpdateCustomId={(customId) => {
              const updatedComponents = currentComponents.map(c => 
                c.id === selectedComponent.id ? { ...c, customId } : c
              );
              updateCurrentStageComponents(updatedComponents);
              setSelectedComponent(prev => prev ? { ...prev, customId } : null);
            }}
            onDelete={() => {
              const updatedComponents = currentComponents.filter(c => c.id !== selectedComponent.id);
              updateCurrentStageComponents(updatedComponents);
              setSelectedComponent(null);
            }}
          />
        ) : (
          <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'stage' | 'appearance')} className="flex flex-col h-full">
            <TabsList className="grid grid-cols-2 m-4 mb-0">
              <TabsTrigger value="stage">Etapa</TabsTrigger>
              <TabsTrigger value="appearance">Aparência</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stage" className="flex-1 overflow-y-auto p-4 mt-0">
              {selectedStageId ? (
                <div className="space-y-6">
                  {/* Stage Background Editor */}
                  <div className="border border-border rounded-lg p-4">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Fundo da Etapa</Label>
                    <StageBackgroundEditor
                      background={currentStage?.background || defaultStageBackground}
                      onChange={(background) => {
                        setStages(prev => prev.map(s => 
                          s.id === selectedStageId ? { ...s, background } : s
                        ));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Selecione uma etapa</p>
                  <p className="text-xs text-muted-foreground mt-1">para editar o fundo</p>
                </div>
              )}
            </TabsContent>
          
            <TabsContent value="appearance" className="flex-1 overflow-y-auto p-4 mt-0">
              <div className="space-y-6">
                {/* Logo Settings */}
                <div className="border border-border rounded-lg p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Logo</Label>
                  <div className="space-y-4">
                    {/* Tabs Imagem/URL */}
                    <div className="flex border border-border rounded-lg overflow-hidden">
                      <button 
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${logoInputMode === 'image' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                        onClick={() => setLogoInputMode('image')}
                      >
                        <Image className="w-4 h-4 inline-block mr-1" />
                        Imagem
                      </button>
                      <button 
                        className={`flex-1 py-2 px-3 text-sm font-medium transition-colors ${logoInputMode === 'url' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                        onClick={() => setLogoInputMode('url')}
                      >
                        URL
                      </button>
                    </div>
                    
                    {logoInputMode === 'url' ? (
                      <Input 
                        placeholder="https://exemplo.com/logo.png"
                        value={pageSettings.logoUrl}
                        onChange={(e) => setPageSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                      />
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          id="logo-upload"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setPageSettings(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          {pageSettings.logoUrl ? (
                            <img src={pageSettings.logoUrl} alt="Logo preview" className="max-h-12 mx-auto" />
                          ) : (
                            <span className="text-sm text-muted-foreground">Selecionar imagem</span>
                          )}
                        </label>
                      </div>
                    )}
                    
                    {/* Size selector */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm shrink-0">Tamanho:</Label>
                      <Select 
                        value={pageSettings.logoSize} 
                        onValueChange={(value) => setPageSettings(prev => ({ ...prev, logoSize: value }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">Pequeno (24px)</SelectItem>
                          <SelectItem value="32">Médio (32px)</SelectItem>
                          <SelectItem value="40">Grande (40px)</SelectItem>
                          <SelectItem value="48">Extra grande (48px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Header Settings */}
                <div className="border border-border rounded-lg p-4">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Header</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mostrar logo</span>
                      <Switch 
                        checked={pageSettings.showLogo}
                        onCheckedChange={(checked) => setPageSettings(prev => ({ ...prev, showLogo: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mostrar progresso</span>
                      <Switch 
                        checked={pageSettings.showProgress}
                        onCheckedChange={(checked) => setPageSettings(prev => ({ ...prev, showProgress: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permitir voltar</span>
                      <Switch 
                        checked={pageSettings.allowBack}
                        onCheckedChange={(checked) => setPageSettings(prev => ({ ...prev, allowBack: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      )}
      
      {/* Design Editor Sidebar */}
      {editorView === 'design' && (
        <div className="w-80 bg-background border-l border-border flex flex-col shrink-0 overflow-hidden">
          <DesignEditor 
            settings={designSettings}
            onSettingsChange={(newSettings) => {
              setDesignSettings(newSettings);
              setHasUnsavedChanges(true);
            }}
          />
        </div>
      )}
      </div> {/* End Main Content Area */}

      {/* Template Modal */}
      {showTemplates && (
        <TemplateSelector 
          onSelect={(template) => {
            const newStage: Stage = {
              id: crypto.randomUUID(),
              name: template.name || 'Nova etapa',
              components: [],
            };
            setStages(prev => [...prev, newStage]);
            setSelectedStageId(newStage.id);
            setShowTemplates(false);
            setHasUnsavedChanges(true);
          }}
          onClose={() => setShowTemplates(false)}
        />
      )}

      <ConfirmDialog
        open={deleteStageDialogOpen}
        onOpenChange={setDeleteStageDialogOpen}
        title="Excluir etapa"
        description="Tem certeza que deseja excluir esta etapa? Todos os componentes serão removidos."
        confirmText="Excluir"
        onConfirm={handleDeleteStageConfirm}
        variant="destructive"
      />
    </div>
  );
}
