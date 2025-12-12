import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical, Undo, Redo, Smartphone, Monitor, PanelLeftClose, PanelLeftOpen, Globe, Copy, Check, Save, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Reorder } from 'framer-motion';
import { Quiz, QuizScreen, QuizScreenType } from '@/types/quiz';
import { ScreenEditor } from './ScreenEditor';
import { ScreenPreview } from './ScreenPreview';
import { TemplateSelector } from './TemplateSelector';
import { ComponentPalette } from './ComponentPalette';
import { DropZone, DroppedComponent, ComponentConfig } from './DropZone';
import { ComponentEditor } from './ComponentEditor';
import { cn } from '@/lib/utils';
import { screenTemplates } from '@/data/screenTemplates';
import { supabase } from '@/integrations/supabase/client';

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quizzes, currentQuiz, setCurrentQuiz, addQuiz, updateQuiz, addScreen, deleteScreen, reorderScreens, setEditingScreen, editingScreen, startSession, updateScreen } = useQuizStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [rightTab, setRightTab] = useState<'stage' | 'appearance'>('stage');
  const [widgetsExpanded, setWidgetsExpanded] = useState(false);
  const [slugCopied, setSlugCopied] = useState(false);
  const [droppedComponents, setDroppedComponents] = useState<DroppedComponent[]>([]);
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
  });

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

  useEffect(() => {
    const loadQuiz = async () => {
      if (id === 'new') {
        // Generate a proper UUID for new quizzes
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
        setHasUnsavedChanges(false);
      } else {
        // Try to load from Supabase first
        const { data: quizData, error } = await supabase
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

          // Load etapas (components)
          const { data: etapasData } = await supabase
            .from('etapas')
            .select('*')
            .eq('quiz_id', id)
            .order('ordem', { ascending: true });

          if (etapasData && etapasData.length > 0) {
            const components: DroppedComponent[] = etapasData.map((etapa) => {
              const config = etapa.configuracoes as Record<string, any> || {};
              return {
                id: etapa.id,
                type: etapa.tipo,
                name: config.componentName || etapa.titulo || etapa.tipo,
                icon: config.icon || '📦',
                customId: config.customId,
                config: {
                  label: etapa.titulo,
                  helpText: etapa.subtitulo,
                  buttonText: etapa.texto_botao,
                  options: etapa.opcoes as any,
                  ...config,
                },
              };
            });
            setDroppedComponents(components);
          }
          setHasUnsavedChanges(false);
        } else {
          // Fallback to local store
          const quiz = quizzes.find(q => q.id === id);
          if (quiz) {
            setCurrentQuiz(quiz);
          }
        }
      }
    };

    loadQuiz();
  }, [id]);

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
      </div>
    );
  }

  const handleAddFromTemplate = (template: typeof screenTemplates[0]) => {
    const newScreen: QuizScreen = {
      id: Date.now().toString(),
      type: template.screen.type || 'info',
      title: template.screen.title || 'Nova tela',
      subtitle: template.screen.subtitle,
      options: template.screen.options,
      buttonText: template.screen.buttonText,
      sliderMin: template.screen.sliderMin,
      sliderMax: template.screen.sliderMax,
      sliderStep: template.screen.sliderStep,
      required: template.screen.required,
      showLogo: template.screen.showLogo ?? true,
      showProgress: template.screen.showProgress ?? true,
      allowBack: template.screen.allowBack ?? true,
      placeholder: template.screen.placeholder,
    };
    addScreen(currentQuiz.id, newScreen);
    setShowTemplates(false);
    setEditingScreen(newScreen);
  };

  const handleDeleteScreen = (screenId: string) => {
    if (confirm('Excluir esta etapa?')) {
      deleteScreen(currentQuiz.id, screenId);
    }
  };

  const handleReorder = (newOrder: QuizScreen[]) => {
    reorderScreens(currentQuiz.id, newOrder);
  };

  const handlePreview = () => {
    if (currentQuiz.slug) {
      navigate(`/${currentQuiz.slug}`);
    } else {
      startSession(currentQuiz.id);
      navigate(`/${currentQuiz.id}`);
    }
  };

  const handleSave = async () => {
    if (!currentQuiz) return;
    
    setIsSaving(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Você precisa estar logado para salvar');
        return;
      }

      // Check if quiz exists in database
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('id')
        .eq('id', currentQuiz.id)
        .maybeSingle();

      if (existingQuiz) {
        // Update existing quiz
        const { error: quizError } = await supabase
          .from('quizzes')
          .update({
            titulo: currentQuiz.name,
            descricao: currentQuiz.description || null,
            slug: currentQuiz.slug || null,
            atualizado_em: new Date().toISOString(),
          })
          .eq('id', currentQuiz.id);

        if (quizError) throw quizError;
      } else {
        // Create new quiz
        const { error: quizError } = await supabase
          .from('quizzes')
          .insert({
            id: currentQuiz.id,
            titulo: currentQuiz.name,
            descricao: currentQuiz.description || null,
            slug: currentQuiz.slug || null,
            criado_por: user.id,
            is_active: false,
          });

        if (quizError) throw quizError;
      }

      // Delete existing etapas for this quiz
      await supabase
        .from('etapas')
        .delete()
        .eq('quiz_id', currentQuiz.id);

      // Insert new etapas from droppedComponents
      if (droppedComponents.length > 0) {
        const etapas = droppedComponents.map((comp, index) => ({
          quiz_id: currentQuiz.id,
          tipo: comp.type,
          titulo: comp.config?.label || comp.name,
          subtitulo: comp.config?.helpText || null,
          texto_botao: comp.config?.buttonText || null,
          ordem: index,
          opcoes: comp.config?.options || null,
          configuracoes: {
            ...comp.config,
            customId: comp.customId,
            componentName: comp.name,
            icon: comp.icon,
          },
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

  const handlePublish = async () => {
    if (!currentQuiz) return;
    
    if (hasUnsavedChanges) {
      toast.error('Salve as alterações antes de publicar');
      return;
    }

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_active: true, atualizado_em: new Date().toISOString() })
        .eq('id', currentQuiz.id);

      if (error) throw error;

      updateQuiz(currentQuiz.id, { isPublished: true });
      toast.success('Quiz publicado com sucesso!');
    } catch (error: any) {
      console.error('Error publishing quiz:', error);
      toast.error('Erro ao publicar: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Track unsaved changes (skip initial render)
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    setHasUnsavedChanges(true);
  }, [droppedComponents, currentQuiz?.name, currentQuiz?.slug, currentQuiz?.description]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left Sidebar - Two columns */}
      <div className="flex shrink-0">
        {/* Steps Column */}
        <div className="w-72 bg-background border-r border-border flex flex-col">
          {/* Header with Logo */}
          <div className="px-4 py-4 flex items-center justify-between">
            <Link 
              to="/admin"
              className="inline-flex items-center gap-3 group"
            >
              <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <Logo className="h-5" />
            </Link>
          </div>

          {/* Quiz Name */}
          <div className="px-4 pb-4">
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
              className="font-semibold border-none bg-transparent px-0 h-auto text-base focus-visible:ring-0 shadow-none"
              placeholder="Nome do quiz"
            />
            
            {/* URL Slug */}
            <div className="mt-1 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                value={currentQuiz.slug || ''}
                onChange={(e) => updateQuiz(currentQuiz.id, { slug: generateSlug(e.target.value) })}
                className="text-xs border-none bg-transparent px-0 h-auto focus-visible:ring-0 shadow-none text-muted-foreground"
                placeholder="url-do-quiz"
              />
              {currentQuiz.slug && (
                <button
                  onClick={handleCopyUrl}
                  className="p-1 hover:bg-muted rounded transition-colors shrink-0"
                  title="Copiar URL"
                >
                  {slugCopied ? (
                    <Check className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Add Buttons */}
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1 h-9 text-xs"
                onClick={() => {
                  const newScreen: QuizScreen = {
                    id: Date.now().toString(),
                    type: 'info',
                    title: 'Nova etapa',
                    showLogo: true,
                    showProgress: true,
                    allowBack: true,
                  };
                  addScreen(currentQuiz.id, newScreen);
                  setEditingScreen(newScreen);
                }}
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

          {/* Steps List */}
          <div className="flex-1 overflow-y-auto px-2">
            {currentQuiz.screens.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="border border-dashed border-border rounded-lg p-6">
                  <p className="text-sm text-muted-foreground">Nenhuma etapa criada</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique em "Em branco" ou "Modelos"</p>
                </div>
              </div>
            ) : (
              <Reorder.Group axis="y" values={currentQuiz.screens} onReorder={handleReorder} className="p-2">
                {currentQuiz.screens.map((screen, index) => (
                  <Reorder.Item key={screen.id} value={screen}>
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 rounded-lg text-sm cursor-pointer transition-colors group mb-1",
                        editingScreen?.id === screen.id
                          ? "bg-muted border border-border"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setEditingScreen(screen)}
                    >
                      <span className="text-xs text-muted-foreground w-5 shrink-0">{index + 1}</span>
                      <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab shrink-0" />
                      <span className="flex-1 text-sm truncate" title={screen.title || 'Sem título'}>
                        {screen.title || 'Sem título'}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-destructive transition-opacity shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScreen(screen.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Toggle Widgets Button - Floating */}
          <div className="p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWidgetsExpanded(!widgetsExpanded)}
              className="w-full h-9 text-xs gap-2"
            >
              {widgetsExpanded ? (
                <>
                  <PanelLeftClose className="w-4 h-4" />
                  Fechar componentes
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4" />
                  Componentes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Widgets Column - Closes completely */}
        {widgetsExpanded && (
          <div className="w-52 bg-background border-r border-border flex flex-col">
            <div className="flex-1 overflow-y-auto p-3">
              <ComponentPalette expanded={true} />
            </div>
          </div>
        )}
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
          <div /> {/* Spacer */}
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <button
                className={cn(
                  "p-2 rounded-md transition-colors",
                  previewMode === 'mobile' ? "bg-muted" : "hover:bg-muted/50"
                )}
                onClick={() => setPreviewMode('mobile')}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                className={cn(
                  "p-2 rounded-md transition-colors",
                  previewMode === 'desktop' ? "bg-muted" : "hover:bg-muted/50"
                )}
                onClick={() => setPreviewMode('desktop')}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Undo className="w-4 h-4 text-muted-foreground" />
              </button>
              <button className="p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Redo className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <Button size="sm" variant="outline" onClick={handlePreview} className="gap-2">
              <Eye className="w-4 h-4" />
              Testar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleSave} 
              className="gap-2"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button 
              size="sm" 
              onClick={handlePublish} 
              className="gap-2"
              disabled={isPublishing || hasUnsavedChanges}
              title={hasUnsavedChanges ? 'Salve antes de publicar' : ''}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isPublishing ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-muted/30">
          <div 
            className={cn(
              "bg-background rounded-xl border border-border shadow-sm overflow-hidden transition-all flex flex-col",
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
                  <img src={pageSettings.logoUrl} alt="Logo" className="h-6 object-contain" />
                )}
                {pageSettings.showProgress && (
                  <div className="flex-1">
                    <Progress value={40} className="h-1.5" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Drop Zone */}
            <DropZone 
              components={droppedComponents}
              onComponentsChange={setDroppedComponents}
              selectedComponentId={selectedComponent?.id}
              onSelectComponent={setSelectedComponent}
            />
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-background border-l border-border flex flex-col shrink-0">
        <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'stage' | 'appearance')} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-2 m-4 mb-0">
            <TabsTrigger value="stage">Componente</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stage" className="flex-1 overflow-y-auto p-4 mt-0">
            {selectedComponent ? (
              <ComponentEditor 
                component={selectedComponent}
                onUpdate={(config) => {
                  setDroppedComponents(prev => 
                    prev.map(c => c.id === selectedComponent.id ? { ...c, config } : c)
                  );
                  setSelectedComponent(prev => prev ? { ...prev, config } : null);
                }}
                onUpdateCustomId={(customId) => {
                  setDroppedComponents(prev => 
                    prev.map(c => c.id === selectedComponent.id ? { ...c, customId } : c)
                  );
                  setSelectedComponent(prev => prev ? { ...prev, customId } : null);
                }}
                onDelete={() => {
                  setDroppedComponents(prev => prev.filter(c => c.id !== selectedComponent.id));
                  setSelectedComponent(null);
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Selecione um componente</p>
                <p className="text-xs text-muted-foreground mt-1">ou arraste da paleta</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="flex-1 overflow-y-auto p-4 mt-0">
            <div className="space-y-6">
              {/* Header Settings */}
              <div className="border border-border rounded-lg p-4">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Header</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">URL do Logo</Label>
                    <Input 
                      placeholder="https://exemplo.com/logo.png"
                      value={pageSettings.logoUrl}
                      onChange={(e) => setPageSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    />
                  </div>
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
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <TemplateSelector 
          onSelect={handleAddFromTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  );
}