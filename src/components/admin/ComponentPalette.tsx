import { componentPalette } from '@/data/screenTemplates';

export function ComponentPalette() {
  return (
    <div className="space-y-4">
      {/* Formulário */}
      <div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
          Formulário
        </span>
        <div className="grid grid-cols-2 gap-1">
          {componentPalette.form.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 p-2 text-xs rounded border border-border hover:bg-accent/50 transition-colors text-left"
              draggable
            >
              <span>{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
          Quiz
        </span>
        <div className="grid grid-cols-2 gap-1">
          {componentPalette.quiz.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 p-2 text-xs rounded border border-border hover:bg-accent/50 transition-colors text-left"
              draggable
            >
              <span>{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mídia e conteúdo */}
      <div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
          Mídia e conteúdo
        </span>
        <div className="grid grid-cols-2 gap-1">
          {componentPalette.media.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 p-2 text-xs rounded border border-border hover:bg-accent/50 transition-colors text-left"
              draggable
            >
              <span>{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}