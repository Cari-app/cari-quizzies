import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical, Undo, Redo, Smartphone, Monitor, PanelLeftClose, PanelLeftOpen, Globe, Copy, Check, Save, Upload, Loader2, ArrowLeft, Image, GitBranch, Layers, Palette } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Reorder } from 'framer-motion';
import { Quiz } from '@/types/quiz';
import { TemplateSelector } from './TemplateSelector';
import { ComponentPalette } from './ComponentPalette';
import { DropZone, DroppedComponent, ComponentConfig } from './DropZone';
import { ComponentEditor } from './ComponentEditor';
import { DesignEditor, QuizDesignSettings, defaultDesignSettings } from './DesignEditor';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { screenTemplates } from '@/data/screenTemplates';
import { supabase } from '@/integrations/supabase/client';
import { FlowCanvas } from './flow';

// Stage type - cada etapa contém seus próprios componentes
interface Stage {
  id: string;
  name: string;
  components: DroppedComponent[];
  position?: { x: number; y: number };
  connections?: { targetId: string; sourceHandle?: string }[];
}

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, setCurrentQuiz, addQuiz, updateQuiz } = useQuizStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [rightTab, setRightTab] = useState<'stage' | 'appearance'>('stage');
  const [widgetsExpanded, setWidgetsExpanded] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const [editorView, setEditorView] = useState<'editor' | 'flow' | 'design'>('editor');
  
  // Design settings
  const [designSettings, setDesignSettings] = useState<QuizDesignSettings>(defaultDesignSettings);
  
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
              return {
                id: etapa.id,
                name: etapa.titulo || 'Nova etapa',
                components: components as DroppedComponent[],
              };
            });
            setStages(loadedStages);
            // Select first stage by default
            if (loadedStages.length > 0) {
              setSelectedStageId(loadedStages[0].id);
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
        const etapas = stages.map((stage, index) => ({
          id: stage.id,
          quiz_id: currentQuiz.id,
          tipo: 'stage',
          titulo: stage.name,
          ordem: index,
          configuracoes: JSON.parse(JSON.stringify({
            components: stage.components,
            pageSettings: pageSettings,
          })),
        }));

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
          <div className="flex-1 overflow-hidden">
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
          </div>
        ) : editorView === 'design' ? (
          /* Design View - Full width preview with settings on right */
          <div className="flex-1 flex items-start justify-center p-8 overflow-y-auto">
            <div 
              className={cn(
                "bg-background rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col",
                "w-[375px] h-[667px]"
              )}
              style={{
                backgroundColor: designSettings.backgroundColor,
                fontFamily: designSettings.primaryFont,
                fontSize: `${designSettings.fontSize}px`,
              }}
            >
              {/* Quiz Header Preview with design settings */}
              <div 
                className="shrink-0 p-3"
                style={{
                  display: designSettings.progressBar === 'hidden' && !designSettings.logo.value ? 'none' : 'block',
                }}
              >
                <div className={cn(
                  "flex items-center gap-3",
                  designSettings.logoPosition === 'center' && "justify-center",
                  designSettings.logoPosition === 'right' && "justify-end"
                )}>
                  {designSettings.logo.value && (
                    designSettings.logo.type === 'emoji' ? (
                      <span 
                        className={cn(
                          designSettings.logoSize === 'small' && 'text-xl',
                          designSettings.logoSize === 'medium' && 'text-2xl',
                          designSettings.logoSize === 'large' && 'text-4xl',
                        )}
                      >
                        {designSettings.logo.value}
                      </span>
                    ) : (
                      <img 
                        src={designSettings.logo.value} 
                        alt="Logo" 
                        className={cn(
                          "object-contain",
                          designSettings.logoSize === 'small' && 'h-6',
                          designSettings.logoSize === 'medium' && 'h-8',
                          designSettings.logoSize === 'large' && 'h-12',
                        )}
                      />
                    )
                  )}
                </div>
                {designSettings.progressBar === 'top' && (
                  <div className="mt-3">
                    <Progress 
                      value={progressValue} 
                      className="h-1.5"
                      style={{ 
                        ['--progress-background' as string]: designSettings.primaryColor 
                      }}
                    />
                  </div>
                )}
              </div>
              
              {/* Content Preview */}
              <div 
                className={cn(
                  "flex-1 flex flex-col p-6",
                  designSettings.alignment === 'center' && "items-center text-center",
                  designSettings.alignment === 'right' && "items-end text-right",
                )}
                style={{ color: designSettings.textColor }}
              >
                <h2 
                  className={cn(
                    "font-bold mb-4",
                    designSettings.titleSize === 'small' && 'text-xl',
                    designSettings.titleSize === 'medium' && 'text-2xl',
                    designSettings.titleSize === 'large' && 'text-3xl',
                    designSettings.titleSize === 'xlarge' && 'text-4xl',
                  )}
                  style={{ 
                    color: designSettings.titleColor,
                    fontFamily: designSettings.primaryFont,
                  }}
                >
                  Título de exemplo
                </h2>
                <p 
                  className="mb-6 opacity-80"
                  style={{ fontFamily: designSettings.secondaryFont }}
                >
                  Este é um texto de exemplo para visualizar as configurações de design do seu quiz.
                </p>
                <button
                  className={cn(
                    "w-full py-3 px-6 font-medium text-white transition-colors",
                    designSettings.borderRadius === 'none' && 'rounded-none',
                    designSettings.borderRadius === 'small' && 'rounded',
                    designSettings.borderRadius === 'medium' && 'rounded-lg',
                    designSettings.borderRadius === 'large' && 'rounded-xl',
                    designSettings.borderRadius === 'full' && 'rounded-full',
                  )}
                  style={{ backgroundColor: designSettings.primaryColor }}
                >
                  Botão de exemplo
                </button>
              </div>

              {designSettings.progressBar === 'bottom' && (
                <div className="px-3 pb-3">
                  <Progress 
                    value={progressValue} 
                    className="h-1.5"
                  />
                </div>
              )}
            </div>
          </div>
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
              <div 
                className={cn(
                  "bg-background rounded-2xl shadow-lg border border-border overflow-hidden flex flex-col",
                  previewMode === 'mobile' 
                    ? "w-[375px] h-[667px]" 
                    : "w-full max-w-4xl h-[640px]"
                )}
              >
                {/* Quiz Header Preview */}
                <div className="shrink-0 border-b border-border p-3">
                  <div className="flex items-center gap-3">
                    {pageSettings.allowBack && (
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                    )}
                  {pageSettings.showLogo && pageSettings.logoUrl && (
                    <img 
                      src={pageSettings.logoUrl} 
                      alt="Logo" 
                      className="object-contain" 
                      style={{ height: `${pageSettings.logoSize}px` }}
                    />
                  )}
                  {pageSettings.showProgress && (
                    <div className="flex-1">
                      <Progress value={progressValue} className="h-1.5" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Drop Zone - shows components for current stage */}
              {selectedStageId ? (
                <DropZone 
                  components={currentComponents}
                  onComponentsChange={updateCurrentStageComponents}
                  selectedComponentId={selectedComponent?.id}
                  onSelectComponent={setSelectedComponent}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Selecione uma etapa para editar</p>
                </div>
              )}
            </div>
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
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Selecione um componente</p>
                <p className="text-xs text-muted-foreground mt-1">ou arraste da paleta</p>
              </div>
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
