import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Webhook, Loader2, CheckCircle2, XCircle, ExternalLink, Save, Info, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface WebhookSettings {
  sendName?: boolean;
  sendEmail?: boolean;
  sendPhone?: boolean;
  customFieldIds?: string;
}

interface IntegrationsEditorProps {
  quizId: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  webhookSettings?: WebhookSettings;
  onWebhookUrlChange: (url: string) => void;
  onWebhookEnabledChange: (enabled: boolean) => void;
  onWebhookSettingsChange: (settings: WebhookSettings) => void;
}

export function IntegrationsEditor({
  quizId,
  webhookUrl,
  webhookEnabled,
  webhookSettings = {},
  onWebhookUrlChange,
  onWebhookEnabledChange,
  onWebhookSettingsChange,
}: IntegrationsEditorProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleSaveWebhook = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({
          webhook_url: webhookUrl || null,
          webhook_enabled: webhookEnabled,
          webhook_settings: JSON.parse(JSON.stringify(webhookSettings)),
        })
        .eq('id', quizId);

      if (error) throw error;

      toast.success('Webhook salvo com sucesso!');
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast.error('Erro ao salvar webhook');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast.error('Configure a URL do webhook primeiro');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await supabase.functions.invoke('n8n-webhook', {
        body: {
          quiz_id: quizId,
          event_type: 'test',
          data: {
            message: 'Teste de conexão do webhook',
            timestamp: new Date().toISOString(),
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTestResult('success');
      toast.success('Webhook testado com sucesso!');
    } catch (error) {
      console.error('Webhook test error:', error);
      setTestResult('error');
      toast.error('Erro ao testar webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const updateSettings = (key: keyof WebhookSettings, value: any) => {
    onWebhookSettingsChange({
      ...webhookSettings,
      [key]: value,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Integrações</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecte seu quiz a ferramentas externas
        </p>
      </div>

      {/* N8N Integration Card */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Webhook className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-medium">Webhook</h3>
            <p className="text-sm text-muted-foreground">
              {webhookUrl ? 'Configurado' : 'Não configurado'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Switch
            checked={webhookEnabled}
            onCheckedChange={onWebhookEnabledChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSheetOpen(true)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </div>

      {/* Future integrations placeholder */}
      <div className="flex items-center justify-between p-4 border border-dashed rounded-lg opacity-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
            <Webhook className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground">Mais integrações</h3>
            <p className="text-sm text-muted-foreground">Em breve...</p>
          </div>
        </div>
      </div>

      {/* Edit Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <SheetTitle>Webhook</SheetTitle>
                <SheetDescription>Configure a integração de webhook</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* URL */}
            <div className="space-y-2">
              <Label htmlFor="webhook_url" className="text-sm font-medium">
                URL do Webhook
              </Label>
              <Input
                id="webhook_url"
                value={webhookUrl}
                onChange={(e) => onWebhookUrlChange(e.target.value)}
                placeholder="https://seu-n8n.com/webhook/..."
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL do webhook do seu workflow N8N
              </p>
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Campos a enviar</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Selecione quais campos serão enviados no webhook</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-name"
                    checked={webhookSettings.sendName ?? true}
                    onCheckedChange={(checked) => updateSettings('sendName', checked)}
                  />
                  <Label htmlFor="send-name" className="text-sm font-normal">Nome</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-email"
                    checked={webhookSettings.sendEmail ?? true}
                    onCheckedChange={(checked) => updateSettings('sendEmail', checked)}
                  />
                  <Label htmlFor="send-email" className="text-sm font-normal">Email</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="send-phone"
                    checked={webhookSettings.sendPhone ?? true}
                    onCheckedChange={(checked) => updateSettings('sendPhone', checked)}
                  />
                  <Label htmlFor="send-phone" className="text-sm font-normal">Telefone</Label>
                </div>
              </div>
            </div>

            {/* Custom Field IDs */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-fields">IDs Personalizados</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">IDs dos componentes cujas respostas você quer incluir</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="custom-fields"
                placeholder="altura, peso, objetivo"
                value={webhookSettings.customFieldIds || ''}
                onChange={(e) => updateSettings('customFieldIds', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separe os IDs por vírgula
              </p>
            </div>

            {/* Info */}
            <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Como disparar?</p>
              <p className="text-xs text-muted-foreground mt-1">
                Adicione o componente "Webhook" em qualquer etapa do quiz para disparar o webhook naquele ponto.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleSaveWebhook}
                disabled={isSaving}
                className="flex-1 gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={handleTestWebhook}
                disabled={!webhookUrl || isTesting}
                className="gap-2"
              >
                {isTesting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : testResult === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : testResult === 'error' ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Webhook className="w-4 h-4" />
                )}
                Testar
              </Button>
            </div>

            <a
              href="https://n8n.io/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Documentação N8N
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
