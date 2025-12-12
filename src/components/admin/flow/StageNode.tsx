import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { icons } from 'lucide-react';

interface StageNodeData {
  label: string;
  components: Array<{
    type: string;
    name: string;
    icon: string;
  }>;
  index: number;
  isSelected: boolean;
}

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

export const StageNode = memo(({ data, selected }: NodeProps & { data: StageNodeData }) => {
  const maxVisibleComponents = 5;
  const visibleComponents = data.components.slice(0, maxVisibleComponents);
  const hiddenCount = data.components.length - maxVisibleComponents;

  return (
    <div
      className={cn(
        "bg-background border rounded-lg shadow-sm min-w-[180px] max-w-[200px] transition-all",
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
        {visibleComponents.length === 0 ? (
          <div className="px-2 py-1.5 text-[10px] text-muted-foreground italic">
            Vazio
          </div>
        ) : (
          <>
            {visibleComponents.map((comp, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] hover:bg-muted/50 relative group"
              >
                {getComponentIcon(comp.type, comp.icon)}
                <span className="truncate flex-1">{comp.name}</span>
                
                {/* Individual component connection handle */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`comp-${idx}`}
                  className="!w-2 !h-2 !bg-muted-foreground/40 !border-0 !right-[-8px] opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
            {hiddenCount > 0 && (
              <div className="px-2 py-1 text-[10px] text-muted-foreground">
                +{hiddenCount} mais...
              </div>
            )}
          </>
        )}
      </div>

      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-background !border-2 !border-muted-foreground/50 !-left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="default"
        className="!w-3 !h-3 !bg-background !border-2 !border-muted-foreground/50 !-right-1.5"
      />
    </div>
  );
});

StageNode.displayName = 'StageNode';
