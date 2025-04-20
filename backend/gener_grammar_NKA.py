from nfa_builder import NFABuilder

def generate_grammar_from_nfa(nfa):
    """
    Генерирует псевдограмматику из НКА.
    Возвращает словарь с полями: Vt, Vn, P, S
    """
    Vn = set()  # Нетерминалы (состояния)
    Vt = set()  # Терминалы (символы алфавита)
    P = {}      # Правила вида A -> aB

    for state in nfa.states:
        Vn.add(state)
        P[state] = []

    for from_state, transitions in nfa.transitions.items():
        for symbol, to_states in transitions.items():
            for to_state in to_states:
                Vt.add(symbol)
                if symbol == '':
                    rule = f"{from_state} -> {to_state}"
                else:
                    rule = f"{from_state} -> {symbol}{to_state}"
                P[from_state].append(rule)

    grammar = {
        "Vn": sorted(Vn),
        "Vt": sorted(Vt - {''}),
        "P": P,
        "S": nfa.start_state
    }
    return grammar