import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { icons, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';

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

interface AnalyticsStageNodeData {
  label: string;
  components: ComponentData[];
  index: number;
  isSelected: boolean;
  // Analytics data
  totalLeads: number;
  recentActivity: number;
  conversionRate: number | null; // null for first stage
  previousStageLeads: number | null;
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

export const AnalyticsStageNode = memo(({ data, selected }: NodeProps & { data: AnalyticsStageNodeData }) => {
  const allComponents = data.components;
  
  // Check if any component can navigate
  const hasConnectableComponents = allComponents.some(comp => canConnect(comp) || isOptionsComponent(comp));

  // Determine conversion trend
  const getTrendIcon = () => {
    if (data.conversionRate === null) return null;
    if (data.conversionRate >= 80) {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    } else if (data.conversionRate >= 50) {
      return <Minus className="w-3 h-3 text-yellow-500" />;
    } else {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Lead Counter Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm",
          data.totalLeads > 0 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-muted-foreground"
        )}>
          <span>{data.totalLeads}</span>
          {data.recentActivity > 0 && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
          )}
        </div>
      </div>

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
            <span className="text-xs font-medium truncate flex-1">{data.label}</span>
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

      {/* Conversion Rate Badge - below the card */}
      {data.conversionRate !== null && (
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
          <div className={cn(
            "px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-1",
            data.conversionRate >= 80 ? "text-green-600" :
            data.conversionRate >= 50 ? "text-yellow-600" :
            "text-red-600"
          )}>
            {getTrendIcon()}
            <span>{data.conversionRate.toFixed(0)}%</span>
          </div>
        </div>
      )}
    </div>
  );
});

AnalyticsStageNode.displayName = 'AnalyticsStageNode';
