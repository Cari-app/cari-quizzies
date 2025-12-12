import { componentPalette } from '@/data/screenTemplates';

const categories = [
  { key: 'form', label: 'Formulário' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'media', label: 'Mídia e conteúdo' },
  { key: 'attention', label: 'Atenção' },
  { key: 'argumentation', label: 'Argumentação' },
  { key: 'charts', label: 'Gráficos' },
  { key: 'customization', label: 'Personalização' },
] as const;

export function ComponentPalette() {
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
            <div className="space-y-1">
              {items.map((comp) => (
                <button
                  key={comp.type}
                  className="flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full relative"
                  draggable
                >
                  <span className="text-base">{comp.icon}</span>
                  <span className="truncate">{comp.name}</span>
                  {'isNew' in comp && comp.isNew && (
                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
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