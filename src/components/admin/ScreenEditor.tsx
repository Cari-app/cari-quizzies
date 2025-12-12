import { useQuizStore } from '@/store/quizStore';
import { QuizScreen, QuizOption, QuizScreenType } from '@/types/quiz';
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
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Título da etapa</Label>
        <Input
          value={screen.title}
          onChange={(e) => handleUpdate({ title: e.target.value })}
          className="mt-1 h-8 text-sm"
          placeholder="Ex: Etapa 1"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Subtítulo</Label>
        <Input
          value={screen.subtitle || ''}
          onChange={(e) => handleUpdate({ subtitle: e.target.value })}
          className="mt-1 h-8 text-sm"
          placeholder="Opcional"
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Descrição</Label>
        <Textarea
          value={screen.description || ''}
          onChange={(e) => handleUpdate({ description: e.target.value })}
          className="mt-1 text-sm min-h-[60px]"
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
            className="mt-1 h-8 text-sm"
            placeholder="Continuar"
          />
        </div>
      )}

      {(screen.type === 'text-input' || screen.type === 'email' || screen.type === 'phone' || screen.type === 'number') && (
        <div>
          <Label className="text-xs text-muted-foreground">Placeholder</Label>
          <Input
            value={screen.placeholder || ''}
            onChange={(e) => handleUpdate({ placeholder: e.target.value })}
            className="mt-1 h-8 text-sm"
            placeholder="Digite aqui..."
          />
        </div>
      )}

      {screen.type !== 'welcome' && screen.type !== 'result' && screen.type !== 'info' && screen.type !== 'progress' && (
        <div className="flex items-center justify-between py-2">
          <Label className="text-sm">Obrigatório</Label>
          <Switch
            checked={screen.required || false}
            onCheckedChange={(checked) => handleUpdate({ required: checked })}
          />
        </div>
      )}

      {(screen.type === 'slider' || screen.type === 'rating') && (
        <div className="space-y-3 p-3 bg-muted rounded-md">
          <Label className="text-xs text-muted-foreground uppercase tracking-wide">Configuração</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Mín</Label>
              <Input
                type="number"
                value={screen.sliderMin ?? 0}
                onChange={(e) => handleUpdate({ sliderMin: parseInt(e.target.value) || 0 })}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Máx</Label>
              <Input
                type="number"
                value={screen.sliderMax ?? 100}
                onChange={(e) => handleUpdate({ sliderMax: parseInt(e.target.value) || 100 })}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Passo</Label>
              <Input
                type="number"
                value={screen.sliderStep ?? 1}
                onChange={(e) => handleUpdate({ sliderStep: parseInt(e.target.value) || 1 })}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
          {screen.type === 'slider' && (
            <div>
              <Label className="text-xs text-muted-foreground">Unidade</Label>
              <Input
                value={screen.sliderUnit || ''}
                onChange={(e) => handleUpdate({ sliderUnit: e.target.value })}
                className="mt-1 h-8 text-sm"
                placeholder="ex: anos"
              />
            </div>
          )}
        </div>
      )}

      {(screen.type === 'single-choice' || screen.type === 'multiple-choice' || screen.type === 'image-choice') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Opções</Label>
            <Button size="sm" variant="ghost" onClick={handleAddOption} className="h-6 text-xs">
              <Plus className="w-3 h-3 mr-1" />
              Adicionar
            </Button>
          </div>

          {screen.options && screen.options.length > 0 ? (
            <Reorder.Group axis="y" values={screen.options} onReorder={handleReorderOptions} className="space-y-1">
              {screen.options.map((option) => (
                <Reorder.Item key={option.id} value={option}>
                  <div className="flex items-center gap-1 p-1.5 bg-muted rounded group">
                    <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab shrink-0" />
                    <Input
                      value={option.text}
                      onChange={(e) => handleOptionUpdate(option.id, { text: e.target.value })}
                      placeholder="Texto"
                      className="h-7 text-xs flex-1"
                    />
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive"
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-center py-4 border border-dashed border-border rounded">
              <p className="text-xs text-muted-foreground">Sem opções</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}