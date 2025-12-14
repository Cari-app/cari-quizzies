import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className = 'h-8' }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 200 40" 
      fill="currentColor"
      className={cn("w-auto", className)}
      aria-label="Quizzies"
    >
      {/* Flower icon */}
      <g transform="translate(0, 2)">
        {/* Center circle */}
        <circle cx="18" cy="18" r="5" />
        {/* Petals */}
        <circle cx="18" cy="6" r="6" />
        <circle cx="18" cy="30" r="6" />
        <circle cx="6" cy="12" r="6" />
        <circle cx="30" cy="12" r="6" />
        <circle cx="6" cy="24" r="6" />
        <circle cx="30" cy="24" r="6" />
      </g>
      
      {/* Text "quizzies" */}
      <text 
        x="44" 
        y="32" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="32" 
        fontWeight="700"
        letterSpacing="-1"
      >
        quizzies
      </text>
      
      {/* Dot on the i */}
      <circle cx="153" cy="8" r="3.5" />
    </svg>
  );
}

// Separate icon component for sidebar collapsed state
export function LogoIcon({ className = 'h-8' }: LogoProps) {
  return (
    <svg 
      viewBox="0 0 36 36" 
      fill="currentColor"
      className={cn("w-auto", className)}
      aria-label="Quizzies"
    >
      {/* Flower icon */}
      {/* Center circle */}
      <circle cx="18" cy="18" r="5" />
      {/* Petals */}
      <circle cx="18" cy="6" r="6" />
      <circle cx="18" cy="30" r="6" />
      <circle cx="6" cy="12" r="6" />
      <circle cx="30" cy="12" r="6" />
      <circle cx="6" cy="24" r="6" />
      <circle cx="30" cy="24" r="6" />
    </svg>
  );
}
