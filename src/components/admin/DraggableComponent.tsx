import { cn } from '@/lib/utils';
import { icons } from 'lucide-react';

interface DraggableComponentProps {
  type: string;
  name: string;
  icon: string;
  isNew?: boolean;
  expanded?: boolean;
}

export function DraggableComponent({ type, name, icon, isNew, expanded }: DraggableComponentProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.setData('component-name', name);
    e.dataTransfer.setData('component-icon', icon);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Convert kebab-case to PascalCase for Lucide icon lookup
  const toPascalCase = (str: string) => 
    str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  
  const iconKey = toPascalCase(icon) as keyof typeof icons;
  const LucideIcon = icons[iconKey];

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={cn(
        "flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full relative cursor-grab active:cursor-grabbing select-none",
        expanded && "flex-col gap-1 py-3 justify-center"
      )}
    >
      {LucideIcon ? (
        <LucideIcon className={cn("h-4 w-4 text-muted-foreground", expanded && "h-5 w-5")} />
      ) : (
        <span className={cn("text-base", expanded && "text-xl")}>{icon}</span>
      )}
      <span className={cn("truncate", expanded && "text-center text-[10px]")}>{name}</span>
      {isNew && (
        <span className={cn(
          "text-[8px] bg-primary/20 text-primary px-1 py-0.5 rounded font-medium",
          expanded ? "absolute top-1 right-1" : "absolute right-1.5 top-1/2 -translate-y-1/2"
        )}>
          novo
        </span>
      )}
    </div>
  );
}
