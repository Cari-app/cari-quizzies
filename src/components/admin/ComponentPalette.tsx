import { componentPalette } from '@/data/screenTemplates';

export function ComponentPalette() {
  return (
    <div className="space-y-4">
      {/* Formulário */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block px-1">
          Formulário
        </span>
        <div className="space-y-1">
          {componentPalette.form.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full"
              draggable
            >
              <span className="text-base">{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quiz */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block px-1">
          Quiz
        </span>
        <div className="space-y-1">
          {componentPalette.quiz.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full"
              draggable
            >
              <span className="text-base">{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mídia e conteúdo */}
      <div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block px-1">
          Mídia e conteúdo
        </span>
        <div className="space-y-1">
          {componentPalette.media.map((comp) => (
            <button
              key={comp.type}
              className="flex items-center gap-2 px-2 py-2 text-xs rounded-md border border-border hover:bg-accent/50 transition-colors text-left w-full"
              draggable
            >
              <span className="text-base">{comp.icon}</span>
              <span className="truncate">{comp.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}