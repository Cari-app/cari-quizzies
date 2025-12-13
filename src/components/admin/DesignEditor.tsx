import { useState } from 'react';
import { ChevronDown, ArrowLeft, ChevronLeft, ArrowLeftCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

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
  logoSize: 'small' | 'medium' | 'large';
  logoPosition: 'left' | 'center' | 'right';
  progressBar: 'hidden' | 'top' | 'bottom';
  
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
  };
  
  // CORES
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  titleColor: string;
  
  // TIPOGRAFIA
  fontSize: number;
  titleSize: 'small' | 'medium' | 'large' | 'xlarge';
  primaryFont: string;
  secondaryFont: string;
}

export const defaultDesignSettings: QuizDesignSettings = {
  alignment: 'center',
  maxWidth: 'small',
  elementSize: 'medium',
  spacing: 'normal',
  borderRadius: 'medium',
  headerStyle: 'default',
  logo: { type: 'url', value: '' },
  logoSize: 'medium',
  logoPosition: 'center',
  progressBar: 'top',
  headerDivider: {
    show: true,
    color: '#A855F7',
    thickness: 1,
  },
  backIcon: {
    color: '#1F2937',
    size: 'medium',
    style: 'chevron',
  },
  primaryColor: '#A855F7',
  backgroundColor: '#FFFFFF',
  textColor: '#1F2937',
  titleColor: '#A855F7',
  fontSize: 16,
  titleSize: 'medium',
  primaryFont: 'Inter',
  secondaryFont: 'Inter',
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

            {settings.logo.type === 'url' && (
              <Input
                placeholder="https://exemplo.com/logo.png"
                value={settings.logo.value}
                onChange={(e) => updateSettings({ logo: { ...settings.logo, value: e.target.value } })}
              />
            )}

            {settings.logo.type === 'image' && (
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  id="design-logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateSettings({ logo: { ...settings.logo, value: ev.target?.result as string } });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="design-logo-upload" className="cursor-pointer">
                  {settings.logo.value ? (
                    <img src={settings.logo.value} alt="Logo preview" className="max-h-12 mx-auto" />
                  ) : (
                    <span className="text-sm text-muted-foreground">Selecionar imagem</span>
                  )}
                </label>
              </div>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Tamanho</Label>
                <Select 
                  value={settings.logoSize} 
                  onValueChange={(value: 'small' | 'medium' | 'large') => updateSettings({ logoSize: value })}
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
                <Label className="text-xs text-muted-foreground">Disposição</Label>
                <Select 
                  value={settings.logoPosition} 
                  onValueChange={(value: 'left' | 'center' | 'right') => updateSettings({ logoPosition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Logo esquerda</SelectItem>
                    <SelectItem value="center">Logo central</SelectItem>
                    <SelectItem value="right">Logo direita</SelectItem>
                  </SelectContent>
                </Select>
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

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Barra de progresso</Label>
              <Select 
                value={settings.progressBar} 
                onValueChange={(value: 'hidden' | 'top' | 'bottom') => updateSettings({ progressBar: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hidden">Oculta</SelectItem>
                  <SelectItem value="top">Fixado ao topo</SelectItem>
                  <SelectItem value="bottom">Fixado embaixo</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
              
              <div className="grid grid-cols-2 gap-3">
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
              <Label className="text-xs text-muted-foreground">Fonte principal</Label>
              <Select 
                value={settings.primaryFont} 
                onValueChange={(value) => updateSettings({ primaryFont: value })}
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

            {/* Preview da fonte principal */}
            <div 
              className="p-4 border border-border rounded-lg space-y-1"
              style={{ fontFamily: settings.primaryFont }}
            >
              <p className="font-bold">Lorem ipsum vitae</p>
              <p className="text-sm text-muted-foreground">Lorem ipsum vitae</p>
              <p className="font-bold text-xs tracking-wide">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="text-xs text-muted-foreground">abcdefghijklmnopqrstuvwxyz</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Fonte secundária</Label>
              <Select 
                value={settings.secondaryFont} 
                onValueChange={(value) => updateSettings({ secondaryFont: value })}
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

            {/* Preview da fonte secundária */}
            <div 
              className="p-4 border border-border rounded-lg space-y-1"
              style={{ fontFamily: settings.secondaryFont }}
            >
              <p className="font-bold">Lorem ipsum vitae</p>
              <p className="text-sm text-muted-foreground">Lorem ipsum vitae</p>
              <p className="font-bold text-xs tracking-wide">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="text-xs text-muted-foreground">abcdefghijklmnopqrstuvwxyz</p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
