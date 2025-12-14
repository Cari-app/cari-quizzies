import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Logo, LogoIcon } from '@/components/Logo';
import { useTheme } from '@/hooks/useTheme';
import cariLogoLight from '@/assets/cari-logo-light.svg';
import cariLogoDark from '@/assets/cari-logo-dark.svg';
import cariIconLight from '@/assets/cari-icon-light.svg';
import cariIconDark from '@/assets/cari-icon-dark.svg';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const { theme } = useTheme();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
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
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
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
            <img 
              src={theme === 'dark' ? cariIconDark : cariIconLight} 
              alt="Cari" 
              className="h-8 w-8"
            />
          ) : (
            <img 
              src={theme === 'dark' ? cariLogoDark : cariLogoLight} 
              alt="Cari" 
              className="h-6"
            />
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
      <div className="px-3 py-4 space-y-1">
        {bottomNavItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </div>
    </aside>
  );
}
