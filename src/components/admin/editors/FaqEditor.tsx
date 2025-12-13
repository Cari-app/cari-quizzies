import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Trash2, GripVertical, Copy } from 'lucide-react';
import { EditorProps, ComponentConfig, FaqItem } from './types';
import { ComponentIdDisplay } from './shared';

export function FaqComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  const faqItems: FaqItem[] = config.faqItems || [];
  const [stylingOpen, setStylingOpen] = useState(false);

  const addFaq = () => {
    const newItem: FaqItem = {
      id: crypto.randomUUID(),
      question: 'Qual a primeira dúvida a ser resolvida?',
      answer: 'Este é apenas um texto de exemplo utilizado para ilustrar como a resposta de uma dúvida frequente será exibida nesta seção.',
    };
    updateConfig({ faqItems: [...faqItems, newItem] });
  };

  const updateFaq = (id: string, updates: Partial<FaqItem>) => {
    const newItems = faqItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateConfig({ faqItems: newItems });
  };

  const removeFaq = (id: string) => {
    updateConfig({ faqItems: faqItems.filter(item => item.id !== id) });
  };

  const duplicateFaq = (item: FaqItem) => {
    const newItem: FaqItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    const index = faqItems.findIndex(f => f.id === item.id);
    const newItems = [...faqItems];
    newItems.splice(index + 1, 0, newItem);
    updateConfig({ faqItems: newItems });
  };

  return (
    <div className="space-y-4">
      {/* Perguntas */}
      <div className="border border-border rounded-lg p-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Perguntas</Label>
        
        <div className="space-y-3">
          {faqItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-3 bg-muted/30 group"
            >
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-2">
                  {/* Question - RichText */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Pergunta</Label>
                    <RichTextInput
                      value={item.question}
                      onChange={(v) => updateFaq(item.id, { question: v })}
                      placeholder="Pergunta"
                      minHeight="50px"
                      showBorder
                    />
                  </div>
                  {/* Answer - RichText */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Resposta</Label>
                    <RichTextInput
                      value={item.answer}
                      onChange={(v) => updateFaq(item.id, { answer: v })}
                      placeholder="Resposta..."
                      minHeight="80px"
                      showBorder
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => duplicateFaq(item)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeFaq(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add FAQ button */}
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={addFaq}
        >
          <Plus className="w-4 h-4 mr-2" />
          adicionar pergunta
        </Button>
      </div>

      {/* Opções */}
      <div className="border border-border rounded-lg p-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Opções</Label>
        <div className="flex items-center gap-2">
          <Switch
            id="faqFirstOpen"
            checked={config.faqFirstOpen !== false}
            onCheckedChange={(checked) => updateConfig({ faqFirstOpen: checked })}
          />
          <Label htmlFor="faqFirstOpen" className="text-sm cursor-pointer">Primeira pergunta ativa</Label>
        </div>
      </div>

      {/* Estilização */}
      <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
        <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Plus className={`w-4 h-4 transition-transform ${stylingOpen ? 'rotate-45' : ''}`} />
          ESTILIZAÇÃO
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4 border border-border rounded-lg p-3 mt-2">
          {/* Background Type */}
          <div>
            <Label className="text-xs text-muted-foreground">Tipo de fundo</Label>
            <Select 
              value={config.faqBgType || 'solid'} 
              onValueChange={(v) => updateConfig({ faqBgType: v as ComponentConfig['faqBgType'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Cor sólida</SelectItem>
                <SelectItem value="gradient">Gradiente</SelectItem>
                <SelectItem value="transparent">Transparente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Solid Background Color */}
          {config.faqBgType === 'solid' && (
            <div>
              <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqBgColor || '#ffffff' }}>
                  <input
                    type="color"
                    value={config.faqBgColor || '#ffffff'}
                    onChange={(e) => updateConfig({ faqBgColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.faqBgColor || ''}
                  onChange={(e) => updateConfig({ faqBgColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Gradient Colors */}
          {config.faqBgType === 'gradient' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                  <div className="flex gap-1 mt-1">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqGradientStart || '#ffffff' }}>
                      <input
                        type="color"
                        value={config.faqGradientStart || '#ffffff'}
                        onChange={(e) => updateConfig({ faqGradientStart: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.faqGradientStart || ''}
                      onChange={(e) => updateConfig({ faqGradientStart: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cor final</Label>
                  <div className="flex gap-1 mt-1">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqGradientEnd || '#f0f0f0' }}>
                      <input
                        type="color"
                        value={config.faqGradientEnd || '#f0f0f0'}
                        onChange={(e) => updateConfig({ faqGradientEnd: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.faqGradientEnd || ''}
                      onChange={(e) => updateConfig({ faqGradientEnd: e.target.value })}
                      placeholder="#f0f0f0"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ângulo do gradiente: {config.faqGradientAngle || 180}°</Label>
                <Slider
                  value={[config.faqGradientAngle || 180]}
                  onValueChange={([v]) => updateConfig({ faqGradientAngle: v })}
                  min={0}
                  max={360}
                  step={15}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Text Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cor do título</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqTextColor || '#000000' }}>
                  <input
                    type="color"
                    value={config.faqTextColor || '#000000'}
                    onChange={(e) => updateConfig({ faqTextColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.faqTextColor || ''}
                  onChange={(e) => updateConfig({ faqTextColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cor da resposta</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqAnswerColor || '#666666' }}>
                  <input
                    type="color"
                    value={config.faqAnswerColor || '#666666'}
                    onChange={(e) => updateConfig({ faqAnswerColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.faqAnswerColor || ''}
                  onChange={(e) => updateConfig({ faqAnswerColor: e.target.value })}
                  placeholder="#666666"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Icon Color */}
          <div>
            <Label className="text-xs text-muted-foreground">Cor do ícone</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqIconColor || '#000000' }}>
                <input
                  type="color"
                  value={config.faqIconColor || '#000000'}
                  onChange={(e) => updateConfig({ faqIconColor: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={config.faqIconColor || ''}
                onChange={(e) => updateConfig({ faqIconColor: e.target.value })}
                placeholder="#000000"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cor da borda</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.faqBorderColor || '#e5e5e5' }}>
                  <input
                    type="color"
                    value={config.faqBorderColor || '#e5e5e5'}
                    onChange={(e) => updateConfig({ faqBorderColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.faqBorderColor || ''}
                  onChange={(e) => updateConfig({ faqBorderColor: e.target.value })}
                  placeholder="#e5e5e5"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Espessura</Label>
              <Input
                type="number"
                value={config.faqBorderWidth ?? 1}
                onChange={(e) => updateConfig({ faqBorderWidth: parseInt(e.target.value) || 0 })}
                min={0}
                max={10}
                className="mt-1"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              value={config.faqBorderRadius ?? 8}
              onChange={(e) => updateConfig({ faqBorderRadius: parseInt(e.target.value) || 0 })}
              min={0}
              max={50}
              className="mt-1"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

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
