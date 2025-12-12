import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

// Types
interface ChartDataPoint {
  id: string;
  label: string;
  value: number;
}

interface ChartDataSet {
  id: string;
  name: string;
  data: ChartDataPoint[];
  fillType: 'solid' | 'gradient';
  color: string;
  gradientColors: string[];
}

interface ChartConfig {
  chartType: 'cartesian' | 'bar' | 'circular';
  dataSets: ChartDataSet[];
  selectedDataSetId: string;
  showArea: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showGridX: boolean;
  showGridY: boolean;
  width: number;
  horizontalAlign: 'start' | 'center' | 'end';
  verticalAlign: 'auto' | 'start' | 'center' | 'end';
}

interface ChartPlayerProps {
  config: ChartConfig;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, dataSets }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 space-y-1">
        {payload.map((entry: any, index: number) => {
          const dataSet = dataSets.find((ds: ChartDataSet) => ds.id === entry.dataKey);
          return (
            <div 
              key={index}
              className="flex items-center gap-2 px-2 py-1 rounded"
              style={{ backgroundColor: `${entry.color}20` }}
            >
              <span 
                className="text-xs font-medium px-2 py-0.5 rounded text-white"
                style={{ backgroundColor: entry.color }}
              >
                {dataSet?.name || entry.name}
              </span>
              <span className="text-sm font-semibold">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

// Cartesian Chart Component
function CartesianChartView({ config }: { config: ChartConfig }) {
  const { dataSets, showArea, showXAxis, showYAxis, showGridX, showGridY } = config;

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (dataSets.length === 0) return [];
    
    const firstDataSet = dataSets[0];
    return firstDataSet.data.map((point, index) => {
      const dataPoint: Record<string, any> = { name: point.label };
      dataSets.forEach(ds => {
        dataPoint[ds.id] = ds.data[index]?.value || 0;
      });
      return dataPoint;
    });
  }, [dataSets]);

  // Generate gradient definitions
  const gradientDefs = useMemo(() => {
    return dataSets.map(ds => {
      if (ds.fillType === 'gradient' && ds.gradientColors.length > 0) {
        return (
          <linearGradient key={ds.id} id={`gradient-${ds.id}`} x1="0" y1="0" x2="1" y2="0">
            {ds.gradientColors.map((color, index) => (
              <stop
                key={index}
                offset={`${(index / (ds.gradientColors.length - 1)) * 100}%`}
                stopColor={color}
              />
            ))}
          </linearGradient>
        );
      }
      return null;
    }).filter(Boolean);
  }, [dataSets]);

  const getStrokeColor = (ds: ChartDataSet) => {
    if (ds.fillType === 'gradient') {
      return `url(#gradient-${ds.id})`;
    }
    return ds.color;
  };

  const getFillColor = (ds: ChartDataSet) => {
    if (ds.fillType === 'gradient') {
      return `url(#gradient-${ds.id})`;
    }
    return ds.color;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          {gradientDefs}
          {/* Vertical gradients for area fill */}
          {dataSets.map(ds => (
            <linearGradient key={`fill-${ds.id}`} id={`fill-gradient-${ds.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ds.fillType === 'gradient' ? ds.gradientColors[0] : ds.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={ds.fillType === 'gradient' ? ds.gradientColors[ds.gradientColors.length - 1] : ds.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        
        {showGridX && showGridY && (
          <CartesianGrid strokeDasharray="3 3" vertical={showGridY} horizontal={showGridX} stroke="hsl(var(--border))" />
        )}
        
        {showXAxis && (
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
        )}
        
        {showYAxis && (
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
        )}
        
        <Tooltip content={<CustomTooltip dataSets={dataSets} />} />
        
        {dataSets.map((ds, index) => (
          <Area
            key={ds.id}
            type="monotone"
            dataKey={ds.id}
            stroke={getStrokeColor(ds)}
            strokeWidth={3}
            fill={showArea ? `url(#fill-gradient-${ds.id})` : 'transparent'}
            dot={{ fill: ds.fillType === 'gradient' ? ds.gradientColors[0] : ds.color, strokeWidth: 2, r: 5, stroke: 'white' }}
            activeDot={{ r: 7, stroke: 'white', strokeWidth: 2 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar Chart Component
function BarChartView({ config }: { config: ChartConfig }) {
  const { dataSets, showXAxis, showYAxis, showGridX, showGridY } = config;

  // Transform data for Recharts
  const chartData = useMemo(() => {
    if (dataSets.length === 0) return [];
    
    const firstDataSet = dataSets[0];
    return firstDataSet.data.map((point, index) => {
      const dataPoint: Record<string, any> = { name: point.label };
      dataSets.forEach(ds => {
        dataPoint[ds.id] = ds.data[index]?.value || 0;
      });
      return dataPoint;
    });
  }, [dataSets]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        {showGridX && showGridY && (
          <CartesianGrid strokeDasharray="3 3" vertical={showGridY} horizontal={showGridX} stroke="hsl(var(--border))" />
        )}
        
        {showXAxis && (
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
        )}
        
        {showYAxis && (
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
          />
        )}
        
        <Tooltip content={<CustomTooltip dataSets={dataSets} />} />
        
        {dataSets.map((ds) => (
          <Bar
            key={ds.id}
            dataKey={ds.id}
            fill={ds.color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Circular (Donut) Chart Component
function CircularChartView({ config }: { config: ChartConfig }) {
  const { dataSets } = config;

  // Prepare data for nested donut chart
  const innerRadius = 50;
  const outerRadius = 80;
  const ringWidth = 25;

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <defs>
            {dataSets.map(ds => {
              if (ds.fillType === 'gradient' && ds.gradientColors.length > 0) {
                return ds.data.map((point, idx) => (
                  <linearGradient key={`${ds.id}-${idx}`} id={`pie-gradient-${ds.id}-${idx}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={ds.gradientColors[idx % ds.gradientColors.length]} />
                    <stop offset="100%" stopColor={ds.gradientColors[(idx + 1) % ds.gradientColors.length]} />
                  </linearGradient>
                ));
              }
              return null;
            })}
          </defs>
          
          {dataSets.map((ds, dsIndex) => (
            <Pie
              key={ds.id}
              data={ds.data.map(p => ({ name: p.label, value: p.value }))}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius + (dsIndex * ringWidth)}
              outerRadius={outerRadius + (dsIndex * ringWidth)}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={2}
              stroke="hsl(var(--background))"
            >
              {ds.data.map((point, index) => {
                const color = ds.fillType === 'gradient' 
                  ? ds.gradientColors[index % ds.gradientColors.length]
                  : ds.color;
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
          ))}
          
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
        {dataSets.map((ds, dsIndex) => (
          <div key={ds.id} className="flex flex-wrap gap-x-3 gap-y-1">
            {ds.data.map((point, index) => {
              const color = ds.fillType === 'gradient' 
                ? ds.gradientColors[index % ds.gradientColors.length]
                : ds.color;
              const isHighlighted = point.value > 0;
              return (
                <div 
                  key={point.id} 
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded transition-colors",
                    isHighlighted && "bg-muted/50"
                  )}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                  <span className="text-xs font-medium">{point.value}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Main ChartPlayer Component
export function ChartPlayer({ config }: ChartPlayerProps) {
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

  return (
    <div 
      className={cn(
        "flex w-full",
        alignClasses[config.horizontalAlign || 'start'],
        verticalAlignClasses[config.verticalAlign || 'auto']
      )}
    >
      <div 
        className="bg-card rounded-xl border border-border p-4"
        style={{ width: `${config.width || 100}%` }}
      >
        {config.chartType === 'cartesian' && <CartesianChartView config={config} />}
        {config.chartType === 'bar' && <BarChartView config={config} />}
        {config.chartType === 'circular' && <CircularChartView config={config} />}
      </div>
    </div>
  );
}
