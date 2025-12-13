import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, Palette, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImageInput } from '@/components/ui/image-input';

export interface StageBackground {
  type: 'color' | 'gradient' | 'image';
  // Color
  color?: string;
  // Gradient
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number;
  gradientStops?: Array<{ color: string; position: number }>;
  // Image
  imageUrl?: string;
  imageSize?: 'cover' | 'contain' | 'auto';
  imagePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  imageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  // Overlay
  overlayEnabled?: boolean;
  overlayType?: 'color' | 'gradient';
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradientType?: 'linear' | 'radial';
  overlayGradientAngle?: number;
  overlayGradientStops?: Array<{ color: string; position: number }>;
}

export const defaultStageBackground: StageBackground = {
  type: 'color',
  color: '#FFFFFF',
  gradientType: 'linear',
  gradientAngle: 180,
  gradientStops: [
    { color: '#FFFFFF', position: 0 },
    { color: '#F3F4F6', position: 100 },
  ],
  imageSize: 'cover',
  imagePosition: 'center',
  imageRepeat: 'no-repeat',
  overlayEnabled: false,
  overlayType: 'color',
  overlayColor: '#000000',
  overlayOpacity: 50,
  overlayGradientType: 'linear',
  overlayGradientAngle: 180,
  overlayGradientStops: [
    { color: '#000000', position: 0 },
    { color: 'transparent', position: 100 },
  ],
};

interface StageBackgroundEditorProps {
  background: StageBackground;
  onChange: (background: StageBackground) => void;
}

