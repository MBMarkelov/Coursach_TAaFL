import { useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

// Тип для данных грамматики
interface Grammar {
  Vn: string[];
  Vt: string[];
  S: string;
  P: { [key: string]: string[] };
}

export default function App() {
  const [regex, setRegex] = useState("");
  const [grammar, setGrammar] = useState<Grammar | null>(null); // Указан тип Grammar
  const [elements, setElements] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: []
  }); // Указан тип для элементов React Flow

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5000/build_nfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regex })
    });

    const data = await response.json();
    setGrammar(data.grammar);
    setElements(data.graph); // предполагаем, что сервер возвращает nodes + edges
    console.log("Пошаговое построение:", data.steps);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto grid gap-4">
      <div className="border p-4 rounded">
        <div className="p-4">
          <input
            type="text"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            placeholder="Введите регулярное выражение"
            className="border px-2 py-1 w-full rounded"
          />
          <button
            className="mt-2 p-2 bg-blue-500 text-white rounded"
            onClick={handleSubmit}
          >
            Построить НКА
          </button>
        </div>
      </div>

      {grammar && (
        <div className="border p-4 rounded">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">Псевдограмматика</h2>
            <pre>Vn = {JSON.stringify(grammar.Vn)}</pre>
            <pre>Vt = {JSON.stringify(grammar.Vt)}</pre>
            <pre>S = {grammar.S}</pre>
            <h3 className="font-medium mt-2">P:</h3>
            <ul className="list-disc pl-5">
              {Object.entries(grammar.P).map(([state, rules]) => (
                <li key={state}><strong>{state}</strong>: {rules.join(", ")}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {elements.nodes.length > 0 && (
        <div className="border p-4 rounded">
          <div style={{ height: 500 }}>
            <ReactFlow nodes={elements.nodes} edges={elements.edges} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      )}
    </div>
  );
}
