import { Label } from '@/components/ui/label';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

interface TextEditorProps extends EditorProps {}

export function TextComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId 
}: TextEditorProps) {
  return (
    <div className="space-y-4">
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />
      <div>
        <Label className="text-xs text-muted-foreground">Conteúdo</Label>
        <RichTextInput
          value={config.content || ''}
          onChange={(content) => updateConfig({ content })}
          placeholder="Digite o texto aqui..."
          className="mt-1"
          minHeight="100px"
        />
      </div>
    </div>
  );
}
