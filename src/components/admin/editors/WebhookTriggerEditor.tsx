import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Webhook, Info } from 'lucide-react';
import { ComponentConfig } from './types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WebhookTriggerEditorProps {
  config: ComponentConfig;
  onConfigChange: (updates: Partial<ComponentConfig>) => void;
}

export function WebhookTriggerComponentTab({ config, onConfigChange }: WebhookTriggerEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
        <Webhook className="w-5 h-5 text-orange-500" />
        <div>
          <p className="text-sm font-medium">Ponto de disparo do Webhook</p>
          <p className="text-xs text-muted-foreground">
            Quando esta etapa carregar, todos os dados coletados serão enviados
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-normal">Ativo</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Quando ativo, dispara o webhook assim que a etapa carregar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Habilita o disparo automático
          </p>
        </div>
        <Switch
          checked={config.webhookActive !== false}
          onCheckedChange={(checked) => onConfigChange({ webhookActive: checked })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Descrição (opcional)</Label>
        </div>
        <Input
          value={config.webhookDescription || ''}
          onChange={(e) => onConfigChange({ webhookDescription: e.target.value })}
          placeholder="Ex: Captura de lead inicial"
        />
        <p className="text-xs text-muted-foreground">
          Identificação para ajudar a organizar seus webhooks
        </p>
      </div>

      <div className="p-3 bg-muted/50 rounded-lg border text-xs space-y-1">
        <p className="font-medium">O que será enviado:</p>
        <ul className="text-muted-foreground space-y-0.5">
          <li>• Todos os campos configurados nas Integrações</li>
          <li>• Dados coletados até esta etapa</li>
          <li>• IDs personalizados definidos</li>
        </ul>
      </div>
    </div>
  );
}