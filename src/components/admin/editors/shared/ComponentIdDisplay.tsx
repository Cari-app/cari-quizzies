import { Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateSlug } from '../types';

interface ComponentIdDisplayProps {
  id: string;
  customId?: string;
  type: string;
  onUpdateCustomId: (customId: string) => void;
}

export function ComponentIdDisplay({ id, customId, type, onUpdateCustomId }: ComponentIdDisplayProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('ID copiado!');
  };

  const effectiveId = customId || id;

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs text-muted-foreground">ID Customizado</Label>
        <div className="flex gap-1 mt-1">
          <Input
            value={customId || ''}
            onChange={(e) => onUpdateCustomId(generateSlug(e.target.value))}
            placeholder={`${type}_${id.slice(0, 8)}`}
            className="flex-1 font-mono text-xs"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => copyToClipboard(effectiveId)}
            title="Copiar ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
        <span className="text-muted-foreground/60">UUID:</span>
        <span className="truncate flex-1">{id}</span>
        <button
          onClick={() => copyToClipboard(id)}
          className="hover:text-foreground transition-colors"
          title="Copiar UUID"
        >
          <Copy className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
