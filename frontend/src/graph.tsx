import React from "react";
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import { Grammar } from "./App";

export interface GrammarGraphProps {
  grammar: Grammar | null;
}

export const GrammarGraph: React.FC<GrammarGraphProps> = ({ grammar }) => {
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

  const horizontalSpacing = 120; // расстояние между вершинами
  const yPosition = 250; // все вершины будут на одной горизонтали
  
  const nodes: Node[] = grammar.Vn.map((state, index) => ({
    id: state,
    data: { label: state },
    position: { x: index * horizontalSpacing, y: yPosition },
    style: {
      borderRadius: "9999px",
      border: "2px solid #333",
      backgroundColor: state === grammar.S ? "#c0fdfb" : "white",
      width: 60,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
    },
    type: "default",
  }));
  

  const edges: Edge[] = grammar.P.map((rule, index) => {
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

  return (
    <div className="border p-6 rounded shadow bg-white">
      <h2 className="text-2xl font-semibold mb-4">Граф грамматики</h2>
      <div className="w-full" style={{ height: "600px" }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};