import logoLight from '@/assets/logo-light.png';
import logoDark from '@/assets/logo-dark.png';
import { useTheme } from '@/hooks/useTheme';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8' }: LogoProps) {
  const { theme } = useTheme();
  const logoSrc = theme === 'dark' ? logoDark : logoLight;
  
  return (
    <img 
      key={theme}
      src={logoSrc} 
      alt="Quizzies" 
      className={className}
    />
  );
}
