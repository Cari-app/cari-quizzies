import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MediaLibraryPicker } from '@/components/ui/media-library-picker';
import { Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showUrlInput?: boolean;
}

export function ImageInput({
  value,
  onChange,
  placeholder = 'Clique para selecionar imagem',
  className,
  showUrlInput = true,
}: ImageInputProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Image preview / Upload button */}
      <div
        onClick={() => setMediaPickerOpen(true)}
        className={cn(
          "border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden",
          value
            ? "border-border hover:border-primary/50"
            : "border-border hover:border-primary/50 p-6 text-center"
        )}
      >
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt="Preview"
              className="w-full h-32 object-contain bg-muted/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaPickerOpen(true);
                }}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Trocar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          </>
        )}
      </div>

      {/* Optional URL input */}
      {showUrlInput && (
        <Input
          placeholder="Ou cole uma URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}

      {/* Media Library Picker */}
      <MediaLibraryPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onSelect={onChange}
        currentValue={value}
      />
    </div>
  );
}
