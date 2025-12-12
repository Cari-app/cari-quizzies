import { componentPalette } from '@/data/screenTemplates';
import { cn } from '@/lib/utils';
import { DraggableComponent } from './DraggableComponent';

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
                <DraggableComponent
                  key={comp.type}
                  type={comp.type}
                  name={comp.name}
                  icon={comp.icon}
                  isNew={'isNew' in comp ? (comp.isNew as boolean) : undefined}
                  expanded={expanded}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}