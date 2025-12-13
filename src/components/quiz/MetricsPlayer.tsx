import { cn } from '@/lib/utils';

interface MetricItem {
  id: string;
  type: 'bar' | 'circular';
  color: 'theme' | 'green' | 'blue' | 'yellow' | 'orange' | 'red' | 'black';
  value: number;
  label: string;
}

interface MetricsPlayerProps {
  items: MetricItem[];
  layout: 'list' | 'grid-2' | 'grid-3' | 'grid-4';
  disposition: 'chart-legend' | 'legend-chart';
  width?: number;
  horizontalAlign?: 'start' | 'center' | 'end';
  verticalAlign?: 'auto' | 'start' | 'center' | 'end';
  // Custom styling
  bgType?: 'solid' | 'gradient' | 'transparent';
  bgColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
  textColor?: string;
  valueColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

const colorClasses: Record<MetricItem['color'], string> = {
  theme: 'text-primary',
  green: 'text-green-500',
  blue: 'text-blue-500',
  yellow: 'text-yellow-500',
  orange: 'text-orange-500',
  red: 'text-red-500',
  black: 'text-foreground',
};

const colorGradients: Record<MetricItem['color'], string> = {
  theme: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.7) 100%)',
  green: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
  blue: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
  yellow: 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)',
  orange: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
  red: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
  black: 'linear-gradient(180deg, hsl(var(--foreground)) 0%, hsl(var(--foreground) / 0.7) 100%)',
};

const colorStrokeClasses: Record<MetricItem['color'], string> = {
  theme: 'stroke-primary',
  green: 'stroke-green-500',
  blue: 'stroke-blue-500',
  yellow: 'stroke-yellow-500',
  orange: 'stroke-orange-500',
  red: 'stroke-red-500',
  black: 'stroke-foreground',
};

function BarChart({ value, color, valueColor }: { value: number; color: MetricItem['color']; valueColor?: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span 
        className="text-sm font-semibold"
        style={{ color: valueColor || undefined }}
      >
        {value}%
      </span>
      <div className="w-[30px] h-20 rounded-md overflow-hidden relative" style={{ 
        background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.03) 100%)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div 
          className="absolute bottom-0 left-0 w-full rounded-t-md transition-all duration-700 ease-out"
          style={{ 
            height: `${Math.max(8, value)}%`,
            background: colorGradients[color],
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.25)'
          }}
        />
      </div>
    </div>
  );
}

function CircularChart({ value, color, valueColor }: { value: number; color: MetricItem['color']; valueColor?: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-500", colorStrokeClasses[color])}
        />
      </svg>
      <span 
        className={cn("absolute text-lg font-semibold", !valueColor && colorClasses[color])}
        style={{ color: valueColor || undefined }}
      >
        {value}%
      </span>
    </div>
  );
}

interface MetricCardProps {
  item: MetricItem;
  disposition: MetricsPlayerProps['disposition'];
  bgStyle?: string;
  textColor?: string;
  valueColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

function MetricCard({ 
  item, 
  disposition, 
  bgStyle, 
  textColor, 
  valueColor,
  borderColor, 
  borderWidth = 1, 
  borderRadius = 8 
}: MetricCardProps) {
  const chart = item.type === 'bar' 
    ? <BarChart value={item.value} color={item.color} valueColor={valueColor} />
    : <CircularChart value={item.value} color={item.color} valueColor={valueColor} />;
  
  const legend = (
    <p 
      className="text-sm text-center px-2 leading-relaxed"
      style={{ color: textColor || undefined }}
    >
      {item.label}
    </p>
  );

  return (
    <div 
      className="flex flex-col items-center justify-center gap-3 p-4"
      style={{
        background: bgStyle,
        borderWidth: borderWidth > 0 ? `${borderWidth}px` : undefined,
        borderStyle: borderWidth > 0 ? 'solid' : 'none',
        borderColor: borderColor || undefined,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {disposition === 'legend-chart' ? (
        <>
          {legend}
          {chart}
        </>
      ) : (
        <>
          {chart}
          {legend}
        </>
      )}
    </div>
  );
}

export function MetricsPlayer({
  items,
  layout,
  disposition,
  width = 100,
  horizontalAlign = 'start',
  verticalAlign = 'auto',
  bgType = 'solid',
  bgColor,
  gradientStart = '#667eea',
  gradientEnd = '#764ba2',
  gradientAngle = 135,
  textColor,
  valueColor,
  borderColor,
  borderWidth = 1,
  borderRadius = 8,
}: MetricsPlayerProps) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  const verticalAlignClasses = {
    auto: '',
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
  };

  const layoutClasses = {
    'list': 'flex flex-col',
    'grid-2': 'grid grid-cols-2',
    'grid-3': 'grid grid-cols-3',
    'grid-4': 'grid grid-cols-4',
  };

  const bgStyle = bgType === 'transparent' 
    ? 'transparent'
    : bgType === 'gradient' 
      ? `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`
      : bgColor || undefined;

  return (
    <div 
      className={cn("flex", alignClasses[horizontalAlign], verticalAlignClasses[verticalAlign])}
    >
      <div 
        className={cn(
          "gap-3",
          layoutClasses[layout]
        )}
        style={{ width: `${width}%` }}
      >
        {items.map((item) => (
          <MetricCard 
            key={item.id} 
            item={item} 
            disposition={disposition}
            bgStyle={bgStyle}
            textColor={textColor}
            valueColor={valueColor}
            borderColor={borderColor}
            borderWidth={borderWidth}
            borderRadius={borderRadius}
          />
        ))}
      </div>
    </div>
  );
}
