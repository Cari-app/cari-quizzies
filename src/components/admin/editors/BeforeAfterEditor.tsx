import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Plus, Upload, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import { ComponentIdDisplay } from './shared';
import { EditorProps } from './types';

export function BeforeAfterComponentTab({ 
  component, 
  config, 
  updateConfig, 
  onUpdateCustomId,
  advancedOpen,
  setAdvancedOpen 
}: EditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [activeImageSlot, setActiveImageSlot] = useState<'before' | 'after'>('before');

  const handleSelectImage = (url: string) => {
    if (activeImageSlot === 'before') {
      updateConfig({ beforeAfterImage1: url });
    } else {
      updateConfig({ beforeAfterImage2: url });
    }
  };

  return (
    <div className="space-y-4">
      {/* Imagem Antes */}
      <div>
        <Label className="text-xs text-muted-foreground">Imagem "Antes"</Label>
        <div className="mt-1">
          {config.beforeAfterImage1 ? (
            <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden">
              <img 
                src={config.beforeAfterImage1} 
                alt="Antes" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => updateConfig({ beforeAfterImage1: '' })}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setActiveImageSlot('before');
                setMediaPickerOpen(true);
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar imagem
            </Button>
          )}
        </div>
      </div>

      {/* Imagem Depois */}
      <div>
        <Label className="text-xs text-muted-foreground">Imagem "Depois"</Label>
        <div className="mt-1">
          {config.beforeAfterImage2 ? (
            <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden">
              <img 
                src={config.beforeAfterImage2} 
                alt="Depois" 
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => updateConfig({ beforeAfterImage2: '' })}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setActiveImageSlot('after');
                setMediaPickerOpen(true);
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar imagem
            </Button>
          )}
        </div>
      </div>

      {/* Posição inicial */}
      <div>
        <Label className="text-xs text-muted-foreground">Posição inicial ({config.beforeAfterInitialPosition ?? 50}%)</Label>
        <Slider
          value={[config.beforeAfterInitialPosition ?? 50]}
          onValueChange={([v]) => updateConfig({ beforeAfterInitialPosition: v })}
          min={0}
          max={100}
          step={5}
          className="mt-2"
        />
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

      <MediaLibraryPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={handleSelectImage}
        currentValue={activeImageSlot === 'before' ? config.beforeAfterImage1 : config.beforeAfterImage2}
      />
    </div>
  );
}
