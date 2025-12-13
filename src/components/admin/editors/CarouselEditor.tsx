import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CarouselItemEditor } from '../CarouselItemEditor';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

interface CarouselItem {
  id: string;
  image: string;
  description: string;
}

export function CarouselComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  const items: CarouselItem[] = config.carouselItems || [
    { id: '1', image: '', description: 'Descrição do slide 1' }
  ];

  const addItem = () => {
    const newItem: CarouselItem = {
      id: crypto.randomUUID(),
      image: '',
      description: 'Descrição do slide'
    };
    updateConfig({ carouselItems: [...items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<CarouselItem>) => {
    updateConfig({
      carouselItems: items.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    });
  };

  const removeItem = (id: string) => {
    updateConfig({ carouselItems: items.filter(item => item.id !== id) });
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...items];
    const [removed] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, removed);
    updateConfig({ carouselItems: newItems });
  };

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <Label className="text-xs text-muted-foreground">Layout</Label>
        <Select
          value={config.carouselLayout || 'image-text'}
          onValueChange={(v) => updateConfig({ carouselLayout: v as 'image-text' | 'text-only' | 'image-only' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image-text">Imagem e Texto</SelectItem>
            <SelectItem value="text-only">Apenas Texto</SelectItem>
            <SelectItem value="image-only">Apenas Imagem</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Proporção da imagem */}
      {config.carouselLayout !== 'text-only' && (
        <div>
          <Label className="text-xs text-muted-foreground">Proporção da imagem</Label>
          <Select
            value={config.carouselImageRatio || '16:9'}
            onValueChange={(v) => updateConfig({ carouselImageRatio: v as any })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
              <SelectItem value="4:3">4:3</SelectItem>
              <SelectItem value="16:9">16:9 (Padrão)</SelectItem>
              <SelectItem value="3:2">3:2</SelectItem>
              <SelectItem value="2:3">2:3 (Retrato)</SelectItem>
              <SelectItem value="9:16">9:16 (Stories)</SelectItem>
              <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Opções */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Paginação</Label>
          <Switch
            checked={config.carouselPagination ?? true}
            onCheckedChange={(v) => updateConfig({ carouselPagination: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Borda</Label>
          <Switch
            checked={config.carouselBorder ?? false}
            onCheckedChange={(v) => updateConfig({ carouselBorder: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Autoplay</Label>
          <Switch
            checked={config.carouselAutoplay ?? false}
            onCheckedChange={(v) => updateConfig({ carouselAutoplay: v })}
          />
        </div>
        {config.carouselAutoplay && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground flex-1">Intervalo</Label>
            <Input
              type="number"
              value={config.carouselAutoplayInterval ?? 3}
              onChange={(e) => updateConfig({ carouselAutoplayInterval: parseInt(e.target.value) || 3 })}
              min={1}
              max={30}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">(seg.)</span>
          </div>
        )}
      </div>

      {/* Items */}
      <div>
        <Label className="text-xs text-muted-foreground">Itens</Label>
        <div className="space-y-3 mt-2">
          {items.map((item, index) => (
            <CarouselItemEditor
              key={item.id}
              item={item}
              index={index}
              totalItems={items.length}
              layout={config.carouselLayout || 'image-text'}
              onUpdate={(updates) => updateItem(item.id, updates)}
              onRemove={() => removeItem(item.id)}
              onMoveUp={() => index > 0 && moveItem(index, index - 1)}
              onMoveDown={() => index < items.length - 1 && moveItem(index, index + 1)}
            />
          ))}
          <Button
            variant="ghost"
            className="w-full"
            onClick={addItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            adicionar
          </Button>
        </div>
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
