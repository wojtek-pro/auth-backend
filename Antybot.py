from flask import Flask, request, jsonify
from flask_cors import CORS
import random, string, time

app = Flask(__name__)
CORS(app)

challenges = {}

def generate_code():
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(chars) for _ in range(6))

@app.route("/challenge", methods=["GET"])
def challenge():
    cid = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(10))
    code = generate_code()

    challenges[cid] = {
        "code": code,
        "expires": time.time() + 60
    }

    print("CODE:", cid, code)

    return jsonify({
        "id": cid,
        "expiresIn": 60
    })

@app.route("/verify", methods=["POST"])
def verify():
    data = request.json
    cid = data.get("id")
    user_input = (data.get("input") or "").upper()

    if cid not in challenges:
        return jsonify({"success": False})

    c = challenges[cid]

    if time.time() > c["expires"]:
        del challenges[cid]
        return jsonify({"success": False, "error": "expired"})

    if user_input == c["code"]:
        del challenges[cid]
        return jsonify({"success": True})

    return jsonify({"success": False})
