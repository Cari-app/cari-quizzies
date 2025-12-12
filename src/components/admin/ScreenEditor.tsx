import { useQuizStore } from '@/store/quizStore';
import { QuizScreen, QuizOption } from '@/types/quiz';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

interface ScreenEditorProps {
  quizId: string;
  screen: QuizScreen;
}

export function ScreenEditor({ quizId, screen }: ScreenEditorProps) {
  const { updateScreen } = useQuizStore();

  const handleUpdate = (updates: Partial<QuizScreen>) => {
    updateScreen(quizId, screen.id, updates);
  };

  const handleOptionUpdate = (optionId: string, updates: Partial<QuizOption>) => {
    const newOptions = screen.options?.map(opt =>
      opt.id === optionId ? { ...opt, ...updates } : opt
    );
    handleUpdate({ options: newOptions });
  };

  const handleAddOption = () => {
    const newOption: QuizOption = {
      id: Date.now().toString(),
      text: 'Nova opção',
      value: `option-${Date.now()}`,
    };
    handleUpdate({ options: [...(screen.options || []), newOption] });
  };

  const handleDeleteOption = (optionId: string) => {
    handleUpdate({ options: screen.options?.filter(opt => opt.id !== optionId) });
  };

  const handleReorderOptions = (newOptions: QuizOption[]) => {
    handleUpdate({ options: newOptions });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações da Tela</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={screen.title}
              onChange={(e) => handleUpdate({ title: e.target.value })}
              placeholder="Título da tela"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtítulo (opcional)</Label>
            <Input
              id="subtitle"
              value={screen.subtitle || ''}
              onChange={(e) => handleUpdate({ subtitle: e.target.value })}
              placeholder="Subtítulo da tela"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={screen.description || ''}
              onChange={(e) => handleUpdate({ description: e.target.value })}
              placeholder="Descrição adicional"
              rows={3}
            />
          </div>

          {(screen.type === 'welcome' || screen.type === 'result' || screen.type === 'info') && (
            <div className="space-y-2">
              <Label htmlFor="buttonText">Texto do botão</Label>
              <Input
                id="buttonText"
                value={screen.buttonText || ''}
                onChange={(e) => handleUpdate({ buttonText: e.target.value })}
                placeholder="Continuar"
              />
            </div>
          )}

          {screen.type !== 'welcome' && screen.type !== 'result' && screen.type !== 'info' && (
            <div className="flex items-center justify-between">
              <Label htmlFor="required">Resposta obrigatória</Label>
              <Switch
                id="required"
                checked={screen.required || false}
                onCheckedChange={(checked) => handleUpdate({ required: checked })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slider settings */}
      {screen.type === 'slider' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações do Slider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sliderMin">Mínimo</Label>
                <Input
                  id="sliderMin"
                  type="number"
                  value={screen.sliderMin ?? 0}
                  onChange={(e) => handleUpdate({ sliderMin: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sliderMax">Máximo</Label>
                <Input
                  id="sliderMax"
                  type="number"
                  value={screen.sliderMax ?? 100}
                  onChange={(e) => handleUpdate({ sliderMax: parseInt(e.target.value) || 100 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sliderStep">Incremento</Label>
                <Input
                  id="sliderStep"
                  type="number"
                  value={screen.sliderStep ?? 1}
                  onChange={(e) => handleUpdate({ sliderStep: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sliderUnit">Unidade (opcional)</Label>
              <Input
                id="sliderUnit"
                value={screen.sliderUnit || ''}
                onChange={(e) => handleUpdate({ sliderUnit: e.target.value })}
                placeholder="ex: anos, kg, cm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Options for choice screens */}
      {(screen.type === 'single-choice' || screen.type === 'multiple-choice' || screen.type === 'image-choice') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Opções</CardTitle>
              <Button size="sm" variant="outline" onClick={handleAddOption}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {screen.options && screen.options.length > 0 ? (
              <Reorder.Group axis="y" values={screen.options} onReorder={handleReorderOptions} className="space-y-3">
                {screen.options.map((option, index) => (
                  <Reorder.Item key={option.id} value={option}>
                    <motion.div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl group">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionUpdate(option.id, { text: e.target.value })}
                          placeholder="Texto da opção"
                        />
                        <Input
                          value={option.value as string || ''}
                          onChange={(e) => handleOptionUpdate(option.id, { value: e.target.value })}
                          placeholder="Valor"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteOption(option.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">Nenhuma opção criada</p>
                <Button size="sm" onClick={handleAddOption}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar opção
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
