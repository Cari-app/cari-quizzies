import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, CalendarIcon, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface QuizPlayerProps {
  slug?: string;
}

interface ComponentConfig {
  label?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  buttonText?: string;
  buttonStyle?: string;
  buttonAction?: string;
  content?: string;
  textAlign?: string;
  fontSize?: string;
  mediaUrl?: string;
  altText?: string;
  height?: number;
  options?: Array<{ id: string; text: string; value: string }>;
  allowMultiple?: boolean;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  customId?: string;
  // Height/Weight specific
  layoutType?: 'input' | 'ruler';
  unit?: 'cm' | 'pol' | 'kg' | 'lb';
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
}

interface DroppedComponent {
  id: string;
  type: string;
  name: string;
  icon: string;
  config?: ComponentConfig;
  customId?: string;
}

interface PageSettings {
  showLogo?: boolean;
  showProgress?: boolean;
  allowBack?: boolean;
  logoUrl?: string;
  logoSize?: string;
}

interface QuizStage {
  id: string;
  titulo: string | null;
  ordem: number;
  components: DroppedComponent[];
  pageSettings?: PageSettings;
}

interface QuizData {
  id: string;
  titulo: string;
  descricao: string | null;
  slug: string | null;
}

export function QuizPlayer({ slug }: QuizPlayerProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [stages, setStages] = useState<QuizStage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Record<string, Date | undefined>>({});

  const currentStage = stages[currentStageIndex];
  const pageSettings = currentStage?.pageSettings;

  // Load quiz by slug or id from Supabase
  useEffect(() => {
    const loadQuiz = async () => {
      if (!slug) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setNotFound(false);

      try {
        // Try to find by slug first
        let { data: quizData } = await supabase
          .from('quizzes')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        // If not found by slug, try by id
        if (!quizData) {
          const { data } = await supabase
            .from('quizzes')
            .select('*')
            .eq('id', slug)
            .eq('is_active', true)
            .maybeSingle();
          quizData = data;
        }

        if (!quizData) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }

        setQuiz(quizData);

        // Load etapas (stages)
        const { data: etapasData } = await supabase
          .from('etapas')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('ordem', { ascending: true });

        const formattedStages: QuizStage[] = (etapasData || []).map((e) => {
          const configuracoes = e.configuracoes as Record<string, any> | null;
          return {
            id: e.id,
            titulo: e.titulo,
            ordem: e.ordem,
            components: (configuracoes?.components as DroppedComponent[]) || [],
            pageSettings: configuracoes?.pageSettings as PageSettings | undefined,
          };
        });
        setStages(formattedStages);
      } catch (error) {
        console.error('Error loading quiz:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [slug]);

  const handleInputChange = (componentId: string, customId: string | undefined, value: any) => {
    const key = customId || componentId;
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (componentId: string, customId: string | undefined, date: Date | undefined) => {
    const key = customId || componentId;
    setSelectedDate(prev => ({ ...prev, [key]: date }));
    if (date) {
      setFormData(prev => ({ ...prev, [key]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleNext = () => {
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Form data submitted:', formData);
    // TODO: Save responses to database
    navigate('/');
  };

  const renderComponent = (comp: DroppedComponent) => {
    const config = comp.config || {};
    const customId = comp.customId || config.customId;
    const key = customId || comp.id;
    const value = formData[key] || '';
    const dateValue = selectedDate[key];

    switch (comp.type) {
      case 'text':
        return (
          <div className={cn(
            "py-4",
            config.textAlign === 'center' && 'text-center',
            config.textAlign === 'right' && 'text-right'
          )}>
            <p className={cn(
              "text-foreground",
              config.fontSize === 'sm' && 'text-sm',
              config.fontSize === 'lg' && 'text-lg',
              config.fontSize === 'xl' && 'text-xl',
              config.fontSize === '2xl' && 'text-2xl font-semibold'
            )}>
              {config.content || ''}
            </p>
          </div>
        );

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <Input
              type={comp.type === 'email' ? 'email' : comp.type === 'number' ? 'number' : 'text'}
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );

      case 'height':
      case 'weight': {
        const isRulerLayout = config.layoutType === 'ruler';
        const unit = config.unit || (comp.type === 'height' ? 'cm' : 'kg');
        const altUnit = comp.type === 'height' ? 'pol' : 'lb';
        const minVal = config.minValue || (comp.type === 'height' ? 100 : 30);
        const maxVal = config.maxValue || (comp.type === 'height' ? 220 : 200);
        const defaultVal = config.defaultValue || (comp.type === 'height' ? 170 : 70);
        const currentValue = typeof value === 'number' ? value : defaultVal;
        
        if (isRulerLayout) {
          return (
            <div className="py-4">
              {/* Unit Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex bg-muted rounded-full p-1">
                  <button 
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                      "bg-foreground text-background"
                    )}
                  >
                    {unit}
                  </button>
                  <button 
                    className="px-4 py-1.5 text-sm font-medium rounded-full transition-colors text-muted-foreground"
                  >
                    {altUnit}
                  </button>
                </div>
              </div>
              
              {/* Value Display */}
              <div className="text-center mb-4">
                <span className="text-5xl font-semibold">{currentValue}</span>
                <span className="text-xl text-muted-foreground ml-1">{unit}</span>
              </div>
              
              {/* Ruler with Slider */}
              <div className="relative py-4">
                {/* Indicator - pointing down from top */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-foreground z-10" />
                <div className="absolute left-1/2 -translate-x-1/2 top-2 w-px h-4 bg-foreground z-10" />
                
                <div className="flex justify-between items-end h-8 mt-4">
                  {Array.from({ length: 21 }, (_, i) => {
                    const isMajor = i % 5 === 0;
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "w-px bg-border",
                          isMajor ? "h-6" : "h-3"
                        )} 
                      />
                    );
                  })}
                </div>
                
                <Slider
                  value={[currentValue]}
                  onValueChange={(vals) => handleInputChange(comp.id, customId, vals[0])}
                  min={minVal}
                  max={maxVal}
                  step={1}
                  className="mt-2"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{minVal + Math.round((maxVal - minVal) * 0.25)}</span>
                  <span>{Math.round((minVal + maxVal) / 2)}</span>
                  <span>{minVal + Math.round((maxVal - minVal) * 0.75)}</span>
                </div>
              </div>
              
              <p className="text-center text-xs text-muted-foreground mt-2">Arraste para ajustar</p>
              {config.helpText && <p className="text-xs text-muted-foreground mt-1 text-center">{config.helpText}</p>}
            </div>
          );
        }
        
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <Input
              type="number"
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );
      }

      case 'textarea':
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <textarea
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm resize-none min-h-[100px]"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );

      case 'date':
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full px-4 py-3 bg-background border border-border rounded-lg text-sm flex items-center justify-between transition-colors hover:border-primary/50",
                    !dateValue && "text-muted-foreground"
                  )}
                >
                  <span>{dateValue ? format(dateValue, 'dd/MM/yyyy', { locale: ptBR }) : 'dd/mm/aaaa'}</span>
                  <CalendarIcon className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => handleDateChange(comp.id, customId, date)}
                  locale={ptBR}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );

      case 'button':
        const buttonAction = config.buttonAction || 'next';
        return (
          <div className="py-4">
            <Button
              onClick={buttonAction === 'submit' ? handleSubmit : handleNext}
              className={cn(
                "w-full",
                config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
                config.buttonStyle === 'outline' && "border border-border bg-transparent"
              )}
            >
              {config.buttonText || 'Continuar'}
            </Button>
          </div>
        );

      case 'options':
      case 'single':
        return (
          <div className="py-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="space-y-2">
              {(config.options || []).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleInputChange(comp.id, customId, opt.value)}
                  className={cn(
                    "w-full p-4 rounded-lg border text-sm text-left flex items-center gap-3 transition-colors",
                    value === opt.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    value === opt.value ? "border-primary bg-primary" : "border-border"
                  )}>
                    {value === opt.value && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'multiple':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="py-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="space-y-2">
              {(config.options || []).map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const newValues = isSelected
                        ? selectedValues.filter((v: string) => v !== opt.value)
                        : [...selectedValues, opt.value];
                      handleInputChange(comp.id, customId, newValues);
                    }}
                    className={cn(
                      "w-full p-4 rounded-lg border text-sm text-left flex items-center gap-3 transition-colors",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                      isSelected ? "border-primary bg-primary" : "border-border"
                    )}>
                      {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                    </div>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'yesno':
        return (
          <div className="py-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="flex gap-3">
              {(config.options || [{ id: '1', text: 'Sim', value: 'yes' }, { id: '2', text: 'Não', value: 'no' }]).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleInputChange(comp.id, customId, opt.value)}
                  className={cn(
                    "flex-1 py-3 rounded-lg text-sm font-medium transition-colors",
                    value === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "border border-border hover:border-primary/50"
                  )}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        );

      case 'slider':
        const sliderValue = typeof value === 'number' ? value : config.sliderMin || 0;
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <div className="pt-4">
              <Slider
                value={[sliderValue]}
                onValueChange={(vals) => handleInputChange(comp.id, customId, vals[0])}
                min={config.sliderMin || 0}
                max={config.sliderMax || 100}
                step={config.sliderStep || 1}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{config.sliderMin || 0}</span>
                <span className="font-medium text-foreground">{sliderValue}</span>
                <span>{config.sliderMax || 100}</span>
              </div>
            </div>
          </div>
        );

      case 'image':
        return config.mediaUrl ? (
          <div className="py-4">
            <img src={config.mediaUrl} alt={config.altText || ''} className="w-full rounded-lg" />
          </div>
        ) : null;

      case 'video':
        return config.mediaUrl ? (
          <div className="py-4">
            <video src={config.mediaUrl} controls className="w-full rounded-lg" />
          </div>
        ) : null;

      case 'spacer':
        return <div style={{ height: config.height || 24 }} />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Quiz não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Este quiz não tem etapas</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  const progressValue = stages.length > 1 ? ((currentStageIndex + 1) / stages.length) * 100 : 100;
  const showHeader = pageSettings?.showProgress || (pageSettings?.allowBack && currentStageIndex > 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {showHeader && (
        <div className="p-4 border-b border-border flex items-center gap-4 shrink-0">
          {pageSettings?.allowBack && currentStageIndex > 0 && (
            <button onClick={handleBack} className="p-1 hover:bg-accent rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {pageSettings?.showProgress && (
            <Progress value={progressValue} className="h-1.5 flex-1" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Stage components */}
          <div className="space-y-2">
            {currentStage?.components.map((comp) => (
              <div key={comp.id}>
                {renderComponent(comp)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
