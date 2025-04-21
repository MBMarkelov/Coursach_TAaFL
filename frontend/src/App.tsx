import { useState } from "react";
import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";
import { GrammarGraph, GrammarGraphProps } from "./graph";

export interface Grammar {
  Vn: string[];
  Vt: string[];
  S: string;
  P: string[]; // Массив строк, как в ответе от сервера
}

export interface Step {
  description: string;
  start_state: number;
  accept_state: number;
  nodes: number[]; 
  edges: any[];
}

export default function App() {
  const [regex, setRegex] = useState("");
  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [elements, setElements] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: []
  });

  const handleSubmit = async () => {
    const response = await fetch("http://localhost:5000/build_nfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regex })
    });

    const data = await response.json();
    console.log("Ответ от сервера:", data);

    if (!data.grammar || !data.steps) {
      console.error("Некорректный ответ от сервера:", data);
      return;
    }

    setGrammar(data.grammar);
    setSteps(data.steps);

    // Строим граф из data.grammar.P
    const nodesSet = new Set<string>();
    const edges: Edge[] = [];

    data.grammar.P.forEach((rule: string, index: number) => {
      const [left, right] = rule.split("->").map((s) => s.trim());
      const symbol = right.length > 0 && isNaN(parseInt(right[0])) ? right[0] : "ε";
      const to = symbol === "ε" ? right : right.slice(1);
      nodesSet.add(left);
      nodesSet.add(to);

      edges.push({
        id: `e-${left}-${to}-${index}`,
        source: left,
        target: to,
        label: symbol,
        type: "default",
        animated: true
      });
    });

    const nodes: Node[] = Array.from(nodesSet).map((id, idx) => ({
      id,
      data: { label: id },
      position: { x: (idx % 5) * 100, y: Math.floor(idx / 5) * 100 }
    }));

    setElements({ nodes, edges });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid gap-6">
      {/* Ввод выражения */}
      <div className="border p-6 rounded shadow bg-white">
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
            placeholder="Введите регулярное выражение"
            className="border px-4 py-2 text-lg w-full rounded-lg shadow-sm"
          />
          <button
            className="p-3 text-lg bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg"
            onClick={handleSubmit}
          >
            Построить НКА
          </button>
        </div>
      </div>

      {/* Основной контент — 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Блок с грамматикой и шагами */}
        {(grammar || steps.length > 0) && (
          <div className="border p-6 rounded shadow bg-white overflow-auto max-h-[600px]">
            {grammar && (
              <>
                <h2 className="text-2xl font-semibold mb-4">Эквивалентная грамматика</h2>
                <pre className="mb-2">Vn = {JSON.stringify(grammar.Vn)}</pre>
                <pre className="mb-2">Vt = {JSON.stringify(grammar.Vt)}</pre>
                <pre className="mb-2">S = {grammar.S}</pre>
                <h3 className="font-medium mt-4 mb-1">P:</h3>
                <ul className="list-disc pl-5 mb-4">
                  {grammar.P.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </>
            )}

            {/* Шаги построения */}
            {steps.length > 0 && (
              <>
                <h2 className="text-xl font-semibold mb-2 mt-4">Пошаговое построение</h2>
                <ol className="list-decimal pl-5">
                  {steps.map((step, idx) => (
                    <li key={idx} className="mb-2">
                      <div className="font-medium">{step.description}</div>
                      <div className="text-sm text-gray-600">
                        Старт: {step.start_state}, Конец: {step.accept_state}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
        {/* Граф */}
        {elements.nodes.length > 0 && (
          <GrammarGraph grammar={grammar}steps={steps} />
        )}
      </div>
    </div>
  );
}
