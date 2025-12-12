import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface QuizPlayerProps {
  slug?: string;
}

interface QuizComponent {
  id: string;
  tipo: string;
  titulo: string | null;
  subtitulo: string | null;
  texto_botao: string | null;
  opcoes: any;
  configuracoes: Record<string, any> | null;
  ordem: number;
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
  const [components, setComponents] = useState<QuizComponent[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

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

        // Load etapas (components)
        const { data: etapasData } = await supabase
          .from('etapas')
          .select('*')
          .eq('quiz_id', quizData.id)
          .order('ordem', { ascending: true });

        const formattedComponents: QuizComponent[] = (etapasData || []).map((e) => ({
          id: e.id,
          tipo: e.tipo,
          titulo: e.titulo,
          subtitulo: e.subtitulo,
          texto_botao: e.texto_botao,
          opcoes: e.opcoes,
          configuracoes: e.configuracoes as Record<string, any> | null,
          ordem: e.ordem,
        }));
        setComponents(formattedComponents);
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

  const handleSubmit = () => {
    console.log('Form data submitted:', formData);
    // TODO: Save responses to database
    navigate('/');
  };

  const renderComponent = (comp: QuizComponent) => {
    const config = comp.configuracoes || {};
    const customId = config.customId;
    const value = formData[customId || comp.id] || '';

    switch (comp.tipo) {
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
              {config.content || comp.titulo || ''}
            </p>
          </div>
        );

      case 'input':
      case 'email':
      case 'phone':
      case 'number':
      case 'height':
      case 'weight':
        return (
          <div className="py-4">
            {config.label && <label className="text-sm font-medium mb-2 block">{config.label}</label>}
            <Input
              type={comp.tipo === 'email' ? 'email' : comp.tipo === 'number' || comp.tipo === 'height' || comp.tipo === 'weight' ? 'number' : 'text'}
              placeholder={config.placeholder || ''}
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );

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
            <Input
              type="date"
              value={value}
              onChange={(e) => handleInputChange(comp.id, customId, e.target.value)}
              className="w-full"
              required={config.required}
            />
            {config.helpText && <p className="text-xs text-muted-foreground mt-1">{config.helpText}</p>}
          </div>
        );

      case 'button':
        return (
          <div className="py-4">
            <Button
              onClick={handleSubmit}
              className={cn(
                "w-full",
                config.buttonStyle === 'secondary' && "bg-secondary text-secondary-foreground",
                config.buttonStyle === 'outline' && "border border-border bg-transparent"
              )}
            >
              {config.buttonText || comp.texto_botao || 'Continuar'}
            </Button>
          </div>
        );

      case 'options':
      case 'single':
        return (
          <div className="py-4">
            {config.label && <p className="text-sm font-medium mb-3">{config.label}</p>}
            <div className="space-y-2">
              {(config.options || comp.opcoes || []).map((opt: any) => (
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
              {(config.options || comp.opcoes || []).map((opt: any) => {
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
              {(config.options || comp.opcoes || [{ id: '1', text: 'Sim', value: 'yes' }, { id: '2', text: 'Não', value: 'no' }]).map((opt: any) => (
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

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground text-sm">Este quiz não tem componentes</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 p-2 hover:bg-muted rounded-lg transition-colors inline-flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        {/* Quiz content */}
        <div className="space-y-2">
          {components.map((comp) => (
            <div key={comp.id}>
              {renderComponent(comp)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}