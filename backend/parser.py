from typing import List

def to_postfix(regex: str) -> List[str]:
    precedence = {'*': 3, '+': 3, '.': 2, '|': 1}
    output = []
    stack = []
    
    def add_concat_ops(expr: str) -> str:
        result = []
        for i in range(len(expr)):
            result.append(expr[i])
            if i < len(expr) - 1:
                if (expr[i].isalnum() or expr[i] in ')*+') and (expr[i+1].isalnum() or expr[i+1] == '('):
                    result.append('.')
        return ''.join(result)

    regex = add_concat_ops(regex)

    for char in regex:
        if char.isalnum():
            output.append(char)
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            stack.pop()
        else:  
            while stack and stack[-1] != '(' and precedence.get(stack[-1], 0) >= precedence[char]:
                output.append(stack.pop())
            stack.append(char)

    while stack:
        output.append(stack.pop())

    return output