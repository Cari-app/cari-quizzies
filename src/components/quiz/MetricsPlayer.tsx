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

const colorBgClasses: Record<MetricItem['color'], string> = {
  theme: 'bg-primary',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  orange: 'bg-orange-500',
  red: 'bg-red-500',
  black: 'bg-foreground',
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

function BarChart({ value, color }: { value: number; color: MetricItem['color'] }) {
  const height = Math.max(10, (value / 100) * 80);
  
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-sm text-muted-foreground">{value}%</span>
      <div className="w-12 h-20 bg-muted/30 rounded-sm flex items-end justify-center overflow-hidden">
        <div 
          className={cn("w-8 rounded-t-sm transition-all duration-500", colorBgClasses[color])}
          style={{ height: `${height}%` }}
        />
      </div>
    </div>
  );
}

function CircularChart({ value, color }: { value: number; color: MetricItem['color'] }) {
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
      <span className={cn("absolute text-lg font-semibold", colorClasses[color])}>
        {value}%
      </span>
    </div>
  );
}

function MetricCard({ item, disposition }: { item: MetricItem; disposition: MetricsPlayerProps['disposition'] }) {
  const chart = item.type === 'bar' 
    ? <BarChart value={item.value} color={item.color} />
    : <CircularChart value={item.value} color={item.color} />;
  
  const legend = (
    <p className="text-sm text-center text-muted-foreground px-2 leading-relaxed">
      {item.label}
    </p>
  );

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-4 bg-card rounded-lg border border-border">
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
          <MetricCard key={item.id} item={item} disposition={disposition} />
        ))}
      </div>
    </div>
  );
}
