import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronLeft, Plus, Eye, Trash2, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { Quiz, QuizScreen, QuizScreenType } from '@/types/quiz';
import { ScreenEditor } from './ScreenEditor';
import { ScreenPreview } from './ScreenPreview';
import { cn } from '@/lib/utils';

const screenTypeLabels: Record<QuizScreenType, string> = {
  'welcome': 'Boas-vindas',
  'single-choice': 'Escolha única',
  'multiple-choice': 'Múltipla escolha',
  'text-input': 'Texto',
  'slider': 'Slider',
  'image-choice': 'Imagem',
  'info': 'Info',
  'result': 'Resultado',
};

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quizzes, currentQuiz, setCurrentQuiz, addQuiz, updateQuiz, addScreen, deleteScreen, reorderScreens, setEditingScreen, editingScreen, startSession } = useQuizStore();

  const [showAddScreen, setShowAddScreen] = useState(false);

  useState(() => {
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
  });

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
      </div>
    );
  }

  const handleAddScreen = (type: QuizScreenType) => {
    const newScreen: QuizScreen = {
      id: Date.now().toString(),
      type,
      title: `Nova tela`,
      options: type.includes('choice') ? [
        { id: '1', text: 'Opção 1', value: 'option-1' },
        { id: '2', text: 'Opção 2', value: 'option-2' },
      ] : undefined,
      buttonText: type === 'welcome' || type === 'result' ? 'Continuar' : undefined,
      sliderMin: type === 'slider' ? 0 : undefined,
      sliderMax: type === 'slider' ? 100 : undefined,
      sliderStep: type === 'slider' ? 1 : undefined,
    };
    addScreen(currentQuiz.id, newScreen);
    setShowAddScreen(false);
    setEditingScreen(newScreen);
  };

  const handleDeleteScreen = (screenId: string) => {
    if (confirm('Excluir esta tela?')) {
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
    <div className="flex h-[calc(100vh-3rem)]">
      {/* Left sidebar */}
      <div className="w-72 border-r border-border bg-background flex flex-col">
        <div className="p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/admin')} 
            className="text-muted-foreground mb-3 -ml-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          
          <Input
            value={currentQuiz.name}
            onChange={(e) => updateQuiz(currentQuiz.id, { name: e.target.value })}
            className="font-medium border-none bg-transparent px-0 h-auto text-base focus-visible:ring-0 shadow-none"
            placeholder="Nome do quiz"
          />
          <Textarea
            value={currentQuiz.description || ''}
            onChange={(e) => updateQuiz(currentQuiz.id, { description: e.target.value })}
            className="mt-1 resize-none border-none bg-transparent px-0 focus-visible:ring-0 text-sm text-muted-foreground shadow-none min-h-0"
            placeholder="Descrição..."
            rows={1}
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <Label htmlFor="published" className="text-sm text-muted-foreground">Publicado</Label>
            <Switch
              id="published"
              checked={currentQuiz.isPublished}
              onCheckedChange={(checked) => updateQuiz(currentQuiz.id, { isPublished: checked })}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Telas</span>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => setShowAddScreen(!showAddScreen)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {showAddScreen && (
            <div className="mb-4 p-3 bg-muted rounded-md">
              <p className="text-xs font-medium mb-2">Tipo de tela</p>
              <div className="grid grid-cols-2 gap-1">
                {(Object.keys(screenTypeLabels) as QuizScreenType[]).map((type) => (
                  <button
                    key={type}
                    className="text-left text-xs px-2 py-1.5 rounded hover:bg-background transition-colors"
                    onClick={() => handleAddScreen(type)}
                  >
                    {screenTypeLabels[type]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentQuiz.screens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground mb-2">Nenhuma tela</p>
              <Button size="sm" variant="outline" onClick={() => setShowAddScreen(true)}>
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          ) : (
            <Reorder.Group axis="y" values={currentQuiz.screens} onReorder={handleReorder} className="space-y-1">
              {currentQuiz.screens.map((screen, index) => (
                <Reorder.Item key={screen.id} value={screen}>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors group text-sm",
                      editingScreen?.id === screen.id
                        ? "bg-accent"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => setEditingScreen(screen)}
                  >
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{screen.title}</p>
                      <p className="text-xs text-muted-foreground">{screenTypeLabels[screen.type]}</p>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
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

        <div className="p-4 border-t border-border">
          <Button onClick={handlePreview} variant="outline" className="w-full" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto p-8 bg-muted/30">
          {editingScreen ? (
            <ScreenEditor quizId={currentQuiz.id} screen={editingScreen} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">
                {currentQuiz.screens.length === 0 
                  ? 'Adicione uma tela para começar'
                  : 'Selecione uma tela para editar'
                }
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="w-80 border-l border-border bg-background p-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Preview</span>
          <div className="mt-3 rounded-md border border-border overflow-hidden bg-background aspect-[9/16] max-h-[500px]">
            {editingScreen ? (
              <ScreenPreview screen={editingScreen} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Selecione uma tela
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}