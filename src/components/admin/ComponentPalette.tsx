import { componentPalette } from '@/data/screenTemplates';
import { cn } from '@/lib/utils';

const categories = [
  { key: 'form', label: 'Formulário' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'media', label: 'Mídia e conteúdo' },
  { key: 'attention', label: 'Atenção' },
  { key: 'argumentation', label: 'Argumentação' },
  { key: 'charts', label: 'Gráficos' },
  { key: 'customization', label: 'Personalização' },
] as const;

interface ComponentPaletteProps {
  expanded?: boolean;
}

export function ComponentPalette({ expanded = false }: ComponentPaletteProps) {
  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const items = componentPalette[category.key];
        if (!items || items.length === 0) return null;

        return (
          <div key={category.key}>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block px-1">
              {category.label}
            </span>
            <div className={cn(
              expanded ? "grid grid-cols-2 gap-1.5" : "space-y-1"
            )}>
              {items.map((comp) => (
                <button
                  key={comp.type}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full relative",
                    expanded && "flex-col gap-1 py-3 justify-center"
                  )}
                  draggable
                >
                  <span className={cn("text-base", expanded && "text-xl")}>{comp.icon}</span>
                  <span className={cn("truncate", expanded && "text-center text-[10px]")}>{comp.name}</span>
                  {'isNew' in comp && comp.isNew && (
                    <span className={cn(
                      "text-[8px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-medium",
                      expanded ? "absolute top-1 right-1" : "absolute right-1.5 top-1/2 -translate-y-1/2"
                    )}>
                      novo
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}