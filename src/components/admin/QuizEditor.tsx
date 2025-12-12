import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '@/store/quizStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Eye, Save, GripVertical, Trash2 } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
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
  'image-choice': 'Escolha com imagem',
  'info': 'Informativo',
  'result': 'Resultado',
};

const screenTypeIcons: Record<QuizScreenType, string> = {
  'welcome': '👋',
  'single-choice': '☑️',
  'multiple-choice': '✅',
  'text-input': '📝',
  'slider': '🎚️',
  'image-choice': '🖼️',
  'info': 'ℹ️',
  'result': '🎉',
};

export function QuizEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quizzes, currentQuiz, setCurrentQuiz, addQuiz, updateQuiz, addScreen, deleteScreen, reorderScreens, setEditingScreen, editingScreen, startSession } = useQuizStore();

  const [showAddScreen, setShowAddScreen] = useState(false);

  // Initialize quiz if creating new or load existing
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
        <p className="text-muted-foreground">Quiz não encontrado</p>
      </div>
    );
  }

  const handleAddScreen = (type: QuizScreenType) => {
    const newScreen: QuizScreen = {
      id: Date.now().toString(),
      type,
      title: `Nova tela de ${screenTypeLabels[type]}`,
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
    if (confirm('Tem certeza que deseja excluir esta tela?')) {
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left sidebar - Screen list */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Input
            value={currentQuiz.name}
            onChange={(e) => updateQuiz(currentQuiz.id, { name: e.target.value })}
            className="font-semibold text-lg border-none bg-transparent px-0 focus-visible:ring-0"
            placeholder="Nome do quiz"
          />
          <Textarea
            value={currentQuiz.description || ''}
            onChange={(e) => updateQuiz(currentQuiz.id, { description: e.target.value })}
            className="mt-2 resize-none border-none bg-transparent px-0 focus-visible:ring-0 text-sm text-muted-foreground"
            placeholder="Descrição do quiz"
            rows={2}
          />
          <div className="flex items-center justify-between mt-4">
            <Label htmlFor="published" className="text-sm">Publicado</Label>
            <Switch
              id="published"
              checked={currentQuiz.isPublished}
              onCheckedChange={(checked) => updateQuiz(currentQuiz.id, { isPublished: checked })}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-muted-foreground">TELAS</h3>
            <Button size="sm" variant="ghost" onClick={() => setShowAddScreen(!showAddScreen)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {showAddScreen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-muted rounded-xl"
            >
              <p className="text-sm font-medium mb-2">Tipo de tela</p>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(screenTypeLabels) as QuizScreenType[]).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => handleAddScreen(type)}
                  >
                    <span className="mr-1">{screenTypeIcons[type]}</span>
                    {screenTypeLabels[type]}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}

          {currentQuiz.screens.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-2">Nenhuma tela criada</p>
              <Button size="sm" onClick={() => setShowAddScreen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar tela
              </Button>
            </div>
          ) : (
            <Reorder.Group axis="y" values={currentQuiz.screens} onReorder={handleReorder} className="space-y-2">
              {currentQuiz.screens.map((screen, index) => (
                <Reorder.Item key={screen.id} value={screen}>
                  <motion.div
                    className={cn(
                      "p-3 rounded-xl border cursor-pointer transition-all group",
                      editingScreen?.id === screen.id
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    )}
                    onClick={() => setEditingScreen(screen)}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <span className="text-lg">{screenTypeIcons[screen.type]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{screen.title}</p>
                        <p className="text-xs text-muted-foreground">{screenTypeLabels[screen.type]}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScreen(screen.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button onClick={handlePreview} className="w-full gradient-primary text-primary-foreground rounded-xl">
            <Eye className="w-4 h-4 mr-2" />
            Visualizar Quiz
          </Button>
        </div>
      </div>

      {/* Main content - Editor and Preview */}
      <div className="flex-1 flex">
        {/* Editor panel */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
          {editingScreen ? (
            <ScreenEditor quizId={currentQuiz.id} screen={editingScreen} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Selecione uma tela para editar</p>
                {currentQuiz.screens.length === 0 && (
                  <Button onClick={() => setShowAddScreen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar primeira tela
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="w-96 border-l border-border bg-background p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-muted-foreground">PREVIEW</h3>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden bg-background shadow-soft aspect-[9/16] max-h-[600px]">
            {editingScreen ? (
              <ScreenPreview screen={editingScreen} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Selecione uma tela
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
