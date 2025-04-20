from flask import Flask, request, jsonify
from parser import to_postfix
from nfa_builder import ThompsonNFA
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/build_nfa", methods=["POST"])
def build_nfa():
    data = request.get_json()
    regex = data.get("regex", "")

    postfix = to_postfix(regex)
    builder = ThompsonNFA()
    steps = builder.build(postfix)

    return jsonify({"steps": steps})

if __name__ == "__main__":
    app.run(debug=True)