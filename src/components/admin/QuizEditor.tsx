import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical, Undo, Redo, Smartphone, Monitor } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Quiz, QuizScreen, QuizScreenType } from '@/types/quiz';
import { ScreenEditor } from './ScreenEditor';
import { ScreenPreview } from './ScreenPreview';
import { TemplateSelector } from './TemplateSelector';
import { ComponentPalette } from './ComponentPalette';
import { cn } from '@/lib/utils';
import { screenTemplates } from '@/data/screenTemplates';

const screenTypeLabels: Record<QuizScreenType, string> = {
  'welcome': 'Boas-vindas',
  'single-choice': 'Escolha única',
  'multiple-choice': 'Múltipla escolha',
  'text-input': 'Texto',
  'email': 'E-mail',
  'phone': 'Telefone',
  'number': 'Número',
  'slider': 'Slider',
  'date': 'Data',
  'image-choice': 'Imagem',
  'rating': 'Avaliação',
  'info': 'Info',
  'result': 'Resultado',
  'progress': 'Progresso',
  'checkout': 'Checkout',
};

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quizzes, currentQuiz, setCurrentQuiz, addQuiz, updateQuiz, addScreen, deleteScreen, reorderScreens, setEditingScreen, editingScreen, startSession, updateScreen } = useQuizStore();

  const [showTemplates, setShowTemplates] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [rightTab, setRightTab] = useState<'stage' | 'appearance'>('stage');

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
      <div className="flex items-center justify-center min-h-[50vh]">
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
    startSession(currentQuiz.id);
    navigate('/quiz');
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-muted/30">
      {/* Left Sidebar - Screens & Components */}
      <div className="w-64 bg-background border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')} 
            className="text-muted-foreground mb-2 -ml-2 h-8"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          
          <Input
            value={currentQuiz.name}
            onChange={(e) => updateQuiz(currentQuiz.id, { name: e.target.value })}
            className="font-medium border-none bg-transparent px-0 h-auto text-sm focus-visible:ring-0 shadow-none"
            placeholder="Nome do quiz"
          />
        </div>

        {/* Screens List */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Etapas</span>
          </div>
          
          <div className="flex gap-2 mb-3">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => setShowTemplates(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Em branco
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 h-8 text-xs"
              onClick={() => setShowTemplates(true)}
            >
              Modelos
            </Button>
          </div>

          {currentQuiz.screens.length === 0 ? (
            <div className="text-center py-4 border border-dashed border-border rounded-md">
              <p className="text-xs text-muted-foreground">Nenhuma etapa</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={currentQuiz.screens} onReorder={handleReorder} className="space-y-1 max-h-40 overflow-y-auto">
              {currentQuiz.screens.map((screen, index) => (
                <Reorder.Item key={screen.id} value={screen}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors group",
                      editingScreen?.id === screen.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => setEditingScreen(screen)}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab shrink-0" />
                    <span className="flex-1 truncate">{screen.title || 'Sem título'}</span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteScreen(screen.id);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>

        {/* Component Palette */}
        <div className="flex-1 overflow-y-auto p-3">
          <ComponentPalette />
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-12 border-b border-border bg-background flex items-center justify-center gap-4 px-4">
          <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
            <button
              className={cn(
                "p-1.5 rounded transition-colors",
                previewMode === 'mobile' ? "bg-accent" : "hover:bg-accent/50"
              )}
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              className={cn(
                "p-1.5 rounded transition-colors",
                previewMode === 'desktop' ? "bg-accent" : "hover:bg-accent/50"
              )}
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-accent/50 transition-colors">
              <Undo className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded hover:bg-accent/50 transition-colors">
              <Redo className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <Button size="sm" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-1" />
            Testar
          </Button>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <div 
            className={cn(
              "bg-background rounded-xl border border-border shadow-sm overflow-hidden transition-all",
              previewMode === 'mobile' 
                ? "w-[375px] h-[667px]" 
                : "w-full max-w-4xl h-[600px]"
            )}
          >
            {editingScreen ? (
              <ScreenPreview screen={editingScreen} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground border-2 border-dashed border-border m-4 rounded-lg">
                <p className="text-sm">Arraste e solte os componentes aqui</p>
                <p className="text-xs mt-1">ou selecione uma etapa</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Settings */}
      <div className="w-72 bg-background border-l border-border flex flex-col">
        <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as 'stage' | 'appearance')} className="flex flex-col h-full">
          <TabsList className="grid grid-cols-2 m-3 mb-0">
            <TabsTrigger value="stage" className="text-xs">Etapa</TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs">Aparência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stage" className="flex-1 overflow-y-auto p-3 mt-0">
            {editingScreen ? (
              <ScreenEditor quizId={currentQuiz.id} screen={editingScreen} />
            ) : (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">Selecione uma etapa</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="flex-1 overflow-y-auto p-3 mt-0">
            {editingScreen && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Header</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mostrar logo</span>
                      <Switch 
                        checked={editingScreen.showLogo ?? true}
                        onCheckedChange={(checked) => updateScreen(currentQuiz.id, editingScreen.id, { showLogo: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Mostrar progresso</span>
                      <Switch 
                        checked={editingScreen.showProgress ?? true}
                        onCheckedChange={(checked) => updateScreen(currentQuiz.id, editingScreen.id, { showProgress: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Permitir voltar</span>
                      <Switch 
                        checked={editingScreen.allowBack ?? true}
                        onCheckedChange={(checked) => updateScreen(currentQuiz.id, editingScreen.id, { allowBack: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
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