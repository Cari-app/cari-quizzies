import { useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, Settings, Bell, Sparkles, MessageSquare, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const notifications = [
  {
    id: 1,
    type: 'update',
    title: 'Nova atualização disponível',
    description: 'Adicionamos novos templates de quiz e melhorias de performance.',
    time: 'Agora',
    unread: true,
  },
  {
    id: 2,
    type: 'response',
    title: '3 novas respostas',
    description: 'Seu quiz "Descubra seu perfil" recebeu novas respostas.',
    time: '5 min atrás',
    unread: true,
  },
  {
    id: 3,
    type: 'news',
    title: 'IA aprimorada',
    description: 'Nossa IA agora pode gerar perguntas ainda mais personalizadas.',
    time: '1h atrás',
    unread: false,
  },
];

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // Ignore errors - we want to logout anyway
    }
    // Force a full page reload to clear all state
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <header className="h-16 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Page title */}
        <div>
          {title && (
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-4 w-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Notificações
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem 
                  key={notification.id} 
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    {notification.type === 'update' && <Sparkles className="h-4 w-4 text-primary" />}
                    {notification.type === 'response' && <MessageSquare className="h-4 w-4 text-primary" />}
                    {notification.type === 'news' && <Megaphone className="h-4 w-4 text-primary" />}
                    <span className="font-medium text-sm flex-1">{notification.title}</span>
                    {notification.unread && (
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">{notification.description}</p>
                  <span className="text-xs text-muted-foreground/70 pl-6">{notification.time}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-xs text-muted-foreground">
                Ver todas as notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-9 w-9"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 ml-2"
              >
                <Avatar className="w-7 h-7">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-foreground text-background font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.full_name || 'Usuário'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-none">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
