import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

export function ScriptComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      <div>
        <Label className="text-xs text-muted-foreground">Código de incorporação</Label>
        <textarea
          value={config.scriptCode || ''}
          onChange={(e) => updateConfig({ scriptCode: e.target.value })}
          placeholder={'<script>console.log("custom script")</script>'}
          className="mt-1 w-full h-32 px-3 py-2 bg-[#1e1e2e] text-emerald-400 font-mono text-xs rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground">Descrição (opcional)</Label>
        <Input
          value={config.scriptDescription || ''}
          onChange={(e) => updateConfig({ scriptDescription: e.target.value })}
          placeholder="Ex: Pixel do Facebook, Google Analytics..."
          className="mt-1"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Cole aqui scripts de rastreamento, pixels ou qualquer código HTML/JavaScript.
      </p>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Configurações avançadas disponíveis em breve.
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
