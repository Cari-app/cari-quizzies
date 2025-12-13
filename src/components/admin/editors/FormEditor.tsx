import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  customId?: string;
  defaultCountry?: string;
  hideLabel?: boolean;
}

interface FormEditorProps extends EditorProps {}

const FIELD_TYPES = [
  { value: 'text', label: 'Texto' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Telefone' },
  { value: 'number', label: 'Número' },
  { value: 'date', label: 'Data' },
  { value: 'textarea', label: 'Texto longo' },
];

export function FormEditor({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: FormEditorProps) {
  const fields: FormField[] = config.formFields || [];

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'Novo campo',
      placeholder: '',
      required: false,
    };
    updateConfig({ formFields: [...fields, newField] });
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    const updatedFields = fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    );
    updateConfig({ formFields: updatedFields });
  };

  const removeField = (fieldId: string) => {
    updateConfig({ formFields: fields.filter(f => f.id !== fieldId) });
  };

  const moveField = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= fields.length) return;
    const newFields = [...fields];
    const [removed] = newFields.splice(fromIndex, 1);
    newFields.splice(toIndex, 0, removed);
    updateConfig({ formFields: newFields });
  };

  return (
    <div className="space-y-4">
      {/* ID/Name */}
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Título do formulário */}
      <div>
        <Label className="text-xs text-muted-foreground">Título do formulário</Label>
        <RichTextInput
          value={config.formTitle || ''}
          onChange={(formTitle) => updateConfig({ formTitle })}
          placeholder="Preencha seus dados"
          className="mt-1"
        />
      </div>

      {/* Lista de campos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Campos</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addField}
            className="h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Adicionar
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
            Nenhum campo adicionado
          </p>
        )}

        {fields.map((field, index) => (
          <FormFieldEditor
            key={field.id}
            field={field}
            index={index}
            totalFields={fields.length}
            onUpdate={(updates) => updateField(field.id, updates)}
            onRemove={() => removeField(field.id)}
            onMoveUp={() => moveField(index, index - 1)}
            onMoveDown={() => moveField(index, index + 1)}
          />
        ))}
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Espaçamento entre campos</Label>
            <Select 
              value={config.formSpacing || 'normal'} 
              onValueChange={(v) => updateConfig({ formSpacing: v as 'compact' | 'normal' | 'relaxed' })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Espaçado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface FormFieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function FormFieldEditor({ 
  field, 
  index, 
  totalFields,
  onUpdate, 
  onRemove,
  onMoveUp,
  onMoveDown 
}: FormFieldEditorProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-background">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <button 
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-0.5 hover:bg-accent rounded disabled:opacity-30"
          >
            <GripVertical className="w-3 h-3 rotate-180" />
          </button>
          <button 
            onClick={onMoveDown}
            disabled={index === totalFields - 1}
            className="p-0.5 hover:bg-accent rounded disabled:opacity-30"
          >
            <GripVertical className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <Input
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Nome do campo"
            className="h-8 text-sm"
          />
        </div>

        <Select 
          value={field.type} 
          onValueChange={(v) => onUpdate({ type: v as FormField['type'] })}
        >
          <SelectTrigger className="w-28 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {expanded ? '− Menos opções' : '+ Mais opções'}
      </button>

      {/* Expanded options */}
      {expanded && (
        <div className="space-y-3 pt-2 border-t">
          {/* ID personalizado */}
          <div>
            <Label className="text-xs text-muted-foreground">ID personalizado</Label>
            <Input
              value={field.customId || ''}
              onChange={(e) => onUpdate({ customId: e.target.value })}
              placeholder={field.type === 'email' ? 'email' : field.type === 'phone' ? 'telefone' : 'nome'}
              className="mt-1 h-8 text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Use para referenciar via {'{{'}id{'}}'}
            </p>
          </div>

          {/* Placeholder */}
          <div>
            <Label className="text-xs text-muted-foreground">Placeholder</Label>
            <Input
              value={field.placeholder || ''}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder="Digite aqui..."
              className="mt-1 h-8 text-sm"
            />
          </div>

          {/* Ocultar título */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id={`hideLabel-${field.id}`}
              checked={field.hideLabel || false}
              onChange={(e) => onUpdate({ hideLabel: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor={`hideLabel-${field.id}`} className="text-sm cursor-pointer">
              Ocultar título
            </Label>
          </div>

          {/* Campo obrigatório */}
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id={`required-${field.id}`}
              checked={field.required || false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor={`required-${field.id}`} className="text-sm cursor-pointer">
              Campo obrigatório
            </Label>
          </div>

          {/* País padrão (telefone) */}
          {field.type === 'phone' && (
            <div>
              <Label className="text-xs text-muted-foreground">País padrão</Label>
              <Select 
                value={field.defaultCountry || 'BR'} 
                onValueChange={(v) => onUpdate({ defaultCountry: v })}
              >
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">🇧🇷 Brasil (+55)</SelectItem>
                  <SelectItem value="US">🇺🇸 Estados Unidos (+1)</SelectItem>
                  <SelectItem value="PT">🇵🇹 Portugal (+351)</SelectItem>
                  <SelectItem value="AR">🇦🇷 Argentina (+54)</SelectItem>
                  <SelectItem value="MX">🇲🇽 México (+52)</SelectItem>
                  <SelectItem value="ES">🇪🇸 Espanha (+34)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
