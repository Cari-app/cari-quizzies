import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

export function TimerComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  return (
    <div className="space-y-4">
      {/* Duração */}
      <div>
        <Label className="text-xs text-muted-foreground">Duração (segundos)</Label>
        <Input
          type="number"
          value={config.timerSeconds ?? 60}
          onChange={(e) => updateConfig({ timerSeconds: parseInt(e.target.value) || 60 })}
          min={1}
          className="mt-1"
        />
      </div>

      {/* Texto */}
      <div>
        <Label className="text-xs text-muted-foreground">Texto</Label>
        <RichTextInput
          value={config.timerText || ''}
          onChange={(v) => updateConfig({ timerText: v })}
          placeholder="Texto ao lado do timer..."
          className="mt-1"
          minHeight="60px"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type={component.type}
            onUpdateCustomId={onUpdateCustomId}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
