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

    if not regex:
        return jsonify({"error": "Регулярное выражение не указано"}), 400

    try:
        postfix = to_postfix(regex)
        builder = ThompsonNFA()
        result = builder.build(postfix)

        return jsonify({
            "steps": result["steps"],
            "grammar": result["grammar"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)