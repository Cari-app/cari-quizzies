import { useState } from 'react';
import { cn } from '@/lib/utils';
import { sanitizeHtml, sanitizeEmbed } from '@/lib/sanitize';
import { Plus, GripVertical, Trash2, CalendarIcon, Pencil, Copy, ChevronUp, ChevronDown, Minus, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { Reorder } from 'framer-motion';
import { DroppedComponent, ComponentConfig, FaqItem } from './ComponentEditor';
import { getDefaultChartConfig } from './ChartEditor';
import { ChartPlayer } from '../quiz/ChartPlayer';
import { SlidingRuler } from '../quiz/SlidingRuler';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DesignSettings {
  textColor: string;
  primaryColor: string;
  backgroundColor: string;
  [key: string]: any;
}

interface DropZoneProps {
  components: DroppedComponent[];
  onComponentsChange: (components: DroppedComponent[]) => void;
  selectedComponentId?: string | null;
  onSelectComponent: (component: DroppedComponent | null) => void;
  designSettings?: DesignSettings;
}

export function DropZone({ components, onComponentsChange, selectedComponentId, onSelectComponent, designSettings }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const type = e.dataTransfer.getData('component-type');
    const name = e.dataTransfer.getData('component-name');
    const icon = e.dataTransfer.getData('component-icon');

    if (type && name) {
      const uniqueId = crypto.randomUUID();
      const newComponent: DroppedComponent = {
        id: uniqueId,
        type,
        name,
        icon,
        config: getDefaultConfig(type),
      };
      onComponentsChange([...components, newComponent]);
      onSelectComponent(newComponent);
    }
  };

  const getDefaultConfig = (type: string): ComponentConfig => {
    // Helper to generate unique IDs
    const uuid = () => crypto.randomUUID();
    
    switch (type) {
      case 'input':
        return { label: 'Campo de texto', placeholder: 'Digite aqui...', required: false };
      case 'email':
        return { label: 'E-mail', placeholder: 'seu@email.com', required: true };
      case 'phone':
        return { label: 'Telefone', placeholder: '(00) 00000-0000', required: true, mask: 'br' };
      case 'number':
        return { label: 'Número', placeholder: '0', required: false };
      case 'date':
        return { label: 'Data', required: false };
      case 'textarea':
        return { label: 'Mensagem', placeholder: 'Digite sua mensagem...', required: false };
      case 'height':
        return { label: 'Altura', placeholder: '170', required: false, layoutType: 'input', unit: 'cm', minValue: 100, maxValue: 220, defaultValue: 170 };
      case 'weight':
        return { label: 'Peso', placeholder: '70', required: false, layoutType: 'input', unit: 'kg', minValue: 30, maxValue: 200, defaultValue: 70 };
      case 'button':
        return { buttonText: 'Continuar', buttonStyle: 'primary', buttonAction: 'next' };
      case 'options':
      case 'single':
        return { 
          label: 'Qual sua preferência?', 
          options: [
            { id: uuid(), text: 'Opção 1', value: 'opt1' },
            { id: uuid(), text: 'Opção 2', value: 'opt2' },
            { id: uuid(), text: 'Opção 3', value: 'opt3' },
          ],
          allowMultiple: false,
          required: true
        };
      case 'multiple':
        return { 
          label: 'Selecione todas que se aplicam', 
          options: [
            { id: uuid(), text: 'Opção 1', value: 'opt1' },
            { id: uuid(), text: 'Opção 2', value: 'opt2' },
            { id: uuid(), text: 'Opção 3', value: 'opt3' },
          ],
          allowMultiple: true,
          required: true
        };
      case 'yesno':
        return { 
          label: 'Você concorda?', 
          options: [
            { id: uuid(), text: 'Sim', value: 'yes' },
            { id: uuid(), text: 'Não', value: 'no' },
          ],
          required: true
        };
      case 'text':
        return { content: 'Clique para editar este texto', textAlign: 'left', fontSize: 'base' };
      case 'image':
        return { mediaUrl: '', altText: '' };
      case 'video':
        return { mediaUrl: '', altText: '', videoType: 'url', embedCode: '' };
      case 'spacer':
        return { height: 24 };
      case 'script':
        return { scriptCode: '', scriptDescription: 'Script personalizado' };
      case 'alert':
        return { 
          description: 'Texto do alerta aqui!', 
          alertStyle: 'red', 
          alertHighlight: false,
          alertPadding: 'default',
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'notification':
        return { 
          notificationTitle: '@1 acabou de se cadastrar via @2!',
          notificationDescription: 'Corra! Faltam apenas @3 ofertas disponíveis nessa promoção',
          notificationPosition: 'default',
          notificationDuration: 5,
          notificationInterval: 2,
          notificationStyle: 'default',
          notificationVariations: [
            { id: uuid(), name: 'Rafael', platform: 'Instagram', number: '7' },
            { id: uuid(), name: 'Beatriz', platform: 'Whatsapp', number: '6' },
            { id: uuid(), name: 'Carlos', platform: 'Facebook', number: '5' },
          ]
        };
      case 'timer':
        return {
          timerSeconds: 20,
          timerText: 'Resgate agora seu desconto: [time]',
          timerStyle: 'red',
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'loading':
        return {
          loadingTitle: 'Carregando...',
          loadingDescription: 'Aguarde enquanto preparamos tudo para você!',
          loadingDuration: 5,
          loadingDelay: 0,
          loadingNavigation: 'next',
          loadingDestination: 'next',
          showLoadingTitle: true,
          showLoadingProgress: true,
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'level':
        return {
          levelTitle: 'Nível',
          levelSubtitle: 'Fusce vitae tellus',
          levelPercentage: 75,
          levelIndicatorText: '',
          levelLegends: '',
          showLevelMeter: true,
          showLevelProgress: true,
          levelType: 'line',
          levelColor: 'theme',
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'arguments':
        return {
          argumentLayout: 'grid-2',
          argumentDisposition: 'image-text',
          argumentItems: [
            { id: uuid(), title: 'Titulo aqui', description: 'Descrição aqui oi tudo bem isso aqui e uma descrição', mediaType: 'none' },
            { id: uuid(), title: 'Fusce vitae', description: 'Tellus in risus sagittis condimentum', mediaType: 'none' },
          ],
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'testimonials':
        return {
          testimonialLayout: 'list',
          testimonialBorderRadius: 'small',
          testimonialShadow: 'none',
          testimonialSpacing: 'simple',
          testimonialItems: [
            { id: uuid(), name: 'Rafael Nascimento', handle: '@rafael.nascimento', rating: 5, text: 'A experiência foi excelente do início ao fim. Atendimento rápido, equipe super atenciosa e resultados acima do esperado. Com certeza recomendaria!' },
            { id: uuid(), name: 'Camila Ferreira', handle: '@camila.ferreira', rating: 5, text: 'Fiquei impressionado com a qualidade e o cuidado em cada detalhe. Superou todas as minhas expectativas. Já virei cliente fiel!' },
          ],
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'faq':
        return {
          faqItems: [
            { id: uuid(), question: 'Qual a primeira dúvida a ser resolvida?', answer: 'Este é apenas um texto de exemplo utilizado para ilustrar como a resposta de uma dúvida frequente será exibida nesta seção.' },
            { id: uuid(), question: 'Descreva outra dúvida a ser resolvida.', answer: 'Texto genérico de demonstração. Serve apenas como modelo visual para representar uma resposta real a ser inserida posteriormente.' },
          ],
          faqDetailType: 'arrow',
          faqFirstOpen: true,
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'price':
        return {
          priceTitle: 'Plano PRO',
          pricePrefix: '10% off',
          priceValue: 'R$ 89,90',
          priceSuffix: 'à vista',
          priceHighlight: '',
          priceType: 'illustrative',
          priceRedirectUrl: '',
          priceLayout: 'horizontal',
          priceStyle: 'theme',
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'before-after':
        return {
          beforeAfterImage1: '',
          beforeAfterImage2: '',
          beforeAfterRatio: '1:1',
          beforeAfterInitialPosition: 50,
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'carousel':
        return {
          carouselItems: [
            { id: uuid(), image: '', description: 'Exemplo de descrição' },
            { id: uuid(), image: '', description: 'Exemplo de descrição' }
          ],
          carouselLayout: 'image-text',
          carouselPagination: true,
          carouselAutoplay: false,
          carouselAutoplayInterval: 3,
          carouselBorder: false,
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'metrics':
        return {
          metricItems: [
            { id: uuid(), type: 'bar', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' },
            { id: uuid(), type: 'circular', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' },
            { id: uuid(), type: 'circular', color: 'yellow', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' },
            { id: uuid(), type: 'bar', color: 'theme', value: 30, label: 'Fusce vitae tellus in risus sagittis condimentum' }
          ],
          metricsLayout: 'grid-2',
          metricsDisposition: 'legend-chart',
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      case 'charts':
        return {
          chartConfig: getDefaultChartConfig(),
          width: 100,
          horizontalAlign: 'start',
          verticalAlign: 'auto'
        };
      default:
        return {};
    }
  };

  const handleRemove = (id: string) => {
    onComponentsChange(components.filter(c => c.id !== id));
    if (selectedComponentId === id) {
      onSelectComponent(null);
    }
  };

  const handleDuplicate = (comp: DroppedComponent) => {
    const uniqueId = crypto.randomUUID();
    const newComponent: DroppedComponent = {
      ...comp,
      id: uniqueId,
      customId: undefined, // Clear customId for duplicated component
      config: comp.config ? { ...comp.config } : undefined,
    };
    const index = components.findIndex(c => c.id === comp.id);
    const newComponents = [...components];
    newComponents.splice(index + 1, 0, newComponent);
    onComponentsChange(newComponents);
    onSelectComponent(newComponent);
  };

  const handleEdit = (comp: DroppedComponent) => {
    onSelectComponent(comp);
  };

  const renderComponentPreview = (comp: DroppedComponent) => {
    const config = comp.config || {};
    
    switch (comp.type) {
      case 'text':
        return (
          <div className={cn("p-4", config.textAlign === 'center' && 'text-center', config.textAlign === 'right' && 'text-right')}>
            <div 
              className="rich-text text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.content || 'Bloco de texto') }}
            />
          </div>
        );
      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'textarea':
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            {comp.type === 'textarea' ? (
              <textarea 
                placeholder={config.placeholder || 'Digite aqui...'}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm resize-none"
                rows={3}
                disabled
              />
            ) : (
              <input 
                type={comp.type === 'email' ? 'email' : comp.type === 'number' ? 'number' : 'text'}
                placeholder={config.placeholder}
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
                disabled
              />
            )}
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'height':
      case 'weight':
        const isRulerLayout = config.layoutType === 'ruler';
        const unit = config.unit || (comp.type === 'height' ? 'cm' : 'kg');
        const defaultVal = config.defaultValue || (comp.type === 'height' ? 170 : 70);
        const minVal = config.minValue || (comp.type === 'height' ? 100 : 30);
        const maxVal = config.maxValue || (comp.type === 'height' ? 220 : 200);
        
        if (isRulerLayout) {
          const altUnit = comp.type === 'height' ? 'pol' : 'lb';
          return (
            <div className="p-4">
              <SlidingRuler
                value={defaultVal}
                onChange={() => {}}
                min={minVal}
                max={maxVal}
                step={1}
                unit={unit}
                altUnit={altUnit}
                barColor={config.barColor}
              />
            </div>
          );
        }
        
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            <input 
              type="number"
              placeholder={config.placeholder}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm"
              disabled
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'date':
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-2" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-sm flex items-center justify-between text-muted-foreground"
                >
                  <span>dd/mm/aaaa</span>
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      case 'button':
        return (
          <div className="p-4">
            <button className={cn(
              "w-full py-3 rounded-lg text-sm font-medium transition-colors",
              config.buttonStyle === 'primary' && "bg-primary text-primary-foreground",
              config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
              config.buttonStyle === 'outline' && "border border-border bg-transparent"
            )}>
              {config.buttonText || 'Botão'}
            </button>
          </div>
        );
      case 'options':
      case 'single':
      case 'multiple': {
        const optionStyle = config.optionStyle || 'simple';
        const optionLayout = config.optionLayout || 'list';
        const optionOrientation = config.optionOrientation || 'horizontal';
        const optionBorderRadius = config.optionBorderRadius || 'small';
        const optionShadow = config.optionShadow || 'none';
        const optionSpacing = config.optionSpacing || 'simple';
        const detailType = config.detailType || 'checkbox';
        const detailPosition = config.detailPosition || 'start';
        const imagePosition = config.imagePosition || 'top';
        const imageRatio = config.imageRatio || '1:1';
        const isVertical = optionOrientation === 'vertical';
        
        const getBorderRadius = () => {
          switch (optionBorderRadius) {
            case 'none': return 'rounded-none';
            case 'small': return 'rounded-md';
            case 'medium': return 'rounded-lg';
            case 'large': return 'rounded-xl';
            case 'full': return 'rounded-full';
            default: return 'rounded-md';
          }
        };
        
        const getShadow = () => {
          switch (optionShadow) {
            case 'sm': return 'shadow-sm';
            case 'md': return 'shadow-md';
            case 'lg': return 'shadow-lg';
            default: return '';
          }
        };
        
        const getSpacing = () => {
          switch (optionSpacing) {
            case 'compact': return 'gap-1';
            case 'relaxed': return 'gap-4';
            default: return 'gap-2';
          }
        };
        
        const getLayoutClass = () => {
          switch (optionLayout) {
            case 'grid-2': return 'grid grid-cols-2';
            case 'grid-3': return 'grid grid-cols-3';
            case 'grid-4': return 'grid grid-cols-4';
            default: return 'flex flex-col';
          }
        };
        
        const getImageRatioClass = () => {
          switch (imageRatio) {
            case '16:9': return 'aspect-video';
            case '4:3': return 'aspect-[4/3]';
            case '3:2': return 'aspect-[3/2]';
            default: return 'aspect-square';
          }
        };
        
        const renderDetail = (isSelected: boolean, index: number) => {
          if (detailType === 'none') return null;
          
          if (detailType === 'number') {
            return (
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium shrink-0",
                isSelected ? "border-foreground bg-foreground text-background" : "border-border"
              )}>
                {index + 1}
              </div>
            );
          }
          
          return (
            <div className={cn(
              "w-5 h-5 border-2 flex items-center justify-center shrink-0",
              detailType === 'radio' || !config.allowMultiple ? "rounded-full" : "rounded",
              isSelected ? "border-foreground bg-foreground" : "border-border"
            )}>
              {isSelected && <span className="text-background text-xs">✓</span>}
            </div>
          );
        };
        
        const renderOptionMedia = (opt: any, vertical = false) => {
          if (opt.mediaType === 'icon' && opt.icon) {
            return <span className={cn("shrink-0", vertical ? "text-2xl" : "text-lg")}>{opt.icon}</span>;
          }
          if (opt.mediaType === 'image' && opt.imageUrl) {
            return <img src={opt.imageUrl} alt="" className={cn("object-cover rounded shrink-0", vertical ? "w-10 h-10" : "w-6 h-6")} />;
          }
          return null;
        };
        
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-1" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            {config.description && <div className="rich-text text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.description) }} />}
            <div className={cn(getLayoutClass(), getSpacing())}>
              {(config.options || []).map((opt, i) => {
                const isSelected = i === 0;
                
                if (optionStyle === 'image') {
                  const isHorizontal = imagePosition === 'left' || imagePosition === 'right';
                  return (
                    <div 
                      key={opt.id} 
                      className={cn(
                        "border text-sm transition-colors overflow-hidden",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-foreground bg-accent" : "border-border",
                        isHorizontal ? "flex" : "flex flex-col"
                      )}
                    >
                      {(imagePosition === 'top' || imagePosition === 'left') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                      <div className={cn(
                        "p-3 flex items-center gap-2",
                        detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {renderDetail(isSelected, i)}
                        {renderOptionMedia(opt)}
                        <span className="flex-1">{opt.text}</span>
                      </div>
                      {(imagePosition === 'bottom' || imagePosition === 'right') && (
                        <div className={cn(
                          "bg-muted flex items-center justify-center text-muted-foreground text-2xl",
                          getImageRatioClass(),
                          isHorizontal ? "w-20" : "w-full"
                        )}>
                          {opt.imageUrl ? (
                            <img src={opt.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : '📷'}
                        </div>
                      )}
                    </div>
                  );
                }
                
                if (optionStyle === 'card') {
                  return (
                    <div 
                      key={opt.id} 
                      className={cn(
                        "p-4 border text-sm transition-colors",
                        getBorderRadius(),
                        getShadow(),
                        isSelected ? "border-foreground bg-accent" : "border-border"
                      )}
                    >
                      <div className={cn(
                        isVertical 
                          ? "flex flex-col items-center text-center gap-2" 
                          : "flex items-center gap-3",
                        !isVertical && detailPosition === 'end' && "flex-row-reverse"
                      )}>
                        {isVertical && renderOptionMedia(opt, true)}
                        {!isVertical && renderDetail(isSelected, i)}
                        {!isVertical && renderOptionMedia(opt)}
                        <span className={cn(!isVertical && "flex-1")}>{opt.text}</span>
                        {isVertical && renderDetail(isSelected, i)}
                      </div>
                    </div>
                  );
                }
                
                // Simple style
                return (
                  <div 
                    key={opt.id} 
                    className={cn(
                      "p-3 border text-sm transition-colors",
                      getBorderRadius(),
                      getShadow(),
                      isSelected ? "border-foreground bg-accent" : "border-border"
                    )}
                  >
                    <div className={cn(
                      isVertical 
                        ? "flex flex-col items-center text-center gap-2" 
                        : "flex items-center gap-3",
                      !isVertical && detailPosition === 'end' && "flex-row-reverse"
                    )}>
                      {isVertical && renderOptionMedia(opt, true)}
                      {!isVertical && renderDetail(isSelected, i)}
                      {!isVertical && renderOptionMedia(opt)}
                      <span className={cn(!isVertical && "flex-1")}>{opt.text}</span>
                      {isVertical && renderDetail(isSelected, i)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case 'yesno':
        return (
          <div className="p-4">
            {config.label && <div className="rich-text font-medium mb-3" dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.label) }} />}
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                {config.options?.[0]?.text || 'Sim'}
              </button>
              <button className="flex-1 py-3 border border-border rounded-lg text-sm font-medium">
                {config.options?.[1]?.text || 'Não'}
              </button>
            </div>
          </div>
        );
      case 'image': {
        const isEmoji = config.mediaUrl && config.mediaUrl.length <= 4 && !/^https?:\/\//.test(config.mediaUrl);
        return (
          <div className="p-4">
            {config.mediaUrl ? (
              isEmoji ? (
                <div className="flex items-center justify-center py-8">
                  <span className="text-6xl">{config.mediaUrl}</span>
                </div>
              ) : (
                <img src={config.mediaUrl} alt={config.altText || ''} className="w-full rounded-lg" />
              )
            ) : (
              <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <span className="text-2xl">🖼️</span>
                <span className="text-sm text-muted-foreground ml-2">Adicionar imagem</span>
              </div>
            )}
          </div>
        );
      }
      case 'video': {
        // Check if there's a video URL or embed code
        const hasVideo = config.mediaUrl || config.embedCode;
        
        if (!hasVideo) {
          return (
            <div className="p-4">
              <div className="p-8 bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <span className="text-2xl">🎬</span>
                <span className="text-sm text-muted-foreground ml-2">Adicionar vídeo</span>
              </div>
            </div>
          );
        }
        
        // If embed code is provided, use it
        if (config.videoType === 'embed' && config.embedCode) {
          return (
            <div className="p-4">
              <div 
                className="w-full aspect-video rounded-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: sanitizeEmbed(config.embedCode) }}
              />
            </div>
          );
        }
        
        // If URL is provided, try to convert to embed
        if (config.mediaUrl) {
          const url = config.mediaUrl;
          
          // YouTube
          const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
          if (youtubeMatch) {
            return (
              <div className="p-4">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // Vimeo
          const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
          if (vimeoMatch) {
            return (
              <div className="p-4">
                <iframe
                  src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
                  className="w-full aspect-video rounded-lg"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // PandaVideo / Vturb / other platforms - use iframe
          if (url.includes('pandavideo') || url.includes('player-vz') || url.includes('vturb')) {
            return (
              <div className="p-4">
                <iframe
                  src={url}
                  className="w-full aspect-video rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          }
          
          // Direct video file
          if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
            return (
              <div className="p-4">
                <video src={url} controls className="w-full rounded-lg" />
              </div>
            );
          }
          
          // Fallback: use as iframe
          return (
            <div className="p-4">
              <iframe
                src={url}
                className="w-full aspect-video rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }
        
        return null;
      }
      case 'spacer':
        return (
          <div className="flex items-center justify-center" style={{ height: config.height || 24 }}>
            <div className="border-t border-dashed border-border w-full mx-4" />
          </div>
        );
      case 'script':
        return (
          <div className="p-4">
            <div className="bg-[#1e1e2e] rounded-lg p-4 font-mono text-xs overflow-hidden">
              <pre className="text-emerald-400 whitespace-pre-wrap break-all">
                {config.scriptCode || '<script>console.log("custom script")</script>'}
              </pre>
            </div>
            {config.scriptDescription && (
              <p className="text-xs text-muted-foreground mt-2 text-center">{config.scriptDescription}</p>
            )}
          </div>
        );
      case 'alert': {
        const alertStyles = {
          red: 'bg-red-50 border-red-200 text-red-700',
          yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
          green: 'bg-green-50 border-green-200 text-green-700',
          blue: 'bg-blue-50 border-blue-200 text-blue-700',
          gray: 'bg-gray-50 border-gray-200 text-gray-700',
        };
        const paddingStyles = {
          compact: 'p-2',
          default: 'p-4',
          relaxed: 'p-6',
        };
        const style = config.alertStyle || 'red';
        const padding = config.alertPadding || 'default';
        
        return (
          <div 
            className={cn(
              "w-full rounded-lg border",
              alertStyles[style as keyof typeof alertStyles],
              paddingStyles[padding as keyof typeof paddingStyles],
              config.alertHighlight && "ring-2 ring-offset-2 ring-current"
            )}
          >
            <div 
              className="text-sm rich-text"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(config.description || 'Texto do alerta') }}
            />
          </div>
        );
      }
      case 'notification': {
        const notificationStyles = {
          default: 'bg-background border-primary/20 shadow-lg',
          white: 'bg-white border-gray-200 shadow-lg',
          red: 'bg-red-50 border-red-200',
          blue: 'bg-blue-50 border-blue-200',
          green: 'bg-green-50 border-green-200',
          yellow: 'bg-yellow-50 border-yellow-200',
          gray: 'bg-gray-50 border-gray-200',
        };
        
        const style = config.notificationStyle || 'default';
        const variations = config.notificationVariations || [];
        const firstVariation = variations[0] || { name: 'Rafael', platform: 'Instagram', number: '7' };
        
        // Replace @1, @2, @3 with first variation values
        const title = (config.notificationTitle || '@1 acabou de se cadastrar via @2!')
          .replace(/@1/g, firstVariation.name)
          .replace(/@2/g, firstVariation.platform)
          .replace(/@3/g, firstVariation.number);
          
        const description = (config.notificationDescription || 'Corra! Faltam apenas @3 ofertas disponíveis')
          .replace(/@1/g, firstVariation.name)
          .replace(/@2/g, firstVariation.platform)
          .replace(/@3/g, firstVariation.number);
        
        return (
          <div className="w-full px-4">
            <div 
              className={cn(
                "rounded-lg border p-4 relative overflow-hidden",
                notificationStyles[style as keyof typeof notificationStyles]
              )}
            >
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  <span className="font-bold">{firstVariation.name}</span>
                  {title.replace(firstVariation.name, '')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          </div>
        );
      }
      case 'timer': {
        const timerStyles = {
          default: 'bg-primary text-primary-foreground',
          red: 'bg-red-100 text-red-700 border border-red-200',
          blue: 'bg-blue-100 text-blue-700 border border-blue-200',
          green: 'bg-green-100 text-green-700 border border-green-200',
          yellow: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
          gray: 'bg-gray-100 text-gray-700 border border-gray-200',
        };
        
        const style = config.timerStyle || 'red';
        const seconds = config.timerSeconds || 20;
        const text = config.timerText || 'Resgate agora seu desconto: [time]';
        
        // Format seconds to MM:SS
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
        
        // Replace [time] with formatted time
        const displayText = text.replace('[time]', formattedTime);
        
        
        return (
          <div 
            className={cn(
              "w-full rounded-lg px-4 py-3 text-center font-medium",
              timerStyles[style as keyof typeof timerStyles]
            )}
          >
            {displayText}
          </div>
        );
      }
      case 'loading': {
        const title = config.loadingTitle || 'Carregando...';
        const description = config.loadingDescription || '';
        const showTitle = config.showLoadingTitle !== false;
        const showProgress = config.showLoadingProgress !== false;
        
        return (
          <div className="w-full border border-border rounded-lg p-4 bg-background">
            {showTitle && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{title}</span>
                <span className="text-xs text-muted-foreground">100%</span>
              </div>
            )}
            {showProgress && (
              <div className="h-2 bg-foreground rounded-full mb-3" />
            )}
            {description && (
              <p className="text-sm text-muted-foreground text-center">{description}</p>
            )}
          </div>
        );
      }
      case 'level': {
        const title = config.levelTitle || 'Nível';
        const subtitle = config.levelSubtitle || '';
        const percentage = config.levelPercentage ?? 75;
        const indicatorText = config.levelIndicatorText || '';
        const legendsStr = config.levelLegends || '';
        const legends = legendsStr ? legendsStr.split(',').map((l: string) => l.trim()).filter(Boolean) : [];
        const showMeter = config.showLevelMeter !== false;
        const showProgress = config.showLevelProgress !== false;
        const levelType = config.levelType || 'line';
        const levelColor = config.levelColor || 'theme';
        
        // Get gradient/color based on levelColor
        const getBarBackground = () => {
          switch (levelColor) {
            case 'green-red':
              return 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444)';
            case 'red-green':
              return 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)';
            case 'opaque':
              return 'hsl(var(--foreground))';
            case 'red':
              return '#ef4444';
            case 'blue':
              return '#3b82f6';
            case 'green':
              return '#22c55e';
            case 'yellow':
              return '#eab308';
            default:
              return 'hsl(var(--foreground))';
          }
        };
        
        const renderLineBar = () => (
          <div className="relative w-full">
            {/* Indicator text tooltip */}
            {indicatorText && (
              <div 
                className="absolute -top-8 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                style={{ left: `${percentage}%` }}
              >
                {indicatorText}
                <div 
                  className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"
                />
              </div>
            )}
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              <div 
                className="h-full rounded-full absolute left-0 top-0"
                style={{ 
                  width: `${percentage}%`,
                  background: getBarBackground()
                }}
              />
            </div>
            {/* Indicator circle - only shown when showMeter is true */}
            {showMeter && (
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full shadow-md pointer-events-none"
                style={{ left: `calc(${percentage}% - 8px)` }}
              />
            )}
          </div>
        );
        
        const renderSegmentsBar = () => {
          const segmentCount = legends.length > 0 ? legends.length : 5;
          const filledSegments = Math.ceil((percentage / 100) * segmentCount);
          
          return (
            <div className="relative w-full">
              {/* Indicator text tooltip */}
              {indicatorText && (
                <div 
                  className="absolute -top-8 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-10"
                  style={{ left: `${percentage}%` }}
                >
                  {indicatorText}
                  <div 
                    className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-foreground"
                  />
                </div>
              )}
              <div className="flex gap-1 w-full relative">
                {Array.from({ length: segmentCount }, (_, i) => {
                  const isFilled = i < filledSegments;
                  
                  return (
                    <div 
                      key={i}
                      className={cn(
                        "h-2 flex-1 rounded-full transition-colors",
                        isFilled ? "" : "bg-muted"
                      )}
                      style={isFilled ? { background: levelColor === 'theme' || levelColor === 'opaque' ? 'hsl(var(--foreground))' : getBarBackground() } : undefined}
                    />
                  );
                })}
                {/* Indicator circle - only shown when showMeter is true */}
                {showMeter && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-foreground rounded-full shadow-md pointer-events-none"
                    style={{ left: `calc(${percentage}% - 8px)` }}
                  />
                )}
              </div>
            </div>
          );
        };
        
        return (
          <div className="w-full border border-border rounded-lg p-4 bg-background">
            {/* Header with title and percentage */}
            <div className="flex justify-between items-start mb-1">
              <div className="font-semibold text-sm">{title}</div>
              {showProgress && (
                <div className="text-sm text-muted-foreground">{percentage}%</div>
              )}
            </div>
            
            {/* Subtitle */}
            {subtitle && (
              <div className="text-sm text-muted-foreground mb-2">{subtitle}</div>
            )}
            
            {/* Level bar - always visible */}
            <div className={cn("mt-2", indicatorText ? "pt-6" : "")}>
              {levelType === 'segments' ? renderSegmentsBar() : renderLineBar()}
            </div>
            
            {/* Legends */}
            {legends.length > 0 && (
              <div className="text-xs text-muted-foreground mt-2">
                {legends.join(' · ')}
              </div>
            )}
          </div>
        );
      }
      case 'arguments': {
        const argumentItems = (config.argumentItems || []) as Array<{
          id: string;
          title: string;
          description: string;
          mediaType: 'none' | 'emoji' | 'image';
          emoji?: string;
          imageUrl?: string;
        }>;
        const layout = config.argumentLayout || 'grid-2';
        const disposition = config.argumentDisposition || 'image-text';
        
        const gridClass = {
          'list': 'grid-cols-1',
          'grid-2': 'grid-cols-2',
          'grid-3': 'grid-cols-3',
          'grid-4': 'grid-cols-4',
        }[layout] || 'grid-cols-2';
        
        const isVertical = disposition === 'image-text' || disposition === 'text-image';
        const imageFirst = disposition === 'image-text' || disposition === 'image-left';
        
        return (
          <div className={cn("w-full grid gap-3 p-4", gridClass)}>
              {argumentItems.map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "border border-primary/30 rounded-lg p-4 bg-background flex",
                    isVertical ? "flex-col" : "flex-row gap-3",
                    !imageFirst && isVertical && "flex-col-reverse",
                    !imageFirst && !isVertical && "flex-row-reverse"
                  )}
                >
                  {/* Media area */}
                  {item.mediaType !== 'none' && (
                    <div className={cn(
                      "flex items-center justify-center bg-muted/30 rounded",
                      isVertical ? "w-full h-20 mb-3" : "w-16 h-16 flex-shrink-0"
                    )}>
                      {item.mediaType === 'image' && item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover rounded" />
                      ) : item.mediaType === 'emoji' && item.emoji ? (
                        <span className="text-3xl">{item.emoji}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">Imagem</span>
                      )}
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className={cn("text-center", !isVertical && "text-left flex-1")}>
                    <div 
                      className="font-semibold text-sm rich-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.title) }}
                    />
                    <div 
                      className="text-xs text-muted-foreground mt-1 rich-text"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.description) }}
                    />
                  </div>
                </div>
              ))}
          </div>
        );
      }
      case 'testimonials': {
        const testimonialItems = (config.testimonialItems || []) as Array<{
          id: string;
          name: string;
          handle: string;
          rating: number;
          text: string;
          avatarUrl?: string;
          photoUrl?: string;
        }>;
        const layout = config.testimonialLayout || 'list';
        const borderRadius = config.testimonialBorderRadius || 'small';
        const shadow = config.testimonialShadow || 'none';
        const spacing = config.testimonialSpacing || 'simple';
        
        const borderRadiusClass = {
          'none': 'rounded-none',
          'small': 'rounded-lg',
          'medium': 'rounded-xl',
          'large': 'rounded-2xl',
        }[borderRadius] || 'rounded-lg';
        
        const shadowClass = {
          'none': '',
          'sm': 'shadow-sm',
          'md': 'shadow-md',
          'lg': 'shadow-lg',
        }[shadow] || '';
        
        const spacingClass = {
          'compact': 'p-3 gap-2',
          'simple': 'p-4 gap-3',
          'relaxed': 'p-5 gap-4',
        }[spacing] || 'p-4 gap-3';

        const renderTestimonialCard = (item: typeof testimonialItems[0]) => (
          <div 
            key={item.id} 
            className={cn(
              "border border-border bg-background flex flex-col",
              borderRadiusClass,
              shadowClass,
              spacingClass
            )}
          >
            {/* Rating stars */}
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={cn("text-sm", i < item.rating ? "text-amber-400" : "text-muted-foreground/30")}>
                  ★
                </span>
              ))}
            </div>
            
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              {item.avatarUrl && (
                <img src={item.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.handle}</div>
              </div>
            </div>
            
            {/* Text */}
            <div 
              className="text-sm text-muted-foreground rich-text flex-1"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.text) }}
            />
            
            {/* Photo */}
            {item.photoUrl && (
              <img src={item.photoUrl} alt="" className={cn("w-full h-32 object-cover mt-3", borderRadiusClass)} />
            )}
          </div>
        );

        if (layout === 'carousel') {
          return (
            <div className="w-full p-4 overflow-hidden">
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {testimonialItems.map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-[280px] snap-center">
                    {renderTestimonialCard(item)}
                  </div>
                ))}
              </div>
              {testimonialItems.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {testimonialItems.map((_, i) => (
                    <div key={i} className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-primary" : "bg-muted-foreground/30")} />
                  ))}
                </div>
              )}
            </div>
          );
        }
        
        const gridClass = layout === 'grid-2' ? 'grid-cols-2' : 'grid-cols-1';
        
        return (
          <div className={cn("w-full grid gap-3 p-4", gridClass)}>
            {testimonialItems.map((item) => renderTestimonialCard(item))}
          </div>
        );
      }
      case 'faq': {
        const faqItems = (config.faqItems || []) as FaqItem[];
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const alignClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
        const detailType = config.faqDetailType || 'arrow';
        const firstOpen = config.faqFirstOpen !== false;
        
        return (
          <div className={cn("w-full flex", alignClass)}>
            <div 
              className="p-4 space-y-2"
              style={{ width: `${widthValue}%` }}
            >
              {faqItems.map((item, index) => (
                <div 
                  key={item.id}
                  className="border border-border rounded-lg overflow-hidden bg-background"
                >
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <span className="font-medium text-sm">{item.question}</span>
                    {detailType === 'arrow' ? (
                      <ChevronUp className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        !(firstOpen && index === 0) && "rotate-180"
                      )} />
                    ) : (
                      firstOpen && index === 0 ? (
                        <Minus className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Plus className="w-4 h-4 text-muted-foreground" />
                      )
                    )}
                  </div>
                  {(firstOpen && index === 0) && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'price': {
        const widthValue = config.width || 100;
        const horizontalAlign = config.horizontalAlign || 'start';
        const alignClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
        const layout = config.priceLayout || 'horizontal';
        const style = config.priceStyle || 'theme';
        const title = config.priceTitle || 'Plano PRO';
        const prefix = config.pricePrefix || '';
        const value = config.priceValue || 'R$ 89,90';
        const suffix = config.priceSuffix || '';
        const highlight = config.priceHighlight || '';
        
        const styleClasses = {
          theme: 'bg-background border-border',
          red: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
          info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
          success: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
          warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
        }[style] || 'bg-background border-border';
        
        return (
          <div className={cn("w-full flex", alignClass)}>
            <div 
              className="p-4"
              style={{ width: `${widthValue}%` }}
            >
              <div 
                className={cn(
                  "relative border rounded-xl p-4 transition-all cursor-pointer hover:shadow-md",
                  styleClasses,
                  layout === 'horizontal' ? 'flex items-center justify-between gap-4' : 'flex flex-col gap-2'
                )}
              >
                {/* Highlight badge */}
                {highlight && (
                  <div className="absolute -top-3 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full shadow-sm">
                      {highlight}
                    </span>
                  </div>
                )}
                
                {/* Title */}
                <div className={cn(layout === 'vertical' && 'text-center')}>
                  <h3 className="font-semibold text-lg text-foreground">{title}</h3>
                </div>
                
                {/* Price section */}
                <div className={cn(
                  "flex flex-col",
                  layout === 'vertical' ? 'items-center' : 'items-end'
                )}>
                  {prefix && (
                    <span className="text-xs text-muted-foreground font-medium">{prefix}</span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">{value}</span>
                  </div>
                  {suffix && (
                    <span className="text-xs text-muted-foreground">{suffix}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'before-after': {
        const img1 = config.beforeAfterImage1 || '';
        const img2 = config.beforeAfterImage2 || '';
        const ratio = config.beforeAfterRatio || '1:1';
        const widthValue = config.width || 100;
        const hAlign = config.horizontalAlign || 'start';
        
        const justifyClass = hAlign === 'center' ? 'justify-center' : hAlign === 'end' ? 'justify-end' : 'justify-start';
        const aspectRatioClass = ratio === '1:1' ? 'aspect-square' : ratio === '16:9' ? 'aspect-video' : ratio === '4:3' ? 'aspect-[4/3]' : 'aspect-[9/16]';
        
        return (
          <div className={cn("w-full px-4 py-4 flex", justifyClass)}>
            <div 
              className={cn("relative overflow-hidden rounded-xl border border-border shadow-lg", aspectRatioClass)}
              style={{ width: `${widthValue}%` }}
            >
              {/* Background image (image 2) */}
              <div className="absolute inset-0">
                {img2 ? (
                  <img src={img2} alt="Depois" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Depois</span>
                  </div>
                )}
              </div>
              
              {/* Foreground image (image 1) with clip */}
              <div className="absolute inset-0" style={{ clipPath: 'inset(0 50% 0 0)' }}>
                {img1 ? (
                  <img src={img1} alt="Antes" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm">Antes</span>
                  </div>
                )}
              </div>
              
              {/* Slider handle - floating, no line */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 shadow-[0_2px_12px_rgba(0,0,0,0.15)] flex items-center justify-center z-10"
              >
                <ChevronLeft className="w-3.5 h-3.5 text-neutral-400" />
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400 -ml-1" />
              </div>
            </div>
          </div>
        );
      }
      case 'carousel': {
        const items = config.carouselItems || [
          { id: '1', image: '', description: 'Exemplo de descrição' }
        ];
        const layout = config.carouselLayout || 'image-text';
        const pagination = config.carouselPagination !== false;
        const hasBorder = config.carouselBorder === true;
        const widthValue = config.width || 100;
        const hAlign = config.horizontalAlign || 'start';
        const imageRatio = config.carouselImageRatio || '4:3';
        
        const justifyClass = hAlign === 'center' ? 'justify-center' : hAlign === 'end' ? 'justify-end' : 'justify-start';
        const showImage = layout !== 'text-only';
        const showText = layout !== 'image-only';
        
        const aspectRatioClasses: Record<string, string> = {
          '1:1': 'aspect-square',
          '4:3': 'aspect-[4/3]',
          '3:2': 'aspect-[3/2]',
          '16:9': 'aspect-video',
          '21:9': 'aspect-[21/9]',
          '2:3': 'aspect-[2/3]',
          '9:16': 'aspect-[9/16]',
        };
        
        // Show first item as preview
        const currentItem = items[0];
        
        return (
          <div className={cn("w-full px-4 py-4 flex", justifyClass)}>
            <div 
              className={cn(
                "rounded-2xl overflow-hidden",
                hasBorder && "border border-border shadow-sm"
              )}
              style={{ width: `${widthValue}%` }}
            >
              {/* Image */}
              {showImage && (
                <div className={cn(aspectRatioClasses[imageRatio] || 'aspect-[4/3]', "bg-muted flex items-center justify-center")}>
                  {currentItem?.image ? (
                    <img src={currentItem.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                  )}
                </div>
              )}
              
              {/* Text */}
              {showText && (
                <p className="text-sm text-center py-3 text-foreground/80">
                  {currentItem?.description || 'Exemplo de descrição'}
                </p>
              )}
              
              {/* Pagination dots */}
              {pagination && items.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-3">
                  {items.map((_, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        idx === 0 ? "bg-foreground" : "bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
      case 'metrics': {
        const items = config.metricItems || [];
        const layout = config.metricsLayout || 'grid-2';
        const disposition = config.metricsDisposition || 'legend-chart';
        const widthValue = config.width || 100;
        const hAlign = config.horizontalAlign || 'start';
        
        const justifyClass = hAlign === 'center' ? 'justify-center' : hAlign === 'end' ? 'justify-end' : 'justify-start';
        
        const layoutClasses: Record<string, string> = {
          'list': 'flex flex-col',
          'grid-2': 'grid grid-cols-2',
          'grid-3': 'grid grid-cols-3',
          'grid-4': 'grid grid-cols-4',
        };

        const colorBgClasses: Record<string, string> = {
          theme: 'bg-primary',
          green: 'bg-green-500',
          blue: 'bg-blue-500',
          yellow: 'bg-yellow-500',
          orange: 'bg-orange-500',
          red: 'bg-red-500',
          black: 'bg-foreground',
        };

        const colorStrokeClasses: Record<string, string> = {
          theme: 'stroke-primary',
          green: 'stroke-green-500',
          blue: 'stroke-blue-500',
          yellow: 'stroke-yellow-500',
          orange: 'stroke-orange-500',
          red: 'stroke-red-500',
          black: 'stroke-foreground',
        };

        const colorTextClasses: Record<string, string> = {
          theme: 'text-primary',
          green: 'text-green-500',
          blue: 'text-blue-500',
          yellow: 'text-yellow-500',
          orange: 'text-orange-500',
          red: 'text-red-500',
          black: 'text-foreground',
        };
        
        const renderBarChart = (value: number, color: string) => {
          const height = Math.max(10, (value / 100) * 80);
          return (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{value}%</span>
              <div className="w-8 h-14 bg-muted/30 rounded-sm flex items-end justify-center overflow-hidden">
                <div 
                  className={cn("w-6 rounded-t-sm", colorBgClasses[color] || 'bg-primary')}
                  style={{ height: `${height}%` }}
                />
              </div>
            </div>
          );
        };

        const renderCircularChart = (value: number, color: string) => {
          const radius = 20;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (value / 100) * circumference;
          
          return (
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
                <circle
                  cx="25"
                  cy="25"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/30"
                />
                <circle
                  cx="25"
                  cy="25"
                  r={radius}
                  fill="none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className={colorStrokeClasses[color] || 'stroke-primary'}
                />
              </svg>
              <span className={cn("absolute text-xs font-semibold", colorTextClasses[color] || 'text-primary')}>
                {value}%
              </span>
            </div>
          );
        };
        
        return (
          <div className={cn("w-full px-4 py-4 flex", justifyClass)}>
            <div 
              className={cn("gap-2", layoutClasses[layout])}
              style={{ width: `${widthValue}%` }}
            >
              {items.map((item: any) => (
                <div key={item.id} className="flex flex-col items-center justify-center gap-2 p-3 bg-card rounded-lg border border-border">
                  {disposition === 'legend-chart' ? (
                    <>
                      <p className="text-xs text-center text-muted-foreground px-1 leading-relaxed line-clamp-2">
                        {item.label}
                      </p>
                      {item.type === 'bar' 
                        ? renderBarChart(item.value, item.color)
                        : renderCircularChart(item.value, item.color)
                      }
                    </>
                  ) : (
                    <>
                      {item.type === 'bar' 
                        ? renderBarChart(item.value, item.color)
                        : renderCircularChart(item.value, item.color)
                      }
                      <p className="text-xs text-center text-muted-foreground px-1 leading-relaxed line-clamp-2">
                        {item.label}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      case 'charts': {
        const chartConfig = config.chartConfig || getDefaultChartConfig();
        return (
          <div className="p-4">
            <ChartPlayer config={chartConfig} />
          </div>
        );
      }
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-2 m-4">
            <span className="text-lg">{comp.icon}</span>
            <span className="text-sm">{comp.name}</span>
          </div>
        );
    }
  };

  return (
    <div 
      className={cn(
        "flex-1 transition-colors duration-200 overflow-y-auto",
        isDragOver && "bg-primary/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {components.length === 0 ? (
        <div className="min-h-full flex flex-col items-center justify-center">
          <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl m-4 transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "border-border"
          )}>
            <Plus className={cn("w-8 h-8 mb-3 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
            <p className={cn("text-sm font-medium transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")}>
              {isDragOver ? "Solte o componente aqui" : "Arraste componentes aqui"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              para criar sua página personalizada
            </p>
          </div>
        </div>
      ) : (
        <div className="min-h-full flex flex-col items-center py-2.5 px-4">
          <div className="w-full max-w-md my-auto">
            <Reorder.Group axis="y" values={components} onReorder={onComponentsChange} className="flex flex-wrap gap-2">
              {components.map((comp) => {
                const config = comp.config || {};
                const widthValue = config.width || 100;
                const horizontalAlign = config.horizontalAlign || 'start';
                const verticalAlign = config.verticalAlign || 'auto';
                
                // Calculate alignment classes for the component content
                const justifyClass = horizontalAlign === 'center' ? 'justify-center' : horizontalAlign === 'end' ? 'justify-end' : 'justify-start';
                const alignClass = verticalAlign === 'center' ? 'items-center' : verticalAlign === 'end' ? 'items-end' : verticalAlign === 'start' ? 'items-start' : '';
                
                return (
                  <Reorder.Item 
                    key={comp.id} 
                    value={comp}
                    style={{ 
                      width: widthValue === 100 ? '100%' : `calc(${widthValue}% - 4px)`,
                      flexShrink: 0,
                    }}
                    className={cn(
                      "flex transition-[width] duration-300 ease-out",
                      justifyClass,
                      alignClass
                    )}
                  >
                    <div 
                      className={cn(
                        "group relative border rounded-lg cursor-pointer transition-all w-full",
                        selectedComponentId === comp.id 
                          ? "border-primary ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => onSelectComponent(comp)}
                      style={{ color: designSettings?.textColor }}
                    >
                      {/* Inline toolbar at top - visible on hover */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-0.5 bg-primary rounded-md p-1 shadow-lg">
                        <button 
                          className="p-1.5 hover:bg-primary-foreground/20 rounded cursor-grab"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(comp); }}
                          className="p-1.5 hover:bg-primary-foreground/20 rounded"
                        >
                          <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDuplicate(comp); }}
                          className="p-1.5 hover:bg-primary-foreground/20 rounded"
                        >
                          <Copy className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleRemove(comp.id); }}
                          className="p-1.5 hover:bg-primary-foreground/20 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-primary-foreground" />
                        </button>
                      </div>
                      <div className="overflow-hidden rounded-lg">
                        {renderComponentPreview(comp)}
                      </div>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>
            
            {/* Drop indicator at the end */}
            <div className={cn(
              "mt-4 p-4 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors w-full",
              isDragOver ? "border-primary bg-primary/5" : "border-border/50"
            )}>
              <Plus className={cn("w-4 h-4 mr-2", isDragOver ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-xs", isDragOver ? "text-primary" : "text-muted-foreground")}>
                {isDragOver ? "Soltar aqui" : "Arraste mais componentes"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export type { DroppedComponent, ComponentConfig };