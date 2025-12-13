import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComponentConfig } from '../../ComponentEditor';
import { ColorPicker, WidthSlider, AlignmentSelectors } from './shared';

interface AppearanceProps {
  config: ComponentConfig;
  updateConfig: (updates: Partial<ComponentConfig>) => void;
}

export function PriceAppearance({ config, updateConfig }: AppearanceProps) {
  const priceBgType = config.priceBgType || 'solid';
  
  return (
    <div className="space-y-4">
      {/* CORES section */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Cores</Label>
        
        {/* Tipo de fundo */}
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Tipo de fundo</Label>
          <Select
            value={priceBgType}
            onValueChange={(v) => updateConfig({ priceBgType: v as 'solid' | 'gradient' | 'transparent' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Cor sólida</SelectItem>
              <SelectItem value="gradient">Gradiente</SelectItem>
              <SelectItem value="transparent">Transparente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {priceBgType === 'solid' && (
          <ColorPicker 
            label="Cor de fundo" 
            value={config.priceBgColor || '#ffffff'} 
            onChange={(v) => updateConfig({ priceBgColor: v })} 
          />
        )}

        {priceBgType === 'gradient' && (
          <div className="space-y-3">
            <ColorPicker 
              label="Cor inicial" 
              value={config.priceGradientStart || '#ffffff'} 
              onChange={(v) => updateConfig({ priceGradientStart: v })} 
            />
            <ColorPicker 
              label="Cor final" 
              value={config.priceGradientEnd || '#f3f4f6'} 
              onChange={(v) => updateConfig({ priceGradientEnd: v })} 
            />
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Ângulo ({config.priceGradientAngle ?? 180}°)</Label>
              <Slider
                value={[config.priceGradientAngle ?? 180]}
                onValueChange={([v]) => updateConfig({ priceGradientAngle: v })}
                min={0}
                max={360}
                step={15}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <ColorPicker 
            label="Título" 
            value={config.priceTitleColor || '#1f2937'} 
            onChange={(v) => updateConfig({ priceTitleColor: v })} 
          />
          <ColorPicker 
            label="Valor" 
            value={config.priceValueColor || '#1f2937'} 
            onChange={(v) => updateConfig({ priceValueColor: v })} 
          />
        </div>
        
        <ColorPicker 
          label="Prefixo/Sufixo" 
          value={config.pricePrefixColor || '#6b7280'} 
          onChange={(v) => updateConfig({ pricePrefixColor: v })} 
        />
      </div>

      {/* BORDAS section */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide block">Bordas</Label>
        
        <ColorPicker 
          label="Cor da borda" 
          value={config.priceBorderColor || '#e5e7eb'} 
          onChange={(v) => updateConfig({ priceBorderColor: v })} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Espessura</Label>
            <Input
              type="number"
              value={config.priceBorderWidth ?? 1}
              onChange={(e) => updateConfig({ priceBorderWidth: parseInt(e.target.value) || 0 })}
              min={0}
              max={10}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arredondamento</Label>
            <Input
              type="number"
              value={config.priceBorderRadius ?? 12}
              onChange={(e) => updateConfig({ priceBorderRadius: parseInt(e.target.value) || 0 })}
              min={0}
              max={50}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BeforeAfterAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Proporção</Label>
        <Select 
          value={config.beforeAfterRatio || '1:1'} 
          onValueChange={(v) => updateConfig({ beforeAfterRatio: v as ComponentConfig['beforeAfterRatio'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
            <SelectItem value="16:9">16:9 (Padrão)</SelectItem>
            <SelectItem value="4:3">4:3 (Retangular)</SelectItem>
            <SelectItem value="9:16">9:16 (Mobile)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function CarouselAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Proporção da imagem</Label>
        <Select
          value={config.carouselImageRatio || '4:3'}
          onValueChange={(v) => updateConfig({ carouselImageRatio: v as ComponentConfig['carouselImageRatio'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1:1">1:1 (Quadrado)</SelectItem>
            <SelectItem value="4:3">4:3 (Padrão)</SelectItem>
            <SelectItem value="3:2">3:2 (Foto)</SelectItem>
            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
            <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
            <SelectItem value="2:3">2:3 (Retrato)</SelectItem>
            <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select
          value={config.carouselBorder ? 'border' : 'no-border'}
          onValueChange={(v) => updateConfig({ carouselBorder: v === 'border' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-border">Sem borda</SelectItem>
            <SelectItem value="border">Borda</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function LoadingAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function TestimonialsAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Bordas</Label>
        <Select 
          value={config.testimonialBorderRadius || 'small'} 
          onValueChange={(v) => updateConfig({ testimonialBorderRadius: v as ComponentConfig['testimonialBorderRadius'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem borda</SelectItem>
            <SelectItem value="small">Pequeno</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="large">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Sombra</Label>
        <Select 
          value={config.testimonialShadow || 'none'} 
          onValueChange={(v) => updateConfig({ testimonialShadow: v as ComponentConfig['testimonialShadow'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem sombra</SelectItem>
            <SelectItem value="sm">Pequena</SelectItem>
            <SelectItem value="md">Média</SelectItem>
            <SelectItem value="lg">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Espaçamento</Label>
        <Select 
          value={config.testimonialSpacing || 'simple'} 
          onValueChange={(v) => updateConfig({ testimonialSpacing: v as ComponentConfig['testimonialSpacing'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compacto</SelectItem>
            <SelectItem value="simple">Simples</SelectItem>
            <SelectItem value="relaxed">Grande</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function LevelAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Tipo</Label>
        <Select 
          value={config.levelType || 'line'} 
          onValueChange={(v) => updateConfig({ levelType: v as ComponentConfig['levelType'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Linha</SelectItem>
            <SelectItem value="segments">Traços</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Cor</Label>
        <Select 
          value={config.levelColor || 'theme'} 
          onValueChange={(v) => updateConfig({ levelColor: v as ComponentConfig['levelColor'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theme">Tema</SelectItem>
            <SelectItem value="green-red">Verde → Vermelho</SelectItem>
            <SelectItem value="red-green">Vermelho → Verde</SelectItem>
            <SelectItem value="opaque">Opaco</SelectItem>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function TimerAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <Select 
          value={config.timerStyle || 'red'} 
          onValueChange={(v) => updateConfig({ timerStyle: v as ComponentConfig['timerStyle'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
            <SelectItem value="gray">Cinza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function NotificationAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <Select 
          value={config.notificationStyle || 'default'} 
          onValueChange={(v) => updateConfig({ notificationStyle: v as ComponentConfig['notificationStyle'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="white">Branco</SelectItem>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
            <SelectItem value="gray">Cinza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}

export function AlertAppearance({ config, updateConfig }: AppearanceProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Estilo</Label>
        <Select 
          value={config.alertStyle || 'red'} 
          onValueChange={(v) => updateConfig({ alertStyle: v as ComponentConfig['alertStyle'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Vermelho</SelectItem>
            <SelectItem value="yellow">Amarelo</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="gray">Cinza</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          id="alertHighlight" 
          checked={config.alertHighlight || false}
          onChange={(e) => updateConfig({ alertHighlight: e.target.checked })}
          className="rounded border-border"
        />
        <Label htmlFor="alertHighlight" className="text-sm cursor-pointer">Destacar</Label>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Margem interna</Label>
        <Select 
          value={config.alertPadding || 'default'} 
          onValueChange={(v) => updateConfig({ alertPadding: v as ComponentConfig['alertPadding'] })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compacto</SelectItem>
            <SelectItem value="default">Padrão</SelectItem>
            <SelectItem value="relaxed">Relaxado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <WidthSlider config={config} updateConfig={updateConfig} />
      <AlignmentSelectors config={config} updateConfig={updateConfig} />
    </div>
  );
}
