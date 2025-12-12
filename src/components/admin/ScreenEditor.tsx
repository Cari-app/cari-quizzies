import { useQuizStore } from '@/store/quizStore';
import { QuizScreen, QuizOption } from '@/types/quiz';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Reorder } from 'framer-motion';

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
    <div className="max-w-xl space-y-6">
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <Input
          value={screen.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="mt-1"
          placeholder="Título da tela"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Subtítulo</Label>
        <Input
          value={screen.subtitle || ''}
          onChange={(e) => handleUpdate({ subtitle: e.target.value })}
          className="mt-1"
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <Textarea
          value={screen.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          className="mt-1"
          placeholder="Opcional"
          rows={2}
        />
      </div>

      {(screen.type === 'welcome' || screen.type === 'result' || screen.type === 'info') && (
        <div>
          <Label className="text-xs text-muted-foreground">Texto do botão</Label>
          <Input
            value={screen.buttonText || ''}
            onChange={(e) => handleUpdate({ buttonText: e.target.value })}
            className="mt-1"
            placeholder="Continuar"
          />
        </div>
      )}

      {screen.type !== 'welcome' && screen.type !== 'result' && screen.type !== 'info' && (
        <div className="flex items-center justify-between py-2">
          <Label className="text-sm">Resposta obrigatória</Label>
          <Switch
            checked={screen.required || false}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
        </div>
      )}

      {screen.type === 'slider' && (
        <div className="space-y-4 p-4 bg-muted rounded-md">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Slider</Label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Mínimo</Label>
              <Input
                type="number"
                value={screen.sliderMin ?? 0}
                onChange={(e) => handleUpdate({ sliderMin: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Máximo</Label>
              <Input
                type="number"
                value={screen.sliderMax ?? 100}
                onChange={(e) => handleUpdate({ sliderMax: parseInt(e.target.value) || 100 })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Passo</Label>
              <Input
                type="number"
                value={screen.sliderStep ?? 1}
                onChange={(e) => handleUpdate({ sliderStep: parseInt(e.target.value) || 1 })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Unidade</Label>
            <Input
              value={screen.sliderUnit || ''}
              onChange={(e) => handleUpdate({ sliderUnit: e.target.value })}
              className="mt-1"
              placeholder="ex: anos, kg"
            />
          </div>
        </div>
      )}

      {(screen.type === 'single-choice' || screen.type === 'multiple-choice' || screen.type === 'image-choice') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Opções</Label>
            <Button size="sm" variant="ghost" onClick={handleAddOption} className="h-7">
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {screen.options && screen.options.length > 0 ? (
            <Reorder.Group axis="y" values={screen.options} onReorder={handleReorderOptions} className="space-y-2">
              {screen.options.map((option) => (
                <Reorder.Item key={option.id} value={option}>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md group">
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionUpdate(option.id, { text: e.target.value })}
                        placeholder="Texto"
                        className="h-8 text-sm"
                      />
                      <Input
                        value={option.value as string || ''}
                        onChange={(e) => handleOptionUpdate(option.id, { value: e.target.value })}
                        placeholder="Valor"
                        className="h-8 text-sm"
                      />
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-destructive"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-md">
              <p className="text-xs text-muted-foreground mb-2">Nenhuma opção</p>
              <Button size="sm" variant="outline" onClick={handleAddOption}>
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}