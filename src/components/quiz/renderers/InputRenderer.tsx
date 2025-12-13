import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { RendererProps } from './types';

interface InputRendererProps extends RendererProps {
  type: 'input' | 'email' | 'phone' | 'number' | 'textarea' | 'date';
}

export function InputRenderer({ 
  component, 
  config, 
  value, 
  type,
  onInputChange, 
  processTemplate, 
  processTemplateHtml,
  selectedDate,
  onDateChange
}: InputRendererProps) {
  const customId = component.customId || config.customId;
  const dateValue = selectedDate?.[customId || component.id];

  if (type === 'textarea') {
    return (
      <div className="py-4">
        {config.label && (
          <div 
            className="rich-text text-sm font-medium mb-2" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} 
          />
        )}
        <Textarea
          placeholder={processTemplate(config.placeholder || '')}
          value={value}
          onChange={(e) => onInputChange(component.id, customId, e.target.value)}
          className="w-full bg-transparent min-h-[100px]"
          required={config.required}
        />
        {config.helpText && (
          <p className="text-xs text-muted-foreground mt-1">
            {processTemplate(config.helpText)}
          </p>
        )}
      </div>
    );
  }

  if (type === 'date') {
    return (
      <div className="py-4">
        {config.label && (
          <div 
            className="rich-text text-sm font-medium mb-2" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} 
          />
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-transparent",
                !dateValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateValue ? format(dateValue, 'PPP', { locale: ptBR }) : 'Selecione uma data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={(date) => {
                onDateChange?.(customId || component.id, date);
                if (date) {
                  onInputChange(component.id, customId, format(date, 'yyyy-MM-dd'));
                }
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        {config.helpText && (
          <p className="text-xs text-muted-foreground mt-1">
            {processTemplate(config.helpText)}
          </p>
        )}
      </div>
    );
  }

  // Standard input types: input, email, phone, number
  const inputType = type === 'email' ? 'email' : type === 'number' ? 'number' : 'text';

  return (
    <div className="py-4">
      {config.label && (
        <div 
          className="rich-text text-sm font-medium mb-2" 
          dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} 
        />
      )}
      <Input
        type={inputType}
        placeholder={processTemplate(config.placeholder || '')}
        value={value}
        onChange={(e) => onInputChange(component.id, customId, e.target.value)}
        className="w-full bg-transparent"
        required={config.required}
      />
      {config.helpText && (
        <p className="text-xs text-muted-foreground mt-1">
          {processTemplate(config.helpText)}
        </p>
      )}
    </div>
  );
}
