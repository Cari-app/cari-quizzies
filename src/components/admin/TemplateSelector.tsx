import { screenTemplates } from '@/data/screenTemplates';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TemplateSelectorProps {
  onSelect: (template: typeof screenTemplates[0]) => void;
  onClose: () => void;
}

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Escolha um modelo</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {screenTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="flex flex-col items-center p-4 border border-border rounded-lg hover:border-foreground/30 hover:bg-accent/50 transition-all text-center group"
              >
                <div className="w-full aspect-[3/4] bg-muted rounded-md mb-3 flex items-center justify-center border border-border group-hover:border-foreground/20">
                  <div className="text-3xl">{template.icon}</div>
                </div>
                <span className="text-sm font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{template.description}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}