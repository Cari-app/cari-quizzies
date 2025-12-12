import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical, Undo, Redo, Smartphone, Monitor, PanelLeftClose, PanelLeftOpen, Globe, Copy, Check } from 'lucide-react';
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
    if (id === 'new') {
      const newQuiz: Quiz = {
        id: Date.now().toString(),
        name: 'Novo Quiz',
        description: '',
        screens: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublished: false,
      };
      addQuiz(newQuiz);
      setCurrentQuiz(newQuiz);
    } else {
      const quiz = quizzes.find(q => q.id === id);
      if (quiz) {
        setCurrentQuiz(quiz);
      }
    }
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
        <div className="h-14 border-b border-border bg-background flex items-center justify-center gap-4 px-4 shrink-0">
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

          <Button size="sm" onClick={handlePreview} className="gap-2">
            <Eye className="w-4 h-4" />
            Testar
          </Button>
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
              {/* Page Settings */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Configurações da página</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mostrar header</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mostrar progresso</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Botão voltar</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Mostrar logo</span>
                    <Switch defaultChecked />
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