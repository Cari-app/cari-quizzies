import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';
import { StageNode } from './StageNode';

interface Stage {
  id: string;
  name: string;
  components: any[];
  position?: { x: number; y: number };
  connections?: { targetId: string; sourceHandle?: string }[];
}

interface FlowCanvasProps {
  stages: Stage[];
  selectedStageId: string | null;
  onSelectStage: (stageId: string) => void;
  onStagesChange: (stages: Stage[]) => void;
}

const nodeTypes = {
  stage: StageNode,
};

export function FlowCanvas({ 
  stages, 
  selectedStageId, 
  onSelectStage,
  onStagesChange 
}: FlowCanvasProps) {
  
  // Convert stages to nodes
  const initialNodes: Node[] = useMemo(() => {
    return stages.map((stage, index) => ({
      id: stage.id,
      type: 'stage',
      position: stage.position || { x: 100 + (index % 4) * 220, y: 100 + Math.floor(index / 4) * 180 },
      data: { 
        label: stage.name, 
        components: stage.components,
        index: index + 1,
        isSelected: stage.id === selectedStageId,
      },
      selected: stage.id === selectedStageId,
    }));
  }, [stages, selectedStageId]);

  // Convert connections to edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    stages.forEach((stage) => {
      if (stage.connections) {
        stage.connections.forEach((conn, connIndex) => {
          edges.push({
            id: `${stage.id}-${conn.targetId}-${connIndex}`,
            source: stage.id,
            target: conn.targetId,
            sourceHandle: conn.sourceHandle || 'default',
            type: 'smoothstep',
            animated: false,
            style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5, strokeDasharray: '5,5' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(var(--muted-foreground))',
              width: 15,
              height: 15,
            },
          });
        });
      }
    });
    return edges;
  }, [stages]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `${params.source}-${params.target}-${Date.now()}`,
        type: 'smoothstep',
        animated: false,
        style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1.5, strokeDasharray: '5,5' },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--muted-foreground))',
          width: 15,
          height: 15,
        },
      } as Edge;
      
      setEdges((eds) => addEdge(newEdge, eds));
      
      // Update stages with new connection
      const updatedStages = stages.map(stage => {
        if (stage.id === params.source) {
          const connections = stage.connections || [];
          return {
            ...stage,
            connections: [...connections, { targetId: params.target!, sourceHandle: params.sourceHandle || 'default' }],
          };
        }
        return stage;
      });
      onStagesChange(updatedStages);
    },
    [stages, onStagesChange, setEdges]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      onSelectStage(node.id);
    },
    [onSelectStage]
  );

  // Handle node drag stop - save positions
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const updatedStages = stages.map(stage => {
        if (stage.id === node.id) {
          return { ...stage, position: node.position };
        }
        return stage;
      });
      onStagesChange(updatedStages);
    },
    [stages, onStagesChange]
  );

  // Handle edge delete
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      const updatedStages = stages.map(stage => {
        const stageConnections = stage.connections || [];
        const filteredConnections = stageConnections.filter(conn => {
          return !deletedEdges.some(edge => 
            edge.source === stage.id && edge.target === conn.targetId
          );
        });
        return { ...stage, connections: filteredConnections };
      });
      onStagesChange(updatedStages);
    },
    [stages, onStagesChange]
  );

  // Auto-organize nodes
  const handleAutoOrganize = useCallback(() => {
    const updatedNodes = nodes.map((node, index) => ({
      ...node,
      position: { 
        x: 100 + (index % 4) * 220, 
        y: 100 + Math.floor(index / 4) * 180 
      },
    }));
    setNodes(updatedNodes);
    
    const updatedStages = stages.map((stage, index) => ({
      ...stage,
      position: { 
        x: 100 + (index % 4) * 220, 
        y: 100 + Math.floor(index / 4) * 180 
      },
    }));
    onStagesChange(updatedStages);
  }, [nodes, stages, setNodes, onStagesChange]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-muted/30"
        proOptions={{ hideAttribution: true }}
      >
        <Panel position="top-left">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleAutoOrganize}
            className="bg-background shadow-sm"
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Auto-organizar
          </Button>
        </Panel>
        <Controls 
          className="!bg-background !border-border !shadow-sm [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="hsl(var(--muted-foreground) / 0.2)" 
        />
      </ReactFlow>
    </div>
  );
}
