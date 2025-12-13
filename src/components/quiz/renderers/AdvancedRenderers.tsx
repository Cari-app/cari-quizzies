import { BeforeAfterSlider } from '../BeforeAfterSlider';
import { CarouselPlayer } from '../CarouselPlayer';
import { MetricsPlayer } from '../MetricsPlayer';
import { ChartPlayer } from '../ChartPlayer';
import { RendererProps } from './types';

export function BeforeAfterRenderer({ component, config }: RendererProps) {
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const ratio = config.beforeAfterRatio || '1:1';
  const img1 = config.beforeAfterImage1 || '';
  const img2 = config.beforeAfterImage2 || '';
  const initialPosition = config.beforeAfterInitialPosition || 50;

  return (
    <BeforeAfterSlider
      key={component.id}
      image1={img1}
      image2={img2}
      ratio={ratio}
      initialPosition={initialPosition}
      width={widthValue}
      horizontalAlign={horizontalAlign}
    />
  );
}

export function CarouselRenderer({ component, config }: RendererProps) {
  const items = config.carouselItems || [];
  const layout = config.carouselLayout || 'image-text';
  const pagination = config.carouselPagination !== false;
  const autoplay = config.carouselAutoplay === true;
  const autoplayInterval = config.carouselAutoplayInterval || 3;
  const hasBorder = config.carouselBorder === true;
  const widthValue = config.width || 100;
  const horizontalAlign = config.horizontalAlign || 'start';
  const imageRatio = config.carouselImageRatio || '4:3';

  return (
    <CarouselPlayer
      key={component.id}
      items={items}
      layout={layout}
      pagination={pagination}
      autoplay={autoplay}
      autoplayInterval={autoplayInterval}
      hasBorder={hasBorder}
      width={widthValue}
      horizontalAlign={horizontalAlign}
      imageRatio={imageRatio}
    />
  );
}

export function MetricsRenderer({ component, config }: RendererProps) {
  const items = config.metricItems || [];
  const layout = config.metricsLayout || 'grid-2';
  const disposition = config.metricsDisposition || 'legend-chart';
  const widthValue = config.width || 100;
  const horizontalAlign = (config.horizontalAlign || 'start') as 'start' | 'center' | 'end';
  const verticalAlign = (config.verticalAlign || 'auto') as 'auto' | 'start' | 'center' | 'end';

  return (
    <MetricsPlayer
      key={component.id}
      items={items}
      layout={layout}
      disposition={disposition}
      width={widthValue}
      horizontalAlign={horizontalAlign}
      verticalAlign={verticalAlign}
      bgType={config.metricsBgType}
      bgColor={config.metricsBgColor}
      gradientStart={config.metricsGradientStart}
      gradientEnd={config.metricsGradientEnd}
      gradientAngle={config.metricsGradientAngle}
      textColor={config.metricsTextColor}
      valueColor={config.metricsValueColor}
      borderColor={config.metricsBorderColor}
      borderWidth={config.metricsBorderWidth}
      borderRadius={config.metricsBorderRadius}
    />
  );
}

export function ChartsRenderer({ component, config }: RendererProps) {
  const chartConfig = config.chartConfig || {
    chartType: 'cartesian',
    dataSets: [],
    selectedDataSetId: '',
    showArea: true,
    showXAxis: true,
    showYAxis: true,
    showGridX: true,
    showGridY: true,
    width: 100,
    horizontalAlign: 'start',
    verticalAlign: 'auto',
  };

  return (
    <ChartPlayer
      key={component.id}
      config={chartConfig}
    />
  );
}
