import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { Memory, MemoryCategory } from '../db';
import { ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';

interface GraphAppProps {
  memories: Memory[];
  onSelectMemory: (memory: Memory) => void;
}

interface Node {
  id: string;
  isTag?: boolean;
  rawMemory?: Memory;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glow: string;
}

interface Edge {
  source: string;
  target: string;
}

const CATEGORY_COLORS: Record<MemoryCategory, { fill: string; glow: string }> = {
  thought: { fill: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  idea: { fill: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  experience: { fill: '#34d399', glow: 'rgba(52, 211, 153, 0.4)' },
  learning: { fill: '#a78bfa', glow: 'rgba(167, 139, 250, 0.4)' },
  quote: { fill: '#f472b6', glow: 'rgba(244, 114, 182, 0.4)' },
  person: { fill: '#f87171', glow: 'rgba(248, 113, 113, 0.4)' },
};

export const GraphApp: React.FC<GraphAppProps> = ({ memories, onSelectMemory }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const draggedNodeRef = useRef<Node | null>(null);

  // Build nodes and edges
  const { nodes, edges } = useMemo(() => {
    const filteredMemories = selectedCategory === 'all'
      ? memories
      : memories.filter((m) => m.category === selectedCategory);

    const nodeList: Node[] = [];
    const edgeList: Edge[] = [];
    const tagMap = new Set<string>();

    // Center offset
    const width = 800;
    const height = 600;

    filteredMemories.forEach((m, idx) => {
      const angle = (idx / Math.max(1, filteredMemories.length)) * Math.PI * 2;
      const dist = 140 + (idx % 3) * 60;
      const styling = CATEGORY_COLORS[m.category] || CATEGORY_COLORS.thought;

      nodeList.push({
        id: `mem-${m.id}`,
        rawMemory: m,
        label: m.title,
        x: width / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
        y: height / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: 12 + (m.importance || 3) * 3,
        color: styling.fill,
        glow: styling.glow,
      });

      // Direct memory connections
      if (m.connectedMemoryIds) {
        m.connectedMemoryIds.forEach((connId) => {
          if (filteredMemories.some((fm) => fm.id === connId)) {
            edgeList.push({
              source: `mem-${m.id}`,
              target: `mem-${connId}`,
            });
          }
        });
      }

      // Collect tags
      m.tags.forEach((t) => tagMap.add(t));
    });

    // Add Tag hubs
    Array.from(tagMap).forEach((tag, tIdx) => {
      const angle = (tIdx / Math.max(1, tagMap.size)) * Math.PI * 2;
      const dist = 280;

      nodeList.push({
        id: `tag-${tag}`,
        isTag: true,
        label: `#${tag}`,
        x: width / 2 + Math.cos(angle) * dist,
        y: height / 2 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        radius: 10,
        color: '#6366f1',
        glow: 'rgba(99, 102, 241, 0.3)',
      });

      // Connect memories to their tag hub
      filteredMemories.forEach((m) => {
        if (m.tags.includes(tag)) {
          edgeList.push({
            source: `mem-${m.id}`,
            target: `tag-${tag}`,
          });
        }
      });
    });

    return { nodes: nodeList, edges: edgeList };
  }, [memories, selectedCategory]);

  const nodesRef = useRef<Node[]>(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Force simulation loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const simulate = () => {
      const currentNodes = nodesRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Repulsion between nodes
      for (let i = 0; i < currentNodes.length; i++) {
        for (let j = i + 1; j < currentNodes.length; j++) {
          const a = currentNodes[i];
          const b = currentNodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) / 180 * 0.5;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (draggedNodeRef.current !== a) {
              a.vx -= fx;
              a.vy -= fy;
            }
            if (draggedNodeRef.current !== b) {
              b.vx += fx;
              b.vy += fy;
            }
          }
        }
      }

      // 2. Attraction along edges
      edges.forEach((edge) => {
        const source = currentNodes.find((n) => n.id === edge.source);
        const target = currentNodes.find((n) => n.id === edge.target);
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 100) * 0.005;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (draggedNodeRef.current !== source) {
            source.vx += fx;
            source.vy += fy;
          }
          if (draggedNodeRef.current !== target) {
            target.vx -= fx;
            target.vy -= fy;
          }
        }
      });

      // 3. Center gravity & friction
      currentNodes.forEach((node) => {
        if (draggedNodeRef.current === node) return;
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        // Friction
        node.vx *= 0.88;
        node.vy *= 0.88;

        node.x += node.vx;
        node.y += node.vy;
      });

      // Render
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(centerX + offset.x, centerY + offset.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -centerY);

      // Draw Edges
      edges.forEach((edge) => {
        const source = currentNodes.find((n) => n.id === edge.source);
        const target = currentNodes.find((n) => n.id === edge.target);
        if (source && target) {
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw Nodes
      currentNodes.forEach((node) => {
        const isHovered = hoveredNode?.id === node.id;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isHovered ? 8 : 4), 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? node.color : node.glow;
        ctx.fill();

        // Core Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = node.isTag ? '10px JetBrains Mono, monospace' : '11px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        const displayLabel = node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label;
        ctx.fillText(displayLabel, node.x, node.y + node.radius + 14);
      });

      ctx.restore();
      animationFrameId = requestAnimationFrame(simulate);
    };

    simulate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [edges, offset, zoom, hoveredNode]);

  // Resize canvas to parent
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && canvasRef.current.parentElement) {
        canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
        canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const screenToWorld = (screenX: number, screenY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const mouseX = screenX - rect.left;
    const mouseY = screenY - rect.top;

    const worldX = (mouseX - (cx + offset.x)) / zoom + cx;
    const worldY = (mouseY - (cy + offset.y)) / zoom + cy;
    return { x: worldX, y: worldY };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist <= n.radius + 5;
    });

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
    } else {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      return;
    }

    if (isPanning) {
      setOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const hover = nodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist <= n.radius + 5;
    });

    setHoveredNode(hover || null);
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const clickedNode = nodesRef.current.find((n) => {
      const dist = Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2);
      return dist <= n.radius + 5;
    });

    if (clickedNode && clickedNode.rawMemory) {
      onSelectMemory(clickedNode.rawMemory);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950/70 select-none">
      {/* Top Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2">
        <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center space-x-1.5 text-xs text-slate-300">
          <Filter size={13} className="text-indigo-400" />
          {['all', 'thought', 'idea', 'experience', 'learning', 'quote'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-lg transition-all capitalize ${
                selectedCategory === cat
                  ? 'bg-indigo-600/40 text-white font-medium border border-indigo-400/40'
                  : 'hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'all' ? 'Toate' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom / Reset Controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-1.5 glass-panel p-1 rounded-xl text-slate-300">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white"
          title="Resetează Vederea"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Info Tooltip when hovering over a memory */}
      {hoveredNode && hoveredNode.rawMemory && (
        <div className="absolute bottom-6 left-6 z-20 glass-window p-3.5 rounded-xl max-w-sm border border-white/20 animate-fade-in pointer-events-none shadow-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="uppercase font-semibold tracking-wider text-indigo-400">
              {hoveredNode.rawMemory.category}
            </span>
            <span>{new Date(hoveredNode.rawMemory.date).toLocaleDateString('ro-RO')}</span>
          </div>
          <div className="text-sm font-bold text-white mb-1.5">{hoveredNode.rawMemory.title}</div>
          <p className="text-xs text-slate-300 line-clamp-2 mb-2">{hoveredNode.rawMemory.content}</p>
          <div className="flex flex-wrap gap-1">
            {hoveredNode.rawMemory.tags.map((t) => (
              <span key={t} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">
                #{t}
              </span>
            ))}
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span>🖱️ Click pentru a deschide amintirea</span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 right-4 z-10 text-[11px] text-slate-500 font-mono pointer-events-none">
        {nodes.length} noduri sinaptice • Trage de fundal pentru panoramare
      </div>
    </div>
  );
};
