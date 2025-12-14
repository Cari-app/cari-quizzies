import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Loader2, Save, Type, Users, UserPlus, Check, X, Mail, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function AdminSettings() {
  const { settings, isLoading, updateSettings, isUpdating } = useSiteSettings();
  const { 
    users, 
    pendingUsers, 
    isLoadingUsers, 
    inviteUser, 
    approveUser, 
    rejectUser,
    isInviting,
    isApproving 
  } = useUserManagement();
  
  const [formData, setFormData] = useState({
    site_name: 'Cari',
  });
  
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || 'Cari',
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteUser(inviteEmail.trim());
      setInviteEmail('');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-base text-muted-foreground mt-2">
          Configurações gerais do aplicativo
        </p>
      </div>

      {/* App Name */}
      <form onSubmit={handleSubmit}>
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              Nome do Aplicativo
            </CardTitle>
            <CardDescription className="text-base">Identidade do seu aplicativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="site_name" className="text-sm font-medium">Nome</Label>
                <Input
                  id="site_name"
                  value={formData.site_name}
                  onChange={(e) => setFormData({ site_name: e.target.value })}
                  placeholder="Nome do app"
                  className="h-11 rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={isUpdating} className="gap-2 h-11">
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Salvar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* User Management */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            Gestão de Usuários
          </CardTitle>
          <CardDescription className="text-base">
            Convide novos usuários ou aprove solicitações de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex gap-3">
            <div className="flex-1">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="h-11 rounded-lg"
              />
            </div>
            <Button type="submit" disabled={isInviting || !inviteEmail.trim()} className="gap-2 h-11">
              {isInviting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Convidar
            </Button>
          </form>

          {/* Pending Users */}
          {pendingUsers.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Aguardando Aprovação
                </h3>
                <div className="space-y-2">
                  {pendingUsers.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'Sem nome'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => rejectUser(user.id)}
                          className="h-8 px-3 text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => approveUser(user.id)}
                          disabled={isApproving}
                          className="h-8 px-3 gap-1"
                        >
                          <Check className="w-4 h-4" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Active Users */}
          {isLoadingUsers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length > 0 ? (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Usuários Ativos ({users.length})
                </h3>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {(user.full_name || user.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.full_name || 'Sem nome'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Editor'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum usuário cadastrado ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
