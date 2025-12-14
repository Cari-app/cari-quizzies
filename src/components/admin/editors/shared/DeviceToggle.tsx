import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'all' | 'desktop' | 'mobile';

interface DeviceToggleProps {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
  showAll?: boolean;
  className?: string;
  compact?: boolean;
}

export function DeviceToggle({ value, onChange, showAll = true, className, compact = false }: DeviceToggleProps) {
  if (compact) {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        {showAll && (
          <button
            type="button"
            onClick={() => onChange('all')}
            className={cn(
              "px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors",
              value === 'all' 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Igual
          </button>
        )}
        <div className="inline-flex items-center rounded border border-border bg-muted/30 p-0.5">
          <button
            type="button"
            onClick={() => onChange('desktop')}
            className={cn(
              "p-1 rounded transition-colors",
              value === 'desktop' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Desktop"
          >
            <Monitor className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onChange('mobile')}
            className={cn(
              "p-1 rounded transition-colors",
              value === 'mobile' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Mobile"
          >
            <Smartphone className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/30", className)}>
      {showAll && (
        <button
          type="button"
          onClick={() => onChange('all')}
          className={cn(
            "px-2 py-1 text-[10px] font-medium rounded-md transition-colors",
            value === 'all' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Todos
        </button>
      )}
      <button
        type="button"
        onClick={() => onChange('desktop')}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          value === 'desktop' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Desktop"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange('mobile')}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          value === 'mobile' 
            ? "bg-background text-foreground shadow-sm" 
            : "text-muted-foreground hover:text-foreground"
        )}
        title="Mobile"
      >
        <Smartphone className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Responsive setting wrapper - shows device toggle inline with label
interface ResponsiveSettingProps {
  label: string;
  deviceValue: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  children: React.ReactNode;
  showAll?: boolean;
}

export function ResponsiveSetting({ 
  label, 
  deviceValue, 
  onDeviceChange, 
  children,
  showAll = true 
}: ResponsiveSettingProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <DeviceToggle 
          value={deviceValue} 
          onChange={onDeviceChange} 
          showAll={showAll}
          compact={true}
        />
      </div>
      {children}
    </div>
  );
}
