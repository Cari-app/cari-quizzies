import { useState } from 'react';
import { QuizComponent } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Reorder } from 'framer-motion';

interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
}

interface DropZoneProps {
  components: DroppedComponent[];
  onComponentsChange: (components: DroppedComponent[]) => void;
}

export function DropZone({ components, onComponentsChange }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const type = e.dataTransfer.getData('component-type');
    const name = e.dataTransfer.getData('component-name');
    const icon = e.dataTransfer.getData('component-icon');

    if (type && name) {
      const newComponent: DroppedComponent = {
        id: `${type}-${Date.now()}`,
        type,
        name,
        icon,
      };
      onComponentsChange([...components, newComponent]);
    }
  };

  const handleRemove = (id: string) => {
    onComponentsChange(components.filter(c => c.id !== id));
  };

  const renderComponentPreview = (comp: DroppedComponent) => {
    switch (comp.type) {
      case 'text':
        return (
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Bloco de texto - clique para editar</p>
          </div>
        );
      case 'heading':
        return (
          <div className="p-4 bg-muted/30 rounded-lg">
            <h2 className="text-xl font-semibold">Título</h2>
          </div>
        );
      case 'image':
        return (
          <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-2xl">🖼️</span>
            <span className="text-sm text-muted-foreground ml-2">Clique para adicionar imagem</span>
          </div>
        );
      case 'video':
        return (
          <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
            <span className="text-2xl">🎬</span>
            <span className="text-sm text-muted-foreground ml-2">Clique para adicionar vídeo</span>
          </div>
        );
      case 'button':
        return (
          <div className="p-4">
            <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Botão
            </button>
          </div>
        );
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="p-4">
            <input 
              type="text" 
              placeholder={comp.type === 'email' ? 'seu@email.com' : comp.type === 'phone' ? '(00) 00000-0000' : 'Digite aqui...'}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
              disabled
            />
          </div>
        );
      case 'options':
      case 'single':
      case 'multiple':
        return (
          <div className="p-4 space-y-2">
            {['Opção 1', 'Opção 2', 'Opção 3'].map((opt, i) => (
              <div key={i} className={cn(
                "p-3 rounded-lg border text-sm",
                i === 0 ? "border-foreground bg-accent" : "border-border"
              )}>
                {opt}
              </div>
            ))}
          </div>
        );
      case 'yesno':
        return (
          <div className="p-4 flex gap-3">
            <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
              Sim
            </button>
            <button className="flex-1 py-3 border border-border rounded-lg text-sm font-medium">
              Não
            </button>
          </div>
        );
      case 'spacer':
        return (
          <div className="py-6 flex items-center justify-center">
            <div className="border-t border-dashed border-border w-full" />
          </div>
        );
      case 'alert':
        return (
          <div className="p-4">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm">
              ⚠️ Mensagem de alerta
            </div>
          </div>
        );
      case 'timer':
        return (
          <div className="p-4 flex items-center justify-center">
            <div className="text-3xl font-mono font-bold">05:00</div>
          </div>
        );
      case 'loading':
        return (
          <div className="p-4 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        );
      case 'testimonials':
        return (
          <div className="p-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm italic">"Depoimento de exemplo"</p>
              <p className="text-xs text-muted-foreground mt-2">— Nome do Cliente</p>
            </div>
          </div>
        );
      case 'faq':
        return (
          <div className="p-4 space-y-2">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Pergunta frequente?</p>
              <p className="text-xs text-muted-foreground mt-1">Resposta aqui...</p>
            </div>
          </div>
        );
      case 'price':
        return (
          <div className="p-4 text-center">
            <span className="text-3xl font-bold">R$ 99</span>
            <span className="text-sm text-muted-foreground">/mês</span>
          </div>
        );
      case 'metrics':
      case 'charts':
        return (
          <div className="p-4 flex items-center justify-center">
            <div className="text-4xl">📊</div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-2">
            <span className="text-lg">{comp.icon}</span>
            <span className="text-sm">{comp.name}</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "flex-1 transition-colors duration-200 overflow-y-auto",
        isDragOver && "bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {components.length === 0 ? (
        <div className={cn(
          "h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl m-4 transition-colors",
          isDragOver ? "border-primary bg-primary/5" : "border-border"
        )}>
          <Plus className={cn("w-8 h-8 mb-3 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
          <p className={cn("text-sm font-medium transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}>
            {isDragOver ? "Solte o componente aqui" : "Arraste componentes aqui"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            para criar sua página personalizada
          </p>
        </div>
      ) : (
        <div className="p-4">
          <Reorder.Group axis="y" values={components} onReorder={onComponentsChange} className="space-y-2">
            {components.map((comp) => (
              <Reorder.Item key={comp.id} value={comp}>
                <div className="group relative bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRemove(comp.id)}
                      className="p-1 hover:bg-destructive/10 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {renderComponentPreview(comp)}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          
          {/* Drop indicator at the end */}
          <div className={cn(
            "mt-4 p-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-border/50"
          )}>
            <Plus className={cn("w-4 h-4 mr-2", isDragOver ? "text-primary" : "text-muted-foreground")} />
            <span className={cn("text-xs", isDragOver ? "text-primary" : "text-muted-foreground")}>
              {isDragOver ? "Soltar aqui" : "Arraste mais componentes"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
