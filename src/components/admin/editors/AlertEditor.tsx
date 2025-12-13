import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus } from 'lucide-react';
import { EditorProps } from './types';
import { ComponentIdDisplay } from './shared';

export function AlertComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Conteúdo */}
      <div>
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <RichTextInput
          value={config.content || ''}
          onChange={(v) => updateConfig({ content: v })}
          placeholder="Texto do alerta..."
          minHeight="80px"
          showBorder
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Configurações avançadas em breve
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
