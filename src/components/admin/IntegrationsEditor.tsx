import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Webhook, Loader2, CheckCircle2, XCircle, ExternalLink, Save, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  triggerOnFirstResponse?: boolean;
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

      {/* N8N Integration */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Webhook className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <CardTitle className="text-lg">N8N Webhook</CardTitle>
                <CardDescription>
                  Dispare automações quando o quiz for respondido
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={webhookEnabled}
              onCheckedChange={onWebhookEnabledChange}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_url" className="text-sm font-medium">
              URL do Webhook
            </Label>
            <Input
              id="webhook_url"
              value={webhookUrl}
              onChange={(e) => onWebhookUrlChange(e.target.value)}
              placeholder="https://seu-n8n.com/webhook/..."
              className="h-10"
              disabled={!webhookEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Cole a URL do webhook do seu workflow N8N
            </p>
          </div>

          {/* Field Selection */}
          <div className="space-y-3 pt-4 border-t">
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
                  disabled={!webhookEnabled}
                />
                <Label htmlFor="send-name" className="text-sm font-normal">Nome</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-email"
                  checked={webhookSettings.sendEmail ?? true}
                  onCheckedChange={(checked) => updateSettings('sendEmail', checked)}
                  disabled={!webhookEnabled}
                />
                <Label htmlFor="send-email" className="text-sm font-normal">Email</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-phone"
                  checked={webhookSettings.sendPhone ?? true}
                  onCheckedChange={(checked) => updateSettings('sendPhone', checked)}
                  disabled={!webhookEnabled}
                />
                <Label htmlFor="send-phone" className="text-sm font-normal">Telefone</Label>
              </div>
            </div>
          </div>

          {/* Custom Field IDs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="custom-fields">IDs de Campos Personalizados</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Digite os IDs dos componentes cujas respostas você quer incluir (separados por vírgula)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="custom-fields"
              placeholder="altura, peso, objetivo, plano"
              value={webhookSettings.customFieldIds || ''}
              onChange={(e) => updateSettings('customFieldIds', e.target.value)}
              disabled={!webhookEnabled}
            />
            <p className="text-xs text-muted-foreground">
              Separe os IDs por vírgula. Use os mesmos IDs definidos nos componentes do quiz.
            </p>
          </div>

          {/* Trigger Options */}
          <div className="space-y-3 pt-4 border-t">
            <Label className="text-sm font-medium">Quando disparar</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="trigger-first" className="text-sm font-normal">Primeira resposta</Label>
                <p className="text-xs text-muted-foreground">
                  Dispara assim que o usuário responder a primeira etapa
                </p>
              </div>
              <Switch
                id="trigger-first"
                checked={webhookSettings.triggerOnFirstResponse ?? false}
                onCheckedChange={(checked) => updateSettings('triggerOnFirstResponse', checked)}
                disabled={!webhookEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-normal text-muted-foreground">Quiz completado</Label>
                <p className="text-xs text-muted-foreground">
                  Sempre dispara quando o quiz é finalizado
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              size="sm"
              onClick={handleSaveWebhook}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Salvar Webhook
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestWebhook}
              disabled={!webhookEnabled || !webhookUrl || isTesting}
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
              Testar Webhook
            </Button>
            <a
              href="https://n8n.io/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
            >
              <ExternalLink className="w-3 h-3" />
              Documentação N8N
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Future integrations placeholder */}
      <Card className="border-dashed border-border opacity-50">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <Webhook className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg text-muted-foreground">Mais integrações em breve</CardTitle>
              <CardDescription>
                Zapier, Make, e mais...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
