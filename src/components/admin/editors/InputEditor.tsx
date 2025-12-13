import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Plus } from 'lucide-react';
import { ComponentIdDisplay } from './shared';
import { EditorProps, ComponentConfig, generateSlug } from './types';

interface InputEditorProps extends EditorProps {}

export function InputComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: InputEditorProps) {
  return (
    <div className="space-y-4">
      {/* ID/Name */}
      <ComponentIdDisplay
        id={component.id}
        customId={component.customId}
        type={component.type}
        onUpdateCustomId={onUpdateCustomId}
      />

      {/* Título/Label */}
      <div>
        <Label className="text-xs text-muted-foreground">Título</Label>
        <RichTextInput
          value={config.label || ''}
          onChange={(label) => updateConfig({ label })}
          placeholder="Ex: Nome"
          className="mt-1"
        />
      </div>

      {/* Campo obrigatório */}
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="required" 
          checked={config.required || false}
          onChange={(e) => updateConfig({ required: e.target.checked })}
          className="rounded border-border"
        />
        <Label htmlFor="required" className="text-sm cursor-pointer">Campo obrigatório</Label>
      </div>

      {/* Tipo */}
      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select 
          value={config.inputType || 'text'} 
          onValueChange={(v) => updateConfig({ inputType: v as ComponentConfig['inputType'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Texto</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="tel">Telefone</SelectItem>
            <SelectItem value="number">Número</SelectItem>
            <SelectItem value="date">Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Placeholder */}
      <div>
        <Label className="text-xs text-muted-foreground">Placeholder</Label>
        <Input
          value={config.placeholder || ''}
          onChange={(e) => updateConfig({ placeholder: e.target.value })}
          placeholder="Digite seu nome..."
          className="mt-1"
        />
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${advancedOpen ? 'rotate-45' : ''}`} />
          AVANÇADO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground">Texto de ajuda</Label>
            <Input
              value={config.helpText || ''}
              onChange={(e) => updateConfig({ helpText: e.target.value })}
              placeholder="Ex: Usaremos para personalizar..."
              className="mt-1"
            />
          </div>
          {component.type === 'phone' && (
            <div>
              <Label className="text-xs text-muted-foreground">Máscara</Label>
              <Select value={config.mask || 'br'} onValueChange={(v) => updateConfig({ mask: v })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="br">(00) 00000-0000</SelectItem>
                  <SelectItem value="us">(000) 000-0000</SelectItem>
                  <SelectItem value="intl">+00 00 00000-0000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {['number', 'input', 'textarea'].includes(component.type) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Mín. caracteres</Label>
                <Input
                  type="number"
                  value={config.minLength || ''}
                  onChange={(e) => updateConfig({ minLength: parseInt(e.target.value) || undefined })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Máx. caracteres</Label>
                <Input
                  type="number"
                  value={config.maxLength || ''}
                  onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) || undefined })}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
