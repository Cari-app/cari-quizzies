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

interface InputRendererProps extends RendererProps {
  type: 'input' | 'email' | 'phone' | 'number' | 'textarea' | 'date';
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
  
  const defaultCountryCode = config.defaultCountry || 'BR';
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRIES.find(c => c.code === defaultCountryCode) || COUNTRIES[0]
  );
  const [countryOpen, setCountryOpen] = useState(false);

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

  // Phone input with country selector and mask
  if (type === 'phone') {
    // Extract just the local number (digits only, without country code digits)
    const extractLocalNumber = (fullValue: string | undefined): string => {
      if (!fullValue) return '';
      // Remove the dial code prefix and any non-digit characters for clean display
      const withoutDialCode = fullValue.replace(selectedCountry.dial, '').trim();
      return applyPhoneMask(withoutDialCode.replace(/\D/g, ''), selectedCountry.mask);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digits = rawValue.replace(/\D/g, '');
      const maskedValue = applyPhoneMask(digits, selectedCountry.mask);
      // Always save the complete value: dial code + masked number
      const fullValue = `${selectedCountry.dial} ${maskedValue}`;
      onInputChange(component.id, customId, fullValue);
    };

    const displayValue = extractLocalNumber(value);

    return (
      <div className="py-4">
        {config.label && (
          <div 
            className="rich-text text-sm font-medium mb-2" 
            dangerouslySetInnerHTML={{ __html: processTemplateHtml(config.label) }} 
          />
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
                    // Reset the value with new country code
                    const digits = value?.replace(/\D/g, '') || '';
                    if (digits) {
                      const maskedValue = applyPhoneMask(digits, country.mask);
                      onInputChange(component.id, customId, `${country.dial} ${maskedValue}`);
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
            required={config.required}
          />
        </div>
        {config.helpText && (
          <p className="text-xs text-muted-foreground mt-1">
            {processTemplate(config.helpText)}
          </p>
        )}
      </div>
    );
  }

  // Standard input types: input, email, number
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
