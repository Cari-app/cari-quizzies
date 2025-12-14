import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Trash2, Plus, GripVertical, Image as ImageIcon, X, Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import { ColorPicker } from './shared/ColorPicker';
import { ComponentIdDisplay, DeviceToggle } from './shared';
import type { DeviceType } from './shared';

export interface ImageButtonItem {
  id: string;
  imageUrl: string;
  buttonText: string;
  value: string;
  destination?: 'next' | 'submit' | 'specific';
  destinationStageId?: string;
}

interface ImageButtonEditorProps {
  component: { id: string; customId?: string };
  config: Record<string, any>;
  updateConfig: (updates: Record<string, any>) => void;
  onUpdateCustomId: (customId: string) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
}

export function ImageButtonComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen
}: ImageButtonEditorProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<string | null>(null);

  const items: ImageButtonItem[] = config.imageButtonItems || [];

  const addItem = () => {
    const newItem: ImageButtonItem = {
      id: crypto.randomUUID(),
      imageUrl: '',
      buttonText: `Opção ${items.length + 1}`,
      value: `opt_${items.length + 1}`,
      destination: 'next',
    };
    updateConfig({ imageButtonItems: [...items, newItem] });
    setExpandedItems([...expandedItems, newItem.id]);
  };

  const updateItem = (id: string, updates: Partial<ImageButtonItem>) => {
    const newItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateConfig({ imageButtonItems: newItems });
  };

  const removeItem = (id: string) => {
    updateConfig({ imageButtonItems: items.filter(item => item.id !== id) });
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Layout com toggle de dispositivo */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">Layout</Label>
          <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => updateConfig({ imageButtonLayoutMobile: undefined })}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md transition-colors",
                !config.imageButtonLayoutMobile 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Igual
            </button>
            <button
              type="button"
              onClick={() => updateConfig({ imageButtonLayoutMobile: config.imageButtonLayout || 'list' })}
              className={cn(
                "p-1.5 rounded-md transition-colors flex items-center gap-1",
                config.imageButtonLayoutMobile 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Configurar separadamente"
            >
              <Monitor className="w-3 h-3" />
              <span className="text-[10px]">/</span>
              <Smartphone className="w-3 h-3" />
            </button>
          </div>
        </div>
        
        {config.imageButtonLayoutMobile ? (
          <div className="space-y-2">
            {/* Desktop Layout */}
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select 
                value={config.imageButtonLayout || 'list'} 
                onValueChange={(v) => updateConfig({ imageButtonLayout: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">Lista (vertical)</SelectItem>
                  <SelectItem value="horizontal">Lado a lado</SelectItem>
                  <SelectItem value="grid-2">Grid 2 colunas</SelectItem>
                  <SelectItem value="grid-3">Grid 3 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Mobile Layout */}
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
              <Select 
                value={config.imageButtonLayoutMobile} 
                onValueChange={(v) => updateConfig({ imageButtonLayoutMobile: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="list">Lista (vertical)</SelectItem>
                  <SelectItem value="horizontal">Lado a lado</SelectItem>
                  <SelectItem value="grid-2">Grid 2 colunas</SelectItem>
                  <SelectItem value="grid-3">Grid 3 colunas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <Select 
            value={config.imageButtonLayout || 'list'} 
            onValueChange={(v) => updateConfig({ imageButtonLayout: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">Lista (vertical)</SelectItem>
              <SelectItem value="horizontal">Lado a lado</SelectItem>
              <SelectItem value="grid-2">Grid 2 colunas</SelectItem>
              <SelectItem value="grid-3">Grid 3 colunas</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Itens</Label>
        {items.map((item, index) => (
          <Collapsible 
            key={item.id} 
            open={expandedItems.includes(item.id)}
            onOpenChange={() => toggleExpanded(item.id)}
          >
            <div className="border rounded-lg overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 p-2 bg-muted/30 cursor-pointer hover:bg-muted/50">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm flex-1 truncate">{item.buttonText || `Item ${index + 1}`}</span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", expandedItems.includes(item.id) && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3 space-y-3 border-t">
                  {/* Imagem */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Imagem</Label>
                    <div className="mt-1 flex gap-2">
                      <div 
                        className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted/50 overflow-hidden"
                        onClick={() => {
                          setMediaPickerTarget(item.id);
                          setMediaPickerOpen(true);
                        }}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      {item.imageUrl && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => updateItem(item.id, { imageUrl: '' })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Texto do botão */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Texto do botão</Label>
                    <Input 
                      value={item.buttonText}
                      onChange={(e) => updateItem(item.id, { buttonText: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Valor */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor</Label>
                    <Input 
                      value={item.value}
                      onChange={(e) => updateItem(item.id, { value: e.target.value })}
                      className="mt-1 font-mono text-xs"
                    />
                  </div>

                  {/* Destino */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Destino</Label>
                    <Select 
                      value={item.destination || 'next'} 
                      onValueChange={(v) => updateItem(item.id, { destination: v as any })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="next">Próxima etapa</SelectItem>
                        <SelectItem value="submit">Enviar</SelectItem>
                        <SelectItem value="specific">Etapa específica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-destructive hover:text-destructive w-full"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
        <Button variant="outline" size="sm" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar item
        </Button>
      </div>

      {/* Avançado */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between">
            Avançado
            <ChevronDown className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <ComponentIdDisplay
            id={component.id}
            customId={component.customId}
            type="image-button"
            onUpdateCustomId={onUpdateCustomId}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Media Picker */}
      <MediaLibraryPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={(url) => {
          if (mediaPickerTarget) {
            updateItem(mediaPickerTarget, { imageUrl: url });
          }
          setMediaPickerOpen(false);
          setMediaPickerTarget(null);
        }}
      />
    </div>
  );
}

// Appearance Editor
export function ImageButtonAppearance({ config, updateConfig }: { config: Record<string, any>; updateConfig: (updates: Record<string, any>) => void }) {
  return (
    <div className="space-y-4">
      {/* Image Border Radius */}
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento da imagem</Label>
        <Slider
          value={[config.imageButtonImageRadius ?? 16]}
          onValueChange={([v]) => updateConfig({ imageButtonImageRadius: v })}
          min={0}
          max={50}
          step={1}
          className="mt-2"
        />
        <span className="text-xs text-muted-foreground">{config.imageButtonImageRadius ?? 16}px</span>
      </div>

      {/* Button position */}
      <div>
        <Label className="text-xs text-muted-foreground">Posição do botão</Label>
        <Select 
          value={config.imageButtonPosition || 'overlay'} 
          onValueChange={(v) => updateConfig({ imageButtonPosition: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overlay">Sobreposto (overlay)</SelectItem>
            <SelectItem value="below">Abaixo da imagem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button style */}
      <div>
        <Label className="text-xs text-muted-foreground">Estilo do botão</Label>
        <Select 
          value={config.imageButtonStyle || 'rounded'} 
          onValueChange={(v) => updateConfig({ imageButtonStyle: v })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rounded">Arredondado</SelectItem>
            <SelectItem value="pill">Pílula</SelectItem>
            <SelectItem value="square">Quadrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Button Colors */}
      <ColorPicker
        label="Cor de fundo do botão"
        value={config.imageButtonBgColor || '#3f3f46'}
        onChange={(v) => updateConfig({ imageButtonBgColor: v })}
        onClear={() => updateConfig({ imageButtonBgColor: undefined })}
      />

      <ColorPicker
        label="Cor do texto do botão"
        value={config.imageButtonTextColor || '#ffffff'}
        onChange={(v) => updateConfig({ imageButtonTextColor: v })}
        onClear={() => updateConfig({ imageButtonTextColor: undefined })}
      />

      {/* Arrow/Icon color */}
      <ColorPicker
        label="Cor do ícone/seta"
        value={config.imageButtonIconColor || '#ffffff'}
        onChange={(v) => updateConfig({ imageButtonIconColor: v })}
        onClear={() => updateConfig({ imageButtonIconColor: undefined })}
      />

      {/* Icon background */}
      <ColorPicker
        label="Cor de fundo do ícone"
        value={config.imageButtonIconBgColor || '#000000'}
        onChange={(v) => updateConfig({ imageButtonIconBgColor: v })}
        onClear={() => updateConfig({ imageButtonIconBgColor: undefined })}
      />

      {/* Container background */}
      <ColorPicker
        label="Cor de fundo do container"
        value={config.imageButtonContainerBgColor || 'transparent'}
        onChange={(v) => updateConfig({ imageButtonContainerBgColor: v })}
        onClear={() => updateConfig({ imageButtonContainerBgColor: undefined })}
      />

      {/* Container Border Radius */}
      <div>
        <Label className="text-xs text-muted-foreground">Arredondamento do container</Label>
        <Slider
          value={[config.imageButtonContainerRadius ?? 24]}
          onValueChange={([v]) => updateConfig({ imageButtonContainerRadius: v })}
          min={0}
          max={50}
          step={1}
          className="mt-2"
        />
        <span className="text-xs text-muted-foreground">{config.imageButtonContainerRadius ?? 24}px</span>
      </div>

      {/* Gap */}
      <div>
        <Label className="text-xs text-muted-foreground">Espaçamento entre itens</Label>
        <Slider
          value={[config.imageButtonGap ?? 16]}
          onValueChange={([v]) => updateConfig({ imageButtonGap: v })}
          min={4}
          max={48}
          step={4}
          className="mt-2"
        />
        <span className="text-xs text-muted-foreground">{config.imageButtonGap ?? 16}px</span>
      </div>
    </div>
  );
}