// Color picker with transparent support
function ColorPickerField({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground w-20 shrink-0">{label}</Label>
      <div className="flex items-center gap-2 flex-1">
        <div 
          className="w-8 h-8 rounded border border-border cursor-pointer relative overflow-hidden"
          style={{ 
            background: value === 'transparent' 
              ? 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 50% / 8px 8px' 
              : value 
          }}
        >
          <input
            type="color"
            value={value === 'transparent' ? '#ffffff' : value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 text-xs font-mono"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}

// Gradient stops editor
function GradientStopsEditor({
  stops,
  onChange,
}: {
  stops: Array<{ color: string; position: number }>;
  onChange: (stops: Array<{ color: string; position: number }>) => void;
}) {
  const addStop = () => {
    const newStops = [...stops, { color: '#888888', position: 50 }].sort((a, b) => a.position - b.position);
    onChange(newStops);
  };

  const updateStop = (index: number, updates: Partial<{ color: string; position: number }>) => {
    const newStops = stops.map((s, i) => i === index ? { ...s, ...updates } : s);
    onChange(newStops.sort((a, b) => a.position - b.position));
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    onChange(stops.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Cores do gradiente</Label>
        <Button variant="ghost" size="sm" onClick={addStop} className="h-6 text-xs">
          + Adicionar
        </Button>
      </div>
      <div className="space-y-2">
        {stops.map((stop, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded border border-border cursor-pointer relative overflow-hidden shrink-0"
              style={{ backgroundColor: stop.color }}
            >
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(index, { color: e.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <Input
              type="number"
              value={stop.position}
              onChange={(e) => updateStop(index, { position: Number(e.target.value) })}
              className="w-16 h-7 text-xs"
              min={0}
              max={100}
            />
            <span className="text-xs text-muted-foreground">%</span>
            {stops.length > 2 && (
              <button
                onClick={() => removeStop(index)}
                className="p-1 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function StageBackgroundEditor({ background, onChange }: StageBackgroundEditorProps) {
  const updateBackground = (updates: Partial<StageBackground>) => {
    onChange({ ...background, ...updates });
  };

  // Generate CSS for preview
  const getBackgroundStyle = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (background.type === 'color') {
      styles.backgroundColor = background.color;
    } else if (background.type === 'gradient') {
      const stops = background.gradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
      if (background.gradientType === 'linear') {
        styles.background = `linear-gradient(${background.gradientAngle}deg, ${stops})`;
      } else {
        styles.background = `radial-gradient(circle, ${stops})`;
      }
    } else if (background.type === 'image' && background.imageUrl) {
      styles.backgroundImage = `url(${background.imageUrl})`;
      styles.backgroundSize = background.imageSize;
      styles.backgroundPosition = background.imagePosition;
      styles.backgroundRepeat = background.imageRepeat;
    }

    return styles;
  };

  const getOverlayStyle = (): React.CSSProperties => {
    if (!background.overlayEnabled) return {};

    const opacity = (background.overlayOpacity || 50) / 100;

    if (background.overlayType === 'color') {
      return { 
        backgroundColor: background.overlayColor,
        opacity,
      };
    } else {
      const stops = background.overlayGradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
      if (background.overlayGradientType === 'linear') {
        return { 
          background: `linear-gradient(${background.overlayGradientAngle}deg, ${stops})`,
          opacity,
        };
      } else {
        return { 
          background: `radial-gradient(circle, ${stops})`,
          opacity,
        };
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative h-32 rounded-lg border border-border overflow-hidden">
        <div 
          className="absolute inset-0"
          style={getBackgroundStyle()}
        />
        {background.overlayEnabled && (
          <div 
            className="absolute inset-0"
            style={getOverlayStyle()}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium px-2 py-1 rounded bg-background/80 text-foreground">
            Pré-visualização
          </span>
        </div>
      </div>

      {/* Background Type */}
      <Tabs 
        value={background.type} 
        onValueChange={(v) => updateBackground({ type: v as StageBackground['type'] })}
      >
        <TabsList className="w-full">
          <TabsTrigger value="color" className="flex-1 text-xs gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Cor
          </TabsTrigger>
          <TabsTrigger value="gradient" className="flex-1 text-xs gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Gradiente
          </TabsTrigger>
          <TabsTrigger value="image" className="flex-1 text-xs gap-1.5">
            <Image className="w-3.5 h-3.5" />
            Imagem
          </TabsTrigger>
        </TabsList>

        {/* Color Tab */}
        <TabsContent value="color" className="mt-4 space-y-4">
          <ColorPickerField
            label="Cor de fundo"
            value={background.color || '#FFFFFF'}
            onChange={(color) => updateBackground({ color })}
          />
        </TabsContent>

        {/* Gradient Tab */}
        <TabsContent value="gradient" className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground w-20">Tipo</Label>
            <Select 
              value={background.gradientType || 'linear'} 
              onValueChange={(v) => updateBackground({ gradientType: v as 'linear' | 'radial' })}
            >
              <SelectTrigger className="flex-1 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="linear">Linear</SelectItem>
                <SelectItem value="radial">Radial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {background.gradientType === 'linear' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Ângulo</Label>
                <span className="text-xs text-muted-foreground">{background.gradientAngle || 180}°</span>
              </div>
              <Slider
                value={[background.gradientAngle || 180]}
                onValueChange={([v]) => updateBackground({ gradientAngle: v })}
                min={0}
                max={360}
                step={1}
              />
            </div>
          )}

          <GradientStopsEditor
            stops={background.gradientStops || defaultStageBackground.gradientStops!}
            onChange={(gradientStops) => updateBackground({ gradientStops })}
          />
        </TabsContent>

        {/* Image Tab */}
        <TabsContent value="image" className="mt-4 space-y-4">
          {/* Image Upload with Media Library */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Imagem de fundo</Label>
            <ImageInput
              value={background.imageUrl || ''}
              onChange={(url) => updateBackground({ imageUrl: url || undefined })}
              placeholder="Clique para selecionar imagem"
              showUrlInput={true}
            />
          </div>

          {background.imageUrl && (
            <>
              {/* Image Size */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-20">Tamanho</Label>
                <Select 
                  value={background.imageSize || 'cover'} 
                  onValueChange={(v) => updateBackground({ imageSize: v as 'cover' | 'contain' | 'auto' })}
                >
                  <SelectTrigger className="flex-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Preencher</SelectItem>
                    <SelectItem value="contain">Ajustar</SelectItem>
                    <SelectItem value="auto">Original</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Position */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground w-20">Posição</Label>
                <Select 
                  value={background.imagePosition || 'center'} 
                  onValueChange={(v) => updateBackground({ imagePosition: v as 'center' | 'top' | 'bottom' | 'left' | 'right' })}
                >
                  <SelectTrigger className="flex-1 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="top">Topo</SelectItem>
                    <SelectItem value="bottom">Base</SelectItem>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Overlay Section */}
      <div className="border-t border-border pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Camada de sobreposição</Label>
          <Switch
            checked={background.overlayEnabled || false}
            onCheckedChange={(v) => updateBackground({ overlayEnabled: v })}
          />
        </div>

        {background.overlayEnabled && (
          <div className="space-y-4 pl-2 border-l-2 border-border">
            {/* Overlay Type */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground w-20">Tipo</Label>
              <Select 
                value={background.overlayType || 'color'} 
                onValueChange={(v) => updateBackground({ overlayType: v as 'color' | 'gradient' })}
              >
                <SelectTrigger className="flex-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Cor sólida</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opacity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Opacidade</Label>
                <span className="text-xs text-muted-foreground">{background.overlayOpacity || 50}%</span>
              </div>
              <Slider
                value={[background.overlayOpacity || 50]}
                onValueChange={([v]) => updateBackground({ overlayOpacity: v })}
                min={0}
                max={100}
                step={1}
              />
            </div>

            {background.overlayType === 'color' ? (
              <ColorPickerField
                label="Cor"
                value={background.overlayColor || '#000000'}
                onChange={(overlayColor) => updateBackground({ overlayColor })}
              />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground w-20">Tipo</Label>
                  <Select 
                    value={background.overlayGradientType || 'linear'} 
                    onValueChange={(v) => updateBackground({ overlayGradientType: v as 'linear' | 'radial' })}
                  >
                    <SelectTrigger className="flex-1 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linear">Linear</SelectItem>
                      <SelectItem value="radial">Radial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {background.overlayGradientType === 'linear' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Ângulo</Label>
                      <span className="text-xs text-muted-foreground">{background.overlayGradientAngle || 180}°</span>
                    </div>
                    <Slider
                      value={[background.overlayGradientAngle || 180]}
                      onValueChange={([v]) => updateBackground({ overlayGradientAngle: v })}
                      min={0}
                      max={360}
                      step={1}
                    />
                  </div>
                )}

                <GradientStopsEditor
                  stops={background.overlayGradientStops || defaultStageBackground.overlayGradientStops!}
                  onChange={(overlayGradientStops) => updateBackground({ overlayGradientStops })}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate background CSS
export function getStageBackgroundCSS(background: StageBackground | undefined): {
  backgroundStyle: React.CSSProperties;
  overlayStyle: React.CSSProperties | null;
} {
  if (!background) {
    return { backgroundStyle: {}, overlayStyle: null };
  }

  const backgroundStyle: React.CSSProperties = {};

  if (background.type === 'color') {
    backgroundStyle.backgroundColor = background.color;
  } else if (background.type === 'gradient') {
    const stops = background.gradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
    if (background.gradientType === 'linear') {
      backgroundStyle.background = `linear-gradient(${background.gradientAngle}deg, ${stops})`;
    } else {
      backgroundStyle.background = `radial-gradient(circle, ${stops})`;
    }
  } else if (background.type === 'image' && background.imageUrl) {
    backgroundStyle.backgroundImage = `url(${background.imageUrl})`;
    backgroundStyle.backgroundSize = background.imageSize;
    backgroundStyle.backgroundPosition = background.imagePosition;
    backgroundStyle.backgroundRepeat = background.imageRepeat;
  }

  let overlayStyle: React.CSSProperties | null = null;
  if (background.overlayEnabled) {
    overlayStyle = {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
    };
    const opacity = (background.overlayOpacity || 50) / 100;

    if (background.overlayType === 'color') {
      overlayStyle.backgroundColor = background.overlayColor;
      overlayStyle.opacity = opacity;
    } else {
      const stops = background.overlayGradientStops?.map(s => `${s.color} ${s.position}%`).join(', ') || '';
      if (background.overlayGradientType === 'linear') {
        overlayStyle.background = `linear-gradient(${background.overlayGradientAngle}deg, ${stops})`;
      } else {
        overlayStyle.background = `radial-gradient(circle, ${stops})`;
      }
      overlayStyle.opacity = opacity;
    }
  }

  return { backgroundStyle, overlayStyle };
}
