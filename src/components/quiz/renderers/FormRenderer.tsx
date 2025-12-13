import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { RendererProps } from './types';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  customId?: string;
  defaultCountry?: string;
  hideLabel?: boolean;
}

const COUNTRIES = [
  { code: 'BR', flag: '🇧🇷', dial: '+55', mask: '(00) 0 0000-0000' },
  { code: 'US', flag: '🇺🇸', dial: '+1', mask: '(000) 000-0000' },
  { code: 'PT', flag: '🇵🇹', dial: '+351', mask: '000 000 000' },
  { code: 'AR', flag: '🇦🇷', dial: '+54', mask: '(00) 0000-0000' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', mask: '(00) 0000-0000' },
  { code: 'ES', flag: '🇪🇸', dial: '+34', mask: '000 000 000' },
];

function applyPhoneMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, '');
  let result = '';
  let digitIndex = 0;
  
  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === '0') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += mask[i];
    }
  }
  
  return result;
}

export function FormRenderer({ 
  component, 
  config, 
  formData,
  onInputChange, 
  processTemplate, 
  processTemplateHtml,
  selectedDate,
  onDateChange
}: RendererProps) {
  const fields: FormField[] = config.formFields || [];
  const spacing = config.formSpacing || 'normal';
  
  const spacingClass = {
    compact: 'space-y-2',
    normal: 'space-y-4',
    relaxed: 'space-y-6',
  }[spacing];

  return (
    <div className="py-4">
      {config.formTitle && (
        <div 
          className="rich-text text-lg font-medium mb-4" 
          dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.formTitle) }} 
        />
      )}
      
      <div className={spacingClass}>
        {fields.map((field) => (
          <FormFieldRenderer
            key={field.id}
            field={field}
            value={formData?.[field.customId || field.id] || ''}
            onInputChange={onInputChange}
            componentId={component.id}
            processTemplate={processTemplate}
            processTemplateHtml={processTemplateHtml}
            selectedDate={selectedDate}
            onDateChange={onDateChange}
          />
        ))}
      </div>
    </div>
  );
}

interface FormFieldRendererProps {
  field: FormField;
  value: string;
  componentId: string;
  onInputChange: (componentId: string, customId: string | undefined, value: string) => void;
  processTemplate: (text: string) => string;
  processTemplateHtml: (html: string) => string;
  selectedDate?: Record<string, Date | undefined>;
  onDateChange?: (fieldId: string, date: Date | undefined) => void;
}

function FormFieldRenderer({ 
  field,
  value,
  componentId,
  onInputChange,
  processTemplate,
  processTemplateHtml,
  selectedDate,
  onDateChange
}: FormFieldRendererProps) {
  const fieldKey = field.customId || field.id;
  
  // Phone state
  const defaultCountryCode = field.defaultCountry || 'BR';
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === defaultCountryCode) || COUNTRIES[0]
  );
  const [countryOpen, setCountryOpen] = useState(false);

  // Textarea
  if (field.type === 'textarea') {
    return (
      <div>
        {field.label && !field.hideLabel && (
          <label className="text-sm font-medium mb-1.5 block">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <Textarea
          placeholder={field.placeholder || ''}
          value={value}
          onChange={(e) => onInputChange(componentId, fieldKey, e.target.value)}
          className="w-full bg-transparent min-h-[80px]"
          required={field.required}
        />
      </div>
    );
  }

  // Date
  if (field.type === 'date') {
    const dateValue = selectedDate?.[fieldKey];
    
    return (
      <div>
        {field.label && !field.hideLabel && (
          <label className="text-sm font-medium mb-1.5 block">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
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
                onDateChange?.(fieldKey, date);
                if (date) {
                  onInputChange(componentId, fieldKey, format(date, 'yyyy-MM-dd'));
                }
              }}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Phone with country selector
  if (field.type === 'phone') {
    const extractLocalNumber = (fullValue: string | undefined): string => {
      if (!fullValue) return '';
      const withoutDialCode = fullValue.replace(selectedCountry.dial, '').trim();
      return applyPhoneMask(withoutDialCode.replace(/\D/g, ''), selectedCountry.mask);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digits = rawValue.replace(/\D/g, '');
      const maskedValue = applyPhoneMask(digits, selectedCountry.mask);
      const fullValue = `${selectedCountry.dial} ${maskedValue}`;
      onInputChange(componentId, fieldKey, fullValue);
    };

    const displayValue = extractLocalNumber(value);

    return (
      <div>
        {field.label && !field.hideLabel && (
          <label className="text-sm font-medium mb-1.5 block">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="flex gap-2">
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-1 px-3 bg-transparent shrink-0"
              >
                <span className="text-lg">{selectedCountry.flag}</span>
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1" align="start">
              {COUNTRIES.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setCountryOpen(false);
                    const digits = value?.replace(/\D/g, '') || '';
                    if (digits) {
                      const maskedValue = applyPhoneMask(digits, country.mask);
                      onInputChange(componentId, fieldKey, `${country.dial} ${maskedValue}`);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-accent transition-colors",
                    selectedCountry.code === country.code && "bg-accent"
                  )}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span>{country.dial}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
          <Input
            type="tel"
            placeholder={selectedCountry.mask.replace(/0/g, '0')}
            value={displayValue}
            onChange={handlePhoneChange}
            className="flex-1 bg-transparent"
            required={field.required}
          />
        </div>
      </div>
    );
  }

  // Standard inputs: text, email, number
  const inputType = field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text';

  return (
    <div>
      {field.label && !field.hideLabel && (
        <label className="text-sm font-medium mb-1.5 block">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Input
        type={inputType}
        placeholder={field.placeholder || ''}
        value={value}
        onChange={(e) => onInputChange(componentId, fieldKey, e.target.value)}
        className="w-full bg-transparent"
        required={field.required}
      />
    </div>
  );
}
