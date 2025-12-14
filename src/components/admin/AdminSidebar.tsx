import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo, LogoIcon } from '@/components/Logo';
import {
  LayoutDashboard,
  Badge,
  Settings,
  Users,
  BarChart3,
  Image,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  MessageSquare,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { 
    label: 'Dashboard', 
    path: '/admin', 
    icon: LayoutDashboard,
    exact: true 
  },
  { 
    label: 'Quizzies', 
    path: '/admin/quizzes', 
    icon: Badge
  },
  { 
    label: 'Leads', 
    path: '/admin/leads', 
    icon: Users 
  },
  { 
    label: 'Analytics', 
    path: '/admin/analytics', 
    icon: BarChart3 
  },
  { 
    label: 'Mídia', 
    path: '/admin/media', 
    icon: Image 
  },
];

const bottomNavItems = [
  { 
    label: 'Configurações', 
    path: '/admin/settings', 
    icon: Settings 
  },
  { 
    label: 'Ajuda', 
    path: '/admin/help', 
    icon: HelpCircle 
  },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      // Ignore errors - we want to logout anyway
    }
    window.location.href = '/login';
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const active = isActive(item.path, item.exact);
    const Icon = item.icon;

    const content = (
      <Link
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          active
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", collapsed && "mx-auto")} />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300 flex flex-col",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <Link to="/admin" className="flex items-center">
          {collapsed ? (
            <LogoIcon className="h-8 w-8" />
          ) : (
            <Logo className="h-6" />
          )}
        </Link>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 shrink-0",
            collapsed && "absolute -right-4 top-6 bg-background border border-border rounded-full shadow-sm"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Bottom navigation */}
      <div className="px-3 py-4 space-y-1 border-b border-border">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>

      {/* User section */}
      <div className={cn(
        "px-3 py-4 flex items-center",
        collapsed ? "justify-center" : "gap-2"
      )}>
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative shrink-0">
              <Bell className="h-4 w-4" />
              {notifications.some(n => n.unread) && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-80">
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
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="h-9 w-9 shrink-0"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-9 w-9 shrink-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        )}

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 shrink-0"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-foreground text-background font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-56">
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
    </aside>
  );
}
