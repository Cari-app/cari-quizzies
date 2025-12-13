import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export function ColorPicker({ 
  label, 
  value, 
  onChange, 
  onClear, 
  placeholder = '#000000',
  className 
}: ColorPickerProps) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <div className="flex items-center gap-2">
        <div 
          className="relative w-8 h-8 rounded border border-border overflow-hidden cursor-pointer" 
          style={{ backgroundColor: value }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-mono text-sm"
        />
        {onClear && value && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2" 
            onClick={onClear}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Theme-aware color picker with theme toggle
interface ThemeColorPickerProps {
  value: string;
  useTheme: boolean;
  themeColor: string;
  onChange: (color: string) => void;
  onUseThemeChange: (useTheme: boolean) => void;
  label: string;
}

export function ThemeColorPicker({ 
  value, 
  useTheme, 
  themeColor, 
  onChange, 
  onUseThemeChange, 
  label 
}: ThemeColorPickerProps) {
  const displayColor = useTheme ? themeColor : value;
  
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={() => onUseThemeChange(true)}
          className={cn(
            "px-3 py-2 text-xs font-medium rounded-md border transition-colors",
            useTheme 
              ? "border-primary bg-primary/10 text-primary" 
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          Tema
        </button>
        <div className="flex-1 flex gap-2">
          <div 
            className="relative w-12 h-9 rounded-md border overflow-hidden cursor-pointer"
            style={{ backgroundColor: displayColor }}
            onClick={() => {
              if (useTheme) {
                onUseThemeChange(false);
              }
            }}
          >
            <input
              type="color"
              value={displayColor}
              onChange={(e) => {
                onUseThemeChange(false);
                onChange(e.target.value);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <Input
            value={displayColor}
            onChange={(e) => {
              onUseThemeChange(false);
              onChange(e.target.value);
            }}
            placeholder="#000000"
            className={cn("flex-1 font-mono text-xs", useTheme && "opacity-50")}
            disabled={useTheme}
          />
        </div>
      </div>
    </div>
  );
}
