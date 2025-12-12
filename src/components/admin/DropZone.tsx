import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { DroppedComponent, ComponentConfig } from './ComponentEditor';

interface DropZoneProps {
  components: DroppedComponent[];
  onComponentsChange: (components: DroppedComponent[]) => void;
  selectedComponentId?: string | null;
  onSelectComponent: (component: DroppedComponent | null) => void;
}

export function DropZone({ components, onComponentsChange, selectedComponentId, onSelectComponent }: DropZoneProps) {
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
        config: getDefaultConfig(type),
      };
      onComponentsChange([...components, newComponent]);
      onSelectComponent(newComponent);
    }
  };

  const getDefaultConfig = (type: string): ComponentConfig => {
    switch (type) {
      case 'input':
        return { label: 'Campo de texto', placeholder: 'Digite aqui...', required: false };
      case 'email':
        return { label: 'E-mail', placeholder: 'seu@email.com', required: true };
      case 'phone':
        return { label: 'Telefone', placeholder: '(00) 00000-0000', required: true, mask: 'br' };
      case 'number':
        return { label: 'Número', placeholder: '0', required: false };
      case 'date':
        return { label: 'Data', required: false };
      case 'textarea':
        return { label: 'Mensagem', placeholder: 'Digite sua mensagem...', required: false };
      case 'height':
        return { label: 'Altura', placeholder: '170', required: false };
      case 'weight':
        return { label: 'Peso', placeholder: '70', required: false };
      case 'button':
        return { buttonText: 'Continuar', buttonStyle: 'primary', buttonAction: 'next' };
      case 'options':
      case 'single':
        return { 
          label: 'Qual sua preferência?', 
          options: [
            { id: '1', text: 'Opção 1', value: 'opt1' },
            { id: '2', text: 'Opção 2', value: 'opt2' },
            { id: '3', text: 'Opção 3', value: 'opt3' },
          ],
          allowMultiple: false,
          required: true
        };
      case 'multiple':
        return { 
          label: 'Selecione todas que se aplicam', 
          options: [
            { id: '1', text: 'Opção 1', value: 'opt1' },
            { id: '2', text: 'Opção 2', value: 'opt2' },
            { id: '3', text: 'Opção 3', value: 'opt3' },
          ],
          allowMultiple: true,
          required: true
        };
      case 'yesno':
        return { 
          label: 'Você concorda?', 
          options: [
            { id: '1', text: 'Sim', value: 'yes' },
            { id: '2', text: 'Não', value: 'no' },
          ],
          required: true
        };
      case 'text':
        return { content: 'Clique para editar este texto', textAlign: 'left', fontSize: 'base' };
      case 'spacer':
        return { height: 24 };
      default:
        return {};
    }
  };

  const handleRemove = (id: string) => {
    onComponentsChange(components.filter(c => c.id !== id));
    if (selectedComponentId === id) {
      onSelectComponent(null);
    }
  };

  const renderComponentPreview = (comp: DroppedComponent) => {
    const config = comp.config || {};
    
    switch (comp.type) {
      case 'text':
        return (
          <div className={cn("p-4", config.textAlign === 'center' && 'text-center', config.textAlign === 'right' && 'text-right')}>
            <p className={cn(
              "text-foreground",
              config.fontSize === 'sm' && 'text-sm',
              config.fontSize === 'lg' && 'text-lg',
              config.fontSize === 'xl' && 'text-xl',
              config.fontSize === '2xl' && 'text-2xl font-semibold'
            )}>
              {config.content || 'Bloco de texto'}
            </p>
          </div>
        );
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'textarea':
      case 'height':
      case 'weight':
        return (
          <div className="p-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            {comp.type === 'textarea' ? (
              <textarea 
                placeholder={config.placeholder || 'Digite aqui...'}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm resize-none"
                rows={3}
                disabled
              />
            ) : (
              <input 
                type={comp.type === 'email' ? 'email' : comp.type === 'number' || comp.type === 'height' || comp.type === 'weight' ? 'number' : comp.type === 'date' ? 'date' : 'text'}
                placeholder={config.placeholder}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
                disabled
              />
            )}
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'button':
        return (
          <div className="p-4">
            <button className={cn(
              "w-full py-3 rounded-lg text-sm font-medium transition-colors",
              config.buttonStyle === 'primary' && "bg-primary text-primary-foreground",
              config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
              config.buttonStyle === 'outline' && "border border-border bg-transparent"
            )}>
              {config.buttonText || 'Botão'}
            </button>
          </div>
        );
      case 'options':
      case 'single':
      case 'multiple':
        return (
          <div className="p-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="space-y-2">
              {(config.options || []).map((opt, i) => (
                <div key={opt.id} className={cn(
                  "p-3 rounded-lg border text-sm flex items-center gap-3",
                  i === 0 ? "border-foreground bg-accent" : "border-border"
                )}>
                  <div className={cn(
                    "w-5 h-5 border-2 flex items-center justify-center",
                    config.allowMultiple ? "rounded" : "rounded-full",
                    i === 0 ? "border-foreground bg-foreground" : "border-border"
                  )}>
                    {i === 0 && <span className="text-background text-xs">✓</span>}
                  </div>
                  {opt.text}
                </div>
              ))}
            </div>
          </div>
        );
      case 'yesno':
        return (
          <div className="p-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                {config.options?.[0]?.text || 'Sim'}
              </button>
              <button className="flex-1 py-3 border border-border rounded-lg text-sm font-medium">
                {config.options?.[1]?.text || 'Não'}
              </button>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="p-4">
            {config.mediaUrl ? (
              <img src={config.mediaUrl} alt={config.altText || ''} className="w-full rounded-lg" />
            ) : (
              <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <span className="text-2xl">🖼️</span>
                <span className="text-sm text-muted-foreground ml-2">Adicionar imagem</span>
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="p-4">
            <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
              <span className="text-2xl">🎬</span>
              <span className="text-sm text-muted-foreground ml-2">Adicionar vídeo</span>
            </div>
          </div>
        );
      case 'spacer':
        return (
          <div className="flex items-center justify-center" style={{ height: config.height || 24 }}>
            <div className="border-t border-dashed border-border w-full mx-4" />
          </div>
        );
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-2 m-4">
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
                <div 
                  className={cn(
                    "group relative bg-background border rounded-lg overflow-hidden cursor-pointer transition-all",
                    selectedComponentId === comp.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => onSelectComponent(comp)}
                >
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemove(comp.id); }}
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

export type { DroppedComponent, ComponentConfig };