import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

export interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
}

export interface ComponentConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  // Input specific
  inputType?: 'text' | 'email' | 'tel' | 'number' | 'date';
  mask?: string;
  minLength?: number;
  maxLength?: number;
  // Button specific
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  buttonAction?: 'next' | 'submit' | 'link';
  buttonLink?: string;
  // Options specific
  options?: Array<{ id: string; text: string; value: string }>;
  allowMultiple?: boolean;
  // Text/Media specific
  content?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  // Image/Video
  mediaUrl?: string;
  altText?: string;
  // Spacer
  height?: number;
}

interface ComponentEditorProps {
  component: DroppedComponent;
  onUpdate: (config: ComponentConfig) => void;
  onDelete: () => void;
}

export function ComponentEditor({ component, onUpdate, onDelete }: ComponentEditorProps) {
  const config = component.config || {};

  const updateConfig = (updates: Partial<ComponentConfig>) => {
    onUpdate({ ...config, ...updates });
  };

  const addOption = () => {
    const currentOptions = config.options || [];
    updateConfig({
      options: [
        ...currentOptions,
        { id: Date.now().toString(), text: `Opção ${currentOptions.length + 1}`, value: `opt_${currentOptions.length + 1}` }
      ]
    });
  };

  const updateOption = (id: string, text: string) => {
    const options = (config.options || []).map(opt => 
      opt.id === id ? { ...opt, text } : opt
    );
    updateConfig({ options });
  };

  const removeOption = (id: string) => {
    updateConfig({
      options: (config.options || []).filter(opt => opt.id !== id)
    });
  };

  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Label</Label>
        <Input
          value={config.label || ''}
          onChange={(e) => updateConfig({ label: e.target.value })}
          placeholder="Ex: Qual seu nome?"
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Placeholder</Label>
        <Input
          value={config.placeholder || ''}
          onChange={(e) => updateConfig({ placeholder: e.target.value })}
          placeholder="Ex: Digite seu nome..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Texto de ajuda</Label>
        <Input
          value={config.helpText || ''}
          onChange={(e) => updateConfig({ helpText: e.target.value })}
          placeholder="Ex: Usaremos para personalizar..."
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm">Campo obrigatório</span>
        <Switch 
          checked={config.required || false}
          onCheckedChange={(checked) => updateConfig({ required: checked })}
        />
      </div>
    </div>
  );

  const renderInputSpecific = () => {
    if (['input', 'email', 'phone', 'number', 'date', 'textarea', 'height', 'weight'].includes(component.type)) {
      return (
        <div className="space-y-4 mt-4">
          {component.type === 'number' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Mín. caracteres</Label>
                  <Input
                    type="number"
                    value={config.minLength || ''}
                    onChange={(e) => updateConfig({ minLength: parseInt(e.target.value) || undefined })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Máx. caracteres</Label>
                  <Input
                    type="number"
                    value={config.maxLength || ''}
                    onChange={(e) => updateConfig({ maxLength: parseInt(e.target.value) || undefined })}
                    className="mt-1"
                  />
                </div>
              </div>
            </>
          )}
          {component.type === 'phone' && (
            <div>
              <Label className="text-xs">Máscara</Label>
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
        </div>
      );
    }
    return null;
  };

  const renderButtonConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Texto do botão</Label>
        <Input
          value={config.buttonText || 'Continuar'}
          onChange={(e) => updateConfig({ buttonText: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Estilo</Label>
        <Select value={config.buttonStyle || 'primary'} onValueChange={(v) => updateConfig({ buttonStyle: v as ComponentConfig['buttonStyle'] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Primário</SelectItem>
            <SelectItem value="secondary">Secundário</SelectItem>
            <SelectItem value="outline">Outline</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Ação</Label>
        <Select value={config.buttonAction || 'next'} onValueChange={(v) => updateConfig({ buttonAction: v as ComponentConfig['buttonAction'] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="next">Próxima etapa</SelectItem>
            <SelectItem value="submit">Enviar formulário</SelectItem>
            <SelectItem value="link">Abrir link</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {config.buttonAction === 'link' && (
        <div>
          <Label className="text-xs">URL do link</Label>
          <Input
            value={config.buttonLink || ''}
            onChange={(e) => updateConfig({ buttonLink: e.target.value })}
            placeholder="https://..."
            className="mt-1"
          />
        </div>
      )}
    </div>
  );

  const renderOptionsConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Título da pergunta</Label>
        <Input
          value={config.label || ''}
          onChange={(e) => updateConfig({ label: e.target.value })}
          placeholder="Ex: Qual sua preferência?"
          className="mt-1"
        />
      </div>
      
      {['multiple', 'options'].includes(component.type) && (
        <div className="flex items-center justify-between">
          <span className="text-sm">Permitir múltiplas seleções</span>
          <Switch 
            checked={config.allowMultiple || component.type === 'multiple'}
            onCheckedChange={(checked) => updateConfig({ allowMultiple: checked })}
          />
        </div>
      )}
      
      <div>
        <Label className="text-xs mb-2 block">Opções</Label>
        <div className="space-y-2">
          {(config.options || [{ id: '1', text: 'Opção 1', value: 'opt1' }, { id: '2', text: 'Opção 2', value: 'opt2' }]).map((opt) => (
            <div key={opt.id} className="flex gap-2">
              <Input
                value={opt.text}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => removeOption(opt.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addOption} className="w-full mt-2">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar opção
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm">Obrigatório</span>
        <Switch 
          checked={config.required || false}
          onCheckedChange={(checked) => updateConfig({ required: checked })}
        />
      </div>
    </div>
  );

  const renderTextConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Conteúdo</Label>
        <Textarea
          value={config.content || ''}
          onChange={(e) => updateConfig({ content: e.target.value })}
          placeholder="Digite o texto aqui..."
          className="mt-1 min-h-[100px]"
        />
      </div>
      <div>
        <Label className="text-xs">Alinhamento</Label>
        <Select value={config.textAlign || 'left'} onValueChange={(v) => updateConfig({ textAlign: v as ComponentConfig['textAlign'] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Esquerda</SelectItem>
            <SelectItem value="center">Centro</SelectItem>
            <SelectItem value="right">Direita</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs">Tamanho da fonte</Label>
        <Select value={config.fontSize || 'base'} onValueChange={(v) => updateConfig({ fontSize: v as ComponentConfig['fontSize'] })}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Pequeno</SelectItem>
            <SelectItem value="base">Normal</SelectItem>
            <SelectItem value="lg">Grande</SelectItem>
            <SelectItem value="xl">Extra grande</SelectItem>
            <SelectItem value="2xl">Título</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderMediaConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">URL da mídia</Label>
        <Input
          value={config.mediaUrl || ''}
          onChange={(e) => updateConfig({ mediaUrl: e.target.value })}
          placeholder="https://..."
          className="mt-1"
        />
      </div>
      <div>
        <Label className="text-xs">Texto alternativo</Label>
        <Input
          value={config.altText || ''}
          onChange={(e) => updateConfig({ altText: e.target.value })}
          placeholder="Descrição da imagem..."
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderSpacerConfig = () => (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Altura (px)</Label>
        <Input
          type="number"
          value={config.height || 24}
          onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 24 })}
          className="mt-1"
        />
      </div>
    </div>
  );

  const renderConfigByType = () => {
    switch (component.type) {
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'date':
      case 'textarea':
      case 'height':
      case 'weight':
        return (
          <>
            {renderFormFields()}
            {renderInputSpecific()}
          </>
        );
      case 'button':
        return renderButtonConfig();
      case 'options':
      case 'single':
      case 'multiple':
      case 'yesno':
        return renderOptionsConfig();
      case 'text':
        return renderTextConfig();
      case 'image':
      case 'video':
      case 'audio':
        return renderMediaConfig();
      case 'spacer':
        return renderSpacerConfig();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Configuração para "{component.name}" em breve
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <span className="text-2xl">{component.icon}</span>
        <div className="flex-1">
          <h3 className="font-medium text-sm">{component.name}</h3>
          <p className="text-xs text-muted-foreground capitalize">{component.type}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Config Fields */}
      {renderConfigByType()}
    </div>
  );
}
