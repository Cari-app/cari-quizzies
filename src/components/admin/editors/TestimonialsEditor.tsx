import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RichTextInput } from '@/components/ui/rich-text-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import { Plus, Trash2, GripVertical, Star, Copy, Image } from 'lucide-react';
import { EditorProps, ComponentConfig, TestimonialItem } from './types';
import { ComponentIdDisplay } from './shared';

export function TestimonialsComponentTab({ component, config, updateConfig, onUpdateCustomId, advancedOpen, setAdvancedOpen }: EditorProps) {
  const testimonialItems: TestimonialItem[] = config.testimonialItems || [];
  const [stylingOpen, setStylingOpen] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<{ itemId: string; type: 'avatar' | 'photo' } | null>(null);

  const addTestimonial = () => {
    const newItem: TestimonialItem = {
      id: crypto.randomUUID(),
      name: 'Nome do Cliente',
      handle: '@cliente',
      rating: 5,
      text: 'Este produto mudou minha vida! Recomendo muito.',
    };
    updateConfig({ testimonialItems: [...testimonialItems, newItem] });
  };

  const updateTestimonial = (id: string, updates: Partial<TestimonialItem>) => {
    const newItems = testimonialItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateConfig({ testimonialItems: newItems });
  };

  const removeTestimonial = (id: string) => {
    updateConfig({ testimonialItems: testimonialItems.filter(item => item.id !== id) });
  };

  const duplicateTestimonial = (item: TestimonialItem) => {
    const newItem: TestimonialItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    const index = testimonialItems.findIndex(t => t.id === item.id);
    const newItems = [...testimonialItems];
    newItems.splice(index + 1, 0, newItem);
    updateConfig({ testimonialItems: newItems });
  };

  const handleMediaSelect = (url: string) => {
    if (mediaPickerTarget) {
      if (mediaPickerTarget.type === 'avatar') {
        updateTestimonial(mediaPickerTarget.itemId, { avatarUrl: url });
      } else {
        updateTestimonial(mediaPickerTarget.itemId, { photoUrl: url });
      }
    }
    setMediaPickerTarget(null);
  };

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select 
          value={config.testimonialLayout || 'list'} 
          onValueChange={(v) => updateConfig({ testimonialLayout: v as ComponentConfig['testimonialLayout'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">Lista</SelectItem>
            <SelectItem value="grid-2">Grade de 2 colunas</SelectItem>
            <SelectItem value="carousel">Carrossel</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Depoimentos */}
      <div className="border border-border rounded-lg p-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-3 block">Depoimentos</Label>
        
        <div className="space-y-3">
          {testimonialItems.map((item) => (
            <div
              key={item.id}
              className="border border-border rounded-lg p-3 bg-muted/30 group"
            >
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0 cursor-grab" />
                <div className="flex-1 space-y-2">
                  {/* Avatar & Photo */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget({ itemId: item.id, type: 'avatar' });
                        setMediaPickerOpen(true);
                      }}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors overflow-hidden"
                    >
                      {item.avatarUrl ? (
                        <img src={item.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMediaPickerTarget({ itemId: item.id, type: 'photo' });
                        setMediaPickerOpen(true);
                      }}
                      className="w-20 h-12 rounded border-2 border-dashed border-border flex items-center justify-center bg-muted hover:bg-muted/80 transition-colors overflow-hidden"
                    >
                      {item.photoUrl ? (
                        <img src={item.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-muted-foreground">Foto</span>
                      )}
                    </button>
                  </div>

                  {/* Nome e Handle */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Nome</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateTestimonial(item.id, { name: e.target.value })}
                        placeholder="Nome"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">@handle</Label>
                      <Input
                        value={item.handle}
                        onChange={(e) => updateTestimonial(item.id, { handle: e.target.value })}
                        placeholder="@handle"
                        className="h-8"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Avaliação</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateTestimonial(item.id, { rating: star })}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-5 h-5 ${star <= item.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Texto */}
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Depoimento</Label>
                    <RichTextInput
                      value={item.text}
                      onChange={(v) => updateTestimonial(item.id, { text: v })}
                      placeholder="Depoimento..."
                      minHeight="60px"
                      showBorder
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => duplicateTestimonial(item)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => removeTestimonial(item.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Testimonial button */}
        <Button
          variant="outline"
          className="w-full mt-3"
          onClick={addTestimonial}
        >
          <Plus className="w-4 h-4 mr-2" />
          adicionar depoimento
        </Button>
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
              value={config.testimonialBgType || 'solid'} 
              onValueChange={(v) => updateConfig({ testimonialBgType: v as ComponentConfig['testimonialBgType'] })}
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
          {config.testimonialBgType === 'solid' && (
            <div>
              <Label className="text-xs text-muted-foreground">Cor de fundo</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialBgColor || '#ffffff' }}>
                  <input
                    type="color"
                    value={config.testimonialBgColor || '#ffffff'}
                    onChange={(e) => updateConfig({ testimonialBgColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.testimonialBgColor || ''}
                  onChange={(e) => updateConfig({ testimonialBgColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          )}

          {/* Gradient Colors */}
          {config.testimonialBgType === 'gradient' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Cor inicial</Label>
                  <div className="flex gap-1 mt-1">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialGradientStart || '#ffffff' }}>
                      <input
                        type="color"
                        value={config.testimonialGradientStart || '#ffffff'}
                        onChange={(e) => updateConfig({ testimonialGradientStart: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.testimonialGradientStart || ''}
                      onChange={(e) => updateConfig({ testimonialGradientStart: e.target.value })}
                      placeholder="#ffffff"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cor final</Label>
                  <div className="flex gap-1 mt-1">
                    <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialGradientEnd || '#f0f0f0' }}>
                      <input
                        type="color"
                        value={config.testimonialGradientEnd || '#f0f0f0'}
                        onChange={(e) => updateConfig({ testimonialGradientEnd: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <Input
                      value={config.testimonialGradientEnd || ''}
                      onChange={(e) => updateConfig({ testimonialGradientEnd: e.target.value })}
                      placeholder="#f0f0f0"
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ângulo do gradiente: {config.testimonialGradientAngle || 180}°</Label>
                <Slider
                  value={[config.testimonialGradientAngle || 180]}
                  onValueChange={([v]) => updateConfig({ testimonialGradientAngle: v })}
                  min={0}
                  max={360}
                  step={15}
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* Star Color */}
          <div>
            <Label className="text-xs text-muted-foreground">Cor das estrelas</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialStarColor || '#000000' }}>
                <input
                  type="color"
                  value={config.testimonialStarColor || '#000000'}
                  onChange={(e) => updateConfig({ testimonialStarColor: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={config.testimonialStarColor || ''}
                onChange={(e) => updateConfig({ testimonialStarColor: e.target.value })}
                placeholder="#000000"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Text Colors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cor do nome</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialNameColor || '#000000' }}>
                  <input
                    type="color"
                    value={config.testimonialNameColor || '#000000'}
                    onChange={(e) => updateConfig({ testimonialNameColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.testimonialNameColor || ''}
                  onChange={(e) => updateConfig({ testimonialNameColor: e.target.value })}
                  placeholder="#000000"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Cor do @handle</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialHandleColor || '#666666' }}>
                  <input
                    type="color"
                    value={config.testimonialHandleColor || '#666666'}
                    onChange={(e) => updateConfig({ testimonialHandleColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.testimonialHandleColor || ''}
                  onChange={(e) => updateConfig({ testimonialHandleColor: e.target.value })}
                  placeholder="#666666"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Cor do texto</Label>
            <div className="flex gap-2 mt-1">
              <div className="relative w-10 h-9 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialTextColor || '#333333' }}>
                <input
                  type="color"
                  value={config.testimonialTextColor || '#333333'}
                  onChange={(e) => updateConfig({ testimonialTextColor: e.target.value })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Input
                value={config.testimonialTextColor || ''}
                onChange={(e) => updateConfig({ testimonialTextColor: e.target.value })}
                placeholder="#333333"
                className="flex-1 font-mono text-xs"
              />
            </div>
          </div>

          {/* Border */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Cor da borda</Label>
              <div className="flex gap-1 mt-1">
                <div className="relative w-8 h-8 rounded border overflow-hidden cursor-pointer" style={{ backgroundColor: config.testimonialBorderColor || '#e5e5e5' }}>
                  <input
                    type="color"
                    value={config.testimonialBorderColor || '#e5e5e5'}
                    onChange={(e) => updateConfig({ testimonialBorderColor: e.target.value })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <Input
                  value={config.testimonialBorderColor || ''}
                  onChange={(e) => updateConfig({ testimonialBorderColor: e.target.value })}
                  placeholder="#e5e5e5"
                  className="flex-1 font-mono text-xs"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Espessura da borda</Label>
              <Input
                type="number"
                value={config.testimonialBorderWidth ?? 1}
                onChange={(e) => updateConfig({ testimonialBorderWidth: parseInt(e.target.value) || 0 })}
                min={0}
                max={10}
                className="mt-1"
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Select 
              value={config.testimonialBorderRadius || 'medium'} 
              onValueChange={(v) => updateConfig({ testimonialBorderRadius: v as ComponentConfig['testimonialBorderRadius'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Shadow */}
          <div>
            <Label className="text-xs text-muted-foreground">Sombra</Label>
            <Select 
              value={config.testimonialShadow || 'sm'} 
              onValueChange={(v) => updateConfig({ testimonialShadow: v as ComponentConfig['testimonialShadow'] })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma</SelectItem>
                <SelectItem value="sm">Leve</SelectItem>
                <SelectItem value="md">Média</SelectItem>
                <SelectItem value="lg">Forte</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Media Library Picker */}
      <MediaLibraryPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
