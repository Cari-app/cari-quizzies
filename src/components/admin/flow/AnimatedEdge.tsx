import { memo, useMemo } from 'react';
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';

interface AnimatedEdgeProps extends EdgeProps {
  data?: {
    activityLevel: number; // 0-3: none, low, medium, high
  };
}

export const AnimatedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: AnimatedEdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const activityLevel = data?.activityLevel || 0;

  // Generate animated dots based on activity level
  const dots = useMemo(() => {
    if (activityLevel === 0) return [];
    
    const dotCount = Math.min(activityLevel, 3);
    return Array.from({ length: dotCount }, (_, i) => ({
      id: `${id}-dot-${i}`,
      delay: i * 0.8, // Stagger the dots
      duration: 2 + Math.random() * 0.5, // Slight variation in speed
    }));
  }, [activityLevel, id]);

  return (
    <>
      {/* Base edge path */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 1.5,
          stroke: 'hsl(var(--muted-foreground))',
          strokeDasharray: '5,5',
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Animated dots */}
      {dots.map((dot) => (
        <circle
          key={dot.id}
          r={4}
          fill="hsl(var(--primary))"
          className="drop-shadow-sm"
        >
          <animateMotion
            dur={`${dot.duration}s`}
            repeatCount="indefinite"
            begin={`${dot.delay}s`}
          >
            <mpath href={`#${id}`} />
          </animateMotion>
          {/* Pulse animation */}
          <animate
            attributeName="r"
            values="3;5;3"
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="1;0.6;1"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </>
  );
});

AnimatedEdge.displayName = 'AnimatedEdge';
