import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { Grammar, Step } from "./App";

const nodeWidth = 100;
const nodeHeight = 60;

export interface GrammarGraphProps {
  grammar: Grammar | null;
  steps: Step[];
}

export const GrammarGraph: React.FC<GrammarGraphProps> = ({ grammar, steps }) => {
  const layoutedNodes = useMemo(() => {
    if (!grammar) return [];

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "LR" }); // можно менять на TB (top-bottom) или LR (left-right)

    grammar.Vn.forEach((state) => {
      g.setNode(state, { width: nodeWidth, height: nodeHeight });
    });

    grammar.P.forEach((rule) => {
      const [from, toFull] = rule.split("->").map((s) => s.trim());
      const symbolMatch = toFull.match(/^([a-zε]?)(q\d+)$/);
      const to = symbolMatch?.[2] || toFull;
      g.setEdge(from, to);
    });

    dagre.layout(g);

    return grammar.Vn.map((state) => {
      const nodeWithPos = g.node(state);
      const isStart = state === grammar.S;
      const isAccept = state === `q${steps.at(-1)?.accept_state}`;

      return {
        id: state,
        data: { label: state },
        position: { x: nodeWithPos.x, y: nodeWithPos.y },
        style: {
          borderRadius: "9999px",
          border: "2px solid #333",
          backgroundColor: isStart
            ? "#c0fdfb"
            : isAccept
            ? "#ffe5e5"
            : "white",
          boxShadow: isAccept ? "0 0 0 4px #f87171 inset" : undefined,
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
        },
        draggable: true,
        type: "default",
      } satisfies Node;
    });
  }, [grammar, steps]);

  const layoutedEdges: Edge[] = useMemo(() => {
    if (!grammar) return [];

    return grammar.P.map((rule, index) => {
      const [from, toFull] = rule.split("->").map((s) => s.trim());
      const symbolMatch = toFull.match(/^([a-zε]?)(q\d+)$/);

      let label = "ε";
      let to = toFull;

      if (symbolMatch) {
        label = symbolMatch[1] || "ε";
        to = symbolMatch[2];
      }

      return {
        id: `e${index}`,
        source: from,
        target: to,
        label,
        type: "default",
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
        style: { stroke: "#555" },
        labelStyle: { fill: "#000", fontWeight: 600, fontSize: 14 },
        animated: true,
      };
    });
  }, [grammar]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  if (!grammar) {
    return (
      <div className="border p-6 rounded shadow bg-white">
        <h2 className="text-2xl font-semibold mb-4">Граф грамматики</h2>
        <div className="w-full flex items-center justify-center" style={{ height: "600px" }}>
          <p className="text-gray-500">Грамматика не предоставлена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border p-6 rounded shadow bg-white">
      <h2 className="text-2xl font-semibold mb-4">Граф грамматики</h2>
      <div className="w-full" style={{ height: "600px" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          nodesDraggable={true}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};
