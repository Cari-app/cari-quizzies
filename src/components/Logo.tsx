import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8' }: LogoProps) {
  const { theme } = useTheme();
  
  return (
    <img 
      src={theme === 'dark' ? logoDark : logoLight} 
      alt="Cari" 
      className={className}
    />
  );
}
