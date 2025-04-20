# backend/nfa_builder.py
from typing import Dict, List
from dataclasses import dataclass
from itertools import count

@dataclass
class State:
    id: int

@dataclass
class Transition:
    from_state: int
    to_state: int
    symbol: str

@dataclass
class NFAFragment:
    start: int
    end: int
    transitions: List[Transition]

class ThompsonNFA:
    def __init__(self):
        self._id_gen = count()
        self.steps = []

    def _new_state(self) -> int:
        return next(self._id_gen)

    def build(self, postfix: List[str]) -> List[Dict]:
        print("===> build() вызван, postfix =", postfix)
        stack = []

        for token in postfix:
            if token.isalnum():
                start = self._new_state()
                end = self._new_state()
                trans = [Transition(start, end, token)]
                stack.append(NFAFragment(start, end, trans))
                self._record_step("Создан автомат для символа '" + token + "'", trans, start, end)

            elif token == '.':
                b = stack.pop()
                a = stack.pop()
                trans = a.transitions + b.transitions + [Transition(a.end, b.start, 'ε')]
                stack.append(NFAFragment(a.start, b.end, trans))
                self._record_step("Применена конкатенация", trans, a.start, b.end)

            elif token == '|':
                a = stack.pop()
                b = stack.pop()
                start = self._new_state()
                end = self._new_state()
                trans = a.transitions + b.transitions + [
                    Transition(start, a.start, 'ε'),
                    Transition(start, b.start, 'ε'),
                    Transition(a.end, end, 'ε'),
                    Transition(b.end, end, 'ε')
                ]
                stack.append(NFAFragment(start, end, trans))
                self._record_step("Применена альтернатива", trans, start, end)

            elif token == '*':
                frag = stack.pop()
                start = self._new_state()
                end = self._new_state()
                trans = frag.transitions + [
                    Transition(start, frag.start, 'ε'),
                    Transition(frag.end, frag.start, 'ε'),
                    Transition(start, end, 'ε'),
                    Transition(frag.end, end, 'ε')
                ]
                stack.append(NFAFragment(start, end, trans))
                self._record_step("Применена звезда Клини", trans, start, end)

            elif token == '+':
                frag = stack.pop()
                start = self._new_state()
                end = self._new_state()
                trans = frag.transitions + [
                    Transition(start, frag.start, 'ε'),
                    Transition(frag.end, frag.start, 'ε'),
                    Transition(frag.end, end, 'ε')
                ]
                stack.append(NFAFragment(start, end, trans))
                self._record_step("Применена операция +", trans, start, end)

        return self.steps

    def _record_step(self, desc: str, transitions: List[Transition], start: int, end: int):
        step = {
            "description": desc,
            "nodes": list(set([t.from_state for t in transitions] + [t.to_state for t in transitions])),
            "edges": [
                {"from": t.from_state, "to": t.to_state, "symbol": t.symbol} for t in transitions
            ],
            "start_state": start,
            "accept_state": end
        }

        # Логирование шага в консоль
        print(f"\nШаг: {desc}")
        print(f"Начальное состояние: {start}")
        print(f"Конечное состояние: {end}")
        print("Переходы:")
        for t in transitions:
            print(f"  {t.from_state} --[{t.symbol}]--> {t.to_state}")

        self.steps.append(step)
