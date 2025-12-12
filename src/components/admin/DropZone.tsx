import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, GripVertical, Trash2, CalendarIcon, Pencil, Copy } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { DroppedComponent, ComponentConfig } from './ComponentEditor';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        return { label: 'Altura', placeholder: '170', required: false, layoutType: 'input', unit: 'cm', minValue: 100, maxValue: 220, defaultValue: 170 };
      case 'weight':
        return { label: 'Peso', placeholder: '70', required: false, layoutType: 'input', unit: 'kg', minValue: 30, maxValue: 200, defaultValue: 70 };
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

  const handleDuplicate = (comp: DroppedComponent) => {
    const newComponent: DroppedComponent = {
      ...comp,
      id: `${comp.type}-${Date.now()}`,
      config: comp.config ? { ...comp.config } : undefined,
    };
    const index = components.findIndex(c => c.id === comp.id);
    const newComponents = [...components];
    newComponents.splice(index + 1, 0, newComponent);
    onComponentsChange(newComponents);
    onSelectComponent(newComponent);
  };

  const handleEdit = (comp: DroppedComponent) => {
    onSelectComponent(comp);
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
      case 'textarea':
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
                type={comp.type === 'email' ? 'email' : comp.type === 'number' ? 'number' : 'text'}
                placeholder={config.placeholder}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
                disabled
              />
            )}
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'height':
      case 'weight':
        const isRulerLayout = config.layoutType === 'ruler';
        const unit = config.unit || (comp.type === 'height' ? 'cm' : 'kg');
        const defaultVal = config.defaultValue || (comp.type === 'height' ? 170 : 70);
        const minVal = config.minValue || (comp.type === 'height' ? 100 : 30);
        const maxVal = config.maxValue || (comp.type === 'height' ? 220 : 200);
        
        if (isRulerLayout) {
          return (
            <div className="p-4">
              {/* Unit Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-muted rounded-full p-1">
                  <button className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                    unit === 'cm' || unit === 'kg' ? "bg-foreground text-background" : "text-muted-foreground"
                  )}>
                    {comp.type === 'height' ? 'cm' : 'kg'}
                  </button>
                  <button className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                    unit === 'pol' || unit === 'lb' ? "bg-foreground text-background" : "text-muted-foreground"
                  )}>
                    {comp.type === 'height' ? 'pol' : 'lb'}
                  </button>
                </div>
              </div>
              
              {/* Value Display */}
              <div className="text-center mb-4">
                <span className="text-5xl font-semibold">{defaultVal}</span>
                <span className="text-xl text-muted-foreground ml-1">{unit}</span>
              </div>
              
              {/* Ruler */}
              <div className="relative py-4">
                {/* Indicator - pointing down from top */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground" />
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-px h-4 bg-foreground" />
                
                <div className="flex justify-between items-end h-8 mt-4">
                  {Array.from({ length: 21 }, (_, i) => {
                    const isMajor = i % 5 === 0;
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "w-px bg-border",
                          isMajor ? "h-6" : "h-3"
                        )} 
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{minVal + Math.round((maxVal - minVal) * 0.25)}</span>
                  <span>{defaultVal}</span>
                  <span>{minVal + Math.round((maxVal - minVal) * 0.75)}</span>
                </div>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-2">Arraste para ajustar</p>
            </div>
          );
        }
        
        return (
          <div className="p-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <input 
              type="number"
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
              disabled
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'date':
        return (
          <div className="p-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm flex items-center justify-between text-muted-foreground"
                >
                  <span>dd/mm/aaaa</span>
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
      case 'multiple': {
        const optionStyle = config.optionStyle || 'simple';
        const optionLayout = config.optionLayout || 'list';
        const optionBorderRadius = config.optionBorderRadius || 'small';
        const optionShadow = config.optionShadow || 'none';
        const optionSpacing = config.optionSpacing || 'simple';
        const detailType = config.detailType || 'checkbox';
        const detailPosition = config.detailPosition || 'start';
        const imagePosition = config.imagePosition || 'top';
        const imageRatio = config.imageRatio || '1:1';
        
        const getBorderRadius = () => {
          switch (optionBorderRadius) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-md';
            case 'medium': return 'rounded-lg';
            case 'large': return 'rounded-xl';
            case 'full': return 'rounded-full';
            default: return 'rounded-md';
          }
        };
        
        const getShadow = () => {
          switch (optionShadow) {
            case 'sm': return 'shadow-sm';
            case 'md': return 'shadow-md';
            case 'lg': return 'shadow-lg';
            default: return '';
          }
        };
        
        const getSpacing = () => {
          switch (optionSpacing) {
            case 'compact': return 'gap-1';
            case 'relaxed': return 'gap-4';
            default: return 'gap-2';
          }
        };
        
        const getLayoutClass = () => {
          switch (optionLayout) {
            case 'grid-2': return 'grid grid-cols-2';
            case 'grid-3': return 'grid grid-cols-3';
            case 'grid-4': return 'grid grid-cols-4';
            default: return 'flex flex-col';
          }
        };
        
        const getImageRatioClass = () => {
          switch (imageRatio) {
            case '16:9': return 'aspect-video';
            case '4:3': return 'aspect-[4/3]';
            case '3:2': return 'aspect-[3/2]';
            default: return 'aspect-square';
          }
        };
        
        const renderDetail = (isSelected: boolean, index: number) => {
          if (detailType === 'none') return null;
          
          if (detailType === 'number') {
            return (
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0",
                isSelected ? "border-foreground bg-foreground text-background" : "border-border"
              )}>
                {index + 1}
              </div>
            );
          }
          
          return (
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0",
              detailType === 'radio' || !config.allowMultiple ? "rounded-full" : "rounded",
              isSelected ? "border-foreground bg-foreground" : "border-border"
            )}>
              {isSelected && <span className="text-background text-xs">✓</span>}
            </div>
          );
        };
        
        return (
          <div className="p-4">
            {config.label && <p className="text-sm font-medium mb-1">{config.label}</p>}
            {config.description && <p className="text-xs text-muted-foreground mb-3">{config.description}</p>}
            <div className={cn(getLayoutClass(), getSpacing())}>
              {(config.options || []).map((opt, i) => {
                const isSelected = i === 0;
                
                if (optionStyle === 'image') {
                  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
                  return (
                    <div 
                      key={opt.id} 
                      className={cn(
                        "border text-sm transition-colors overflow-hidden",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-foreground bg-accent" : "border-border",
                        isHorizontal ? "flex" : "flex flex-col"
                      )}
                    >
                      {(imagePosition === 'top' || imagePosition === 'left') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                      <div className={cn(
                        "p-3 flex items-center gap-2",
                        detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {renderDetail(isSelected, i)}
                        <span className="flex-1">{opt.text}</span>
                      </div>
                      {(imagePosition === 'bottom' || imagePosition === 'right') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (optionStyle === 'card') {
                  return (
                    <div 
                      key={opt.id} 
                      className={cn(
                        "p-4 border text-sm transition-colors",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-foreground bg-accent" : "border-border"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-3",
                        detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {renderDetail(isSelected, i)}
                        <span className="flex-1">{opt.text}</span>
                      </div>
                    </div>
                  );
                }
                
                // Simple style
                return (
                  <div 
                    key={opt.id} 
                    className={cn(
                      "p-3 border text-sm transition-colors",
                      getBorderRadius(),
                      getShadow(),
                      isSelected ? "border-foreground bg-accent" : "border-border"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-3",
                      detailPosition === 'end' && "flex-row-reverse"
                    )}>
                      {renderDetail(isSelected, i)}
                      <span className="flex-1">{opt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
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
        "flex-1 flex flex-col items-center justify-center transition-colors duration-200 overflow-y-auto",
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
        <div className="w-full max-w-md p-4 pt-12">
          <div>
            <Reorder.Group axis="y" values={components} onReorder={onComponentsChange} className="space-y-4">
              {components.map((comp) => (
                <Reorder.Item key={comp.id} value={comp}>
                  <div 
                    className={cn(
                      "group relative bg-background border rounded-lg cursor-pointer transition-all",
                      selectedComponentId === comp.id 
                        ? "border-primary ring-2 ring-primary/20" 
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => onSelectComponent(comp)}
                  >
                    {/* Floating toolbar */}
                    <div className="absolute -top-10 left-0 opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-0.5 bg-primary rounded-md p-1 shadow-lg">
                      <button 
                        className="p-1.5 hover:bg-primary-foreground/20 rounded cursor-grab"
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(comp); }}
                        className="p-1.5 hover:bg-primary-foreground/20 rounded"
                      >
                        <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(comp); }}
                        className="p-1.5 hover:bg-primary-foreground/20 rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemove(comp.id); }}
                        className="p-1.5 hover:bg-primary-foreground/20 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-primary-foreground" />
                      </button>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute -top-2 left-4 w-2 h-2 bg-primary rotate-45 opacity-0 group-hover:opacity-100 transition-all z-10" />
                    <div className="overflow-hidden rounded-lg">
                      {renderComponentPreview(comp)}
                    </div>
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
        </div>
      )}
    </div>
  );
}

export type { DroppedComponent, ComponentConfig };