import { useState } from 'react';
import { ChevronDown, ArrowLeft, ChevronLeft, ArrowLeftCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ImageInput } from '@/components/ui/image-input';

// Design settings type
export interface QuizDesignSettings {
  // GERAL
  alignment: 'left' | 'center' | 'right';
  maxWidth: 'small' | 'medium' | 'large' | 'full';
  elementSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  
  // HEADER
  headerStyle: 'default' | 'minimal' | 'steps' | 'line';
  logo: {
    type: 'image' | 'url' | 'emoji';
    value: string;
  };
  logoSizePixels: number;
  logoPosition: 'left' | 'center' | 'right';
  logoLayout: 'above' | 'inline' | 'below';
  logoSpacing: {
    marginTop: number;
    marginBottom: number;
    paddingX: number;
  };
  progressBar: 'hidden' | 'top' | 'bottom';
  hideProgressBar: boolean;
  
  // HEADER STYLING
  headerDivider: {
    show: boolean;
    color: string;
    thickness: number;
  };
  backIcon: {
    color: string;
    size: 'small' | 'medium' | 'large';
    style: 'arrow' | 'chevron' | 'circle';
    position: 'left' | 'center' | 'right';
  };
  
  // CORES
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  
  // TIPOGRAFIA
  fontSize: number;
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  titleFont: string;
  bodyFont: string;
}

export const defaultDesignSettings: QuizDesignSettings = {
  alignment: 'center',
  maxWidth: 'small',
  elementSize: 'medium',
  spacing: 'normal',
  borderRadius: 'medium',
  headerStyle: 'default',
  logo: { type: 'url', value: '' },
  logoSizePixels: 40,
  logoPosition: 'center',
  logoLayout: 'above',
  logoSpacing: {
    marginTop: 16,
    marginBottom: 8,
    paddingX: 16,
  },
  progressBar: 'top',
  hideProgressBar: false,
  headerDivider: {
    show: true,
    color: '#000000',
    thickness: 1,
  },
  backIcon: {
    color: '#1F2937',
    size: 'medium',
    style: 'chevron',
    position: 'left',
  },
  primaryColor: '#000000',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleColor: '#000000',
  fontSize: 16,
  titleSize: 'medium',
  titleFont: 'Montserrat',
  bodyFont: 'Inter',
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-4 hover:bg-muted/30 transition-colors"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</span>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPickerField({ label, value, onChange }: ColorPickerFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <div 
          className="w-full h-10 rounded-md border border-border cursor-pointer overflow-hidden"
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}

interface DesignEditorProps {
  settings: QuizDesignSettings;
  onSettingsChange: (settings: QuizDesignSettings) => void;
}

const FONT_OPTIONS = [
  'Inter',
  'Montserrat',
  'Open Sans',
  'Roboto',
  'Poppins',
  'Lato',
  'Nunito',
  'Raleway',
  'Playfair Display',
  'Merriweather',
  'Source Sans Pro',
  'Work Sans',
];

export function DesignEditor({ settings, onSettingsChange }: DesignEditorProps) {
  const updateSettings = (updates: Partial<QuizDesignSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        {/* GERAL */}
        <CollapsibleSection title="Geral" defaultOpen={true}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Alinhamento</Label>
              <Select 
                value={settings.alignment} 
                onValueChange={(value: 'left' | 'center' | 'right') => updateSettings({ alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Esquerda</SelectItem>
                  <SelectItem value="center">Centralizado</SelectItem>
                  <SelectItem value="right">Direita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Largura principal</Label>
              <Select 
                value={settings.maxWidth} 
                onValueChange={(value: 'small' | 'medium' | 'large' | 'full') => updateSettings({ maxWidth: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                  <SelectItem value="full">Largura total</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tamanho dos elementos</Label>
              <Select 
                value={settings.elementSize} 
                onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ elementSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Espaçamento</Label>
              <Select 
                value={settings.spacing} 
                onValueChange={(value: 'compact' | 'normal' | 'spacious') => updateSettings({ spacing: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compacto</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="spacious">Espaçoso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Bordas/Cantos</Label>
              <Select 
                value={settings.borderRadius} 
                onValueChange={(value: 'none' | 'small' | 'medium' | 'large' | 'full') => updateSettings({ borderRadius: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Reto</SelectItem>
                  <SelectItem value="small">Suave</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Arredondado</SelectItem>
                  <SelectItem value="full">Pílula</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        {/* HEADER */}
        <CollapsibleSection title="Header">
          <div className="space-y-4">
            {/* Logo Type Tabs */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Logo</Label>
              <div className="flex border border-border rounded-md overflow-hidden">
                {(['image', 'url', 'emoji'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateSettings({ logo: { ...settings.logo, type } })}
                    className={cn(
                      "flex-1 py-2 text-sm font-medium transition-colors",
                      settings.logo.type === type 
                        ? "bg-muted text-foreground" 
                        : "text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {type === 'image' ? 'Imagem' : type === 'url' ? 'URL' : 'Emoji'}
                  </button>
                ))}
              </div>
            </div>

            {(settings.logo.type === 'url' || settings.logo.type === 'image') && (
              <ImageInput
                value={settings.logo.value}
                onChange={(value) => updateSettings({ logo: { ...settings.logo, value } })}
                placeholder="Clique para selecionar logo"
                showUrlInput={settings.logo.type === 'url'}
              />
            )}

            {settings.logo.type === 'emoji' && (
              <Input
                placeholder="🚀"
                value={settings.logo.value}
                onChange={(e) => updateSettings({ logo: { ...settings.logo, value: e.target.value } })}
                className="text-2xl text-center"
                maxLength={2}
              />
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Tamanho da logo ({settings.logoSizePixels || 40}px)</Label>
              <input
                type="range"
                min={20}
                max={120}
                value={settings.logoSizePixels || 40}
                onChange={(e) => updateSettings({ logoSizePixels: Number(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20px</span>
                <span>120px</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Posição da logo</Label>
                <Select 
                  value={settings.logoPosition} 
                  onValueChange={(value: 'left' | 'center' | 'right') => updateSettings({ logoPosition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Esquerda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Direita</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Layout</Label>
                <Select 
                  value={settings.logoLayout || 'above'} 
                  onValueChange={(value: 'above' | 'inline' | 'below') => updateSettings({ logoLayout: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Acima da barra</SelectItem>
                    <SelectItem value="inline">Ao lado da barra</SelectItem>
                    <SelectItem value="below">Abaixo da barra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Logo Spacing */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider">Espaçamento da logo</Label>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Topo</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.logoSpacing?.marginTop ?? 16}
                    onChange={(e) => updateSettings({ 
                      logoSpacing: { ...settings.logoSpacing, marginTop: Number(e.target.value) } 
                    })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Base</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.logoSpacing?.marginBottom ?? 8}
                    onChange={(e) => updateSettings({ 
                      logoSpacing: { ...settings.logoSpacing, marginBottom: Number(e.target.value) } 
                    })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Lateral</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={settings.logoSpacing?.paddingX ?? 16}
                    onChange={(e) => updateSettings({ 
                      logoSpacing: { ...settings.logoSpacing, paddingX: Number(e.target.value) } 
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Estilo do header</Label>
              <Select 
                value={settings.headerStyle || 'default'} 
                onValueChange={(value: 'default' | 'minimal' | 'steps' | 'line') => updateSettings({ headerStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Barra contínua</SelectItem>
                  <SelectItem value="minimal">Contador de passos</SelectItem>
                  <SelectItem value="steps">Passos segmentados</SelectItem>
                  <SelectItem value="line">Linha no topo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Esconder barra</Label>
              <Switch
                checked={settings.hideProgressBar ?? false}
                onCheckedChange={(checked) => updateSettings({ hideProgressBar: checked })}
              />
            </div>

            {!settings.hideProgressBar && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Posição da barra</Label>
                <Select 
                  value={settings.progressBar} 
                  onValueChange={(value: 'hidden' | 'top' | 'bottom') => updateSettings({ progressBar: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Fixado ao topo</SelectItem>
                    <SelectItem value="bottom">Fixado embaixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Divider Settings */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Mostrar divisória</Label>
                <Switch
                  checked={settings.headerDivider?.show ?? true}
                  onCheckedChange={(checked) => updateSettings({ 
                    headerDivider: { ...settings.headerDivider, show: checked } 
                  })}
                />
              </div>
              
              {settings.headerDivider?.show !== false && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Cor da divisória</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={settings.headerDivider?.color || settings.primaryColor}
                        onChange={(e) => updateSettings({ 
                          headerDivider: { ...settings.headerDivider, color: e.target.value } 
                        })}
                        className="w-8 h-8 rounded cursor-pointer border border-border"
                      />
                      <Input
                        value={settings.headerDivider?.color || settings.primaryColor}
                        onChange={(e) => updateSettings({ 
                          headerDivider: { ...settings.headerDivider, color: e.target.value } 
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Espessura</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={settings.headerDivider?.thickness ?? 1}
                      onChange={(e) => updateSettings({ 
                        headerDivider: { ...settings.headerDivider, thickness: Number(e.target.value) } 
                      })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Back Icon Settings */}
            <div className="border-t border-border pt-4 space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider">Ícone de voltar</Label>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Estilo</Label>
                <div className="flex gap-2">
                  {[
                    { value: 'chevron', icon: ChevronLeft, label: 'Chevron' },
                    { value: 'arrow', icon: ArrowLeft, label: 'Seta' },
                    { value: 'circle', icon: ArrowLeftCircle, label: 'Círculo' },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => updateSettings({ 
                        backIcon: { ...settings.backIcon, style: value as 'chevron' | 'arrow' | 'circle' } 
                      })}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all",
                        (settings.backIcon?.style || 'chevron') === value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cor</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.backIcon?.color || settings.textColor}
                    onChange={(e) => updateSettings({ 
                      backIcon: { ...settings.backIcon, color: e.target.value } 
                    })}
                    className="w-8 h-8 rounded cursor-pointer border border-border"
                  />
                  <Input
                    value={settings.backIcon?.color || settings.textColor}
                    onChange={(e) => updateSettings({ 
                      backIcon: { ...settings.backIcon, color: e.target.value } 
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tamanho</Label>
                  <Select 
                    value={settings.backIcon?.size || 'medium'} 
                    onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ 
                      backIcon: { ...settings.backIcon, size: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Normal</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Posição</Label>
                  <Select 
                    value={settings.backIcon?.position || 'left'} 
                    onValueChange={(value: 'left' | 'center' | 'right') => updateSettings({ 
                      backIcon: { ...settings.backIcon, position: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Esquerda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Direita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* CORES */}
        <CollapsibleSection title="Cores">
          <div className="grid grid-cols-2 gap-3">
            <ColorPickerField
              label="Cor primária"
              value={settings.primaryColor}
              onChange={(value) => updateSettings({ primaryColor: value })}
            />
            <ColorPickerField
              label="Cor de fundo"
              value={settings.backgroundColor}
              onChange={(value) => updateSettings({ backgroundColor: value })}
            />
            <ColorPickerField
              label="Textos"
              value={settings.textColor}
              onChange={(value) => updateSettings({ textColor: value })}
            />
            <ColorPickerField
              label="Títulos"
              value={settings.titleColor}
              onChange={(value) => updateSettings({ titleColor: value })}
            />
          </div>
        </CollapsibleSection>

        {/* TIPOGRAFIA */}
        <CollapsibleSection title="Tipografia">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Font-size</Label>
                <Input
                  type="number"
                  min={12}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) || 16 })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Títulos</Label>
                <Select 
                  value={settings.titleSize} 
                  onValueChange={(value: 'small' | 'medium' | 'large' | 'xlarge') => updateSettings({ titleSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequeno</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                    <SelectItem value="xlarge">Extra grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fonte dos títulos</Label>
              <Select 
                value={settings.titleFont || 'Montserrat'} 
                onValueChange={(value) => updateSettings({ titleFont: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview da fonte de títulos */}
            <div 
              className="p-4 border border-border rounded-lg"
              style={{ fontFamily: settings.titleFont || 'Montserrat' }}
            >
              <p className="font-bold text-lg">Título de exemplo</p>
              <p className="font-semibold">Subtítulo de exemplo</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fonte dos textos</Label>
              <Select 
                value={settings.bodyFont || 'Inter'} 
                onValueChange={(value) => updateSettings({ bodyFont: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font} value={font}>{font}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview da fonte de textos */}
            <div 
              className="p-4 border border-border rounded-lg"
              style={{ fontFamily: settings.bodyFont || 'Inter' }}
            >
              <p>Texto de parágrafo normal com a fonte selecionada.</p>
              <p className="text-sm text-muted-foreground">Texto secundário menor para descrições.</p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
