import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { icons, ChevronRight } from 'lucide-react';

interface OptionItem {
  id: string;
  text: string;
  destination?: string;
  [key: string]: any;
}

interface ComponentData {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: {
    buttonAction?: string;
    autoAdvance?: boolean;
    options?: OptionItem[];
    [key: string]: any;
  };
}

interface StageNodeData {
  label: string;
  components: ComponentData[];
  index: number;
  isSelected: boolean;
}

// Types that can trigger navigation
const CONNECTABLE_TYPES = ['button', 'loading'];
const OPTIONS_TYPES = ['options', 'single', 'multiple', 'single_choice', 'multiple_choice'];

const canConnect = (comp: ComponentData): boolean => {
  if (CONNECTABLE_TYPES.includes(comp.type)) {
    if (comp.type === 'button') {
      const action = comp.config?.buttonAction;
      return action === 'next' || action === 'submit' || action === 'specific';
    }
    if (comp.type === 'loading') {
      return true;
    }
    return true;
  }
  return false;
};

const isOptionsComponent = (comp: ComponentData): boolean => {
  return OPTIONS_TYPES.includes(comp.type);
};

// Map component types to icons
const getComponentIcon = (type: string, iconName: string) => {
  const toPascalCase = (str: string) => 
    str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  const iconKey = toPascalCase(iconName) as keyof typeof icons;
  const LucideIcon = icons[iconKey];
  
  if (LucideIcon) {
    return <LucideIcon className="w-3 h-3 text-muted-foreground shrink-0" />;
  }
  
  return <span className="text-[10px]">{iconName}</span>;
};

// Extract text from HTML
const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || html;
};

export const StageNode = memo(({ data, selected }: NodeProps & { data: StageNodeData }) => {
  const allComponents = data.components;
  
  // Check if any component can navigate
  const hasConnectableComponents = allComponents.some(comp => canConnect(comp) || isOptionsComponent(comp));

  return (
    <div
      className={cn(
        "bg-background border rounded-lg shadow-sm min-w-[180px] max-w-[250px] transition-all",
        selected || data.isSelected 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border hover:border-muted-foreground/50"
      )}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-border bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium">{data.index}</span>
          <span className="text-xs font-medium truncate">{data.label}</span>
        </div>
      </div>

      {/* Components List */}
      <div className="p-1.5 space-y-0.5">
        {allComponents.length === 0 ? (
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground italic">
            Vazio
          </div>
        ) : (
          <>
            {allComponents.map((comp, idx) => {
              const isConnectable = canConnect(comp);
              const hasOptions = isOptionsComponent(comp);
              const options = comp.config?.options || [];
              
              // For options components, show each option with its own handle
              if (hasOptions && options.length > 0) {
                return (
                  <div key={comp.id || idx} className="space-y-0.5">
                    {/* Component header */}
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] bg-muted/30">
                      {getComponentIcon(comp.type, comp.icon)}
                      <span className="truncate flex-1 font-medium">{comp.name}</span>
                    </div>
                    
                    {/* Individual options */}
                    {options.map((option, optIdx) => (
                      <div
                        key={option.id || optIdx}
                        className="flex items-center gap-1.5 pl-5 pr-2 py-0.5 rounded text-[10px] relative hover:bg-primary/10"
                      >
                        <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/60" />
                        <span className="truncate flex-1 text-muted-foreground">
                          {stripHtml(option.text || `Opção ${optIdx + 1}`)}
                        </span>
                        
                        {/* Individual option connection handle */}
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`opt-${comp.id}-${option.id}`}
                          className="!w-2 !h-2 !bg-primary/60 !border-2 !border-primary !right-[-8px] hover:!bg-primary transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                );
              }
              
              // Regular connectable component
              return (
                <div
                  key={comp.id || idx}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded text-[11px] relative",
                    isConnectable ? "hover:bg-primary/10 cursor-pointer" : "hover:bg-muted/50"
                  )}
                >
                  {getComponentIcon(comp.type, comp.icon)}
                  <span className="truncate flex-1">{comp.name}</span>
                  
                  {/* Individual component connection handle - only for connectable components */}
                  {isConnectable && (
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={`comp-${comp.id}`}
                      className="!w-2.5 !h-2.5 !bg-primary/60 !border-2 !border-primary !right-[-10px] hover:!bg-primary transition-colors"
                    />
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
      
      {/* No connectable components message */}
      {!hasConnectableComponents && allComponents.length > 0 && (
        <div className="px-2 pb-2">
          <div className="text-[9px] text-muted-foreground/60 italic text-center">
            Sem componentes de navegação
          </div>
        </div>
      )}

      {/* Target Handle - always present to receive connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-background !border-2 !border-muted-foreground/50 !-left-1.5"
      />
    </div>
  );
});

StageNode.displayName = 'StageNode';
