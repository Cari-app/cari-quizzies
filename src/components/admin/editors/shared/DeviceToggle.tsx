import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeviceType = 'all' | 'desktop' | 'mobile';

interface DeviceToggleProps {
  value: DeviceType;
  onChange: (device: DeviceType) => void;
  showAll?: boolean;
  className?: string;
}

export function DeviceToggle({ value, onChange, showAll = true, className }: DeviceToggleProps) {
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

// Responsive setting wrapper - shows device toggle next to a setting
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
  showAll = false 
}: ResponsiveSettingProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <DeviceToggle 
          value={deviceValue} 
          onChange={onDeviceChange} 
          showAll={showAll}
        />
      </div>
      {children}
    </div>
  );
}
