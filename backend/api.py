import os
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from app.auth.auth_utils import login_required, current_user
from app.controllers import auth_controller as ac
from app.controllers import ticket_controller as tc
from app.controllers import user_controller as uc

FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"

app = Flask(__name__, static_folder=str(FRONTEND_DIST), static_url_path="")
CORS(app)

# ============ AUTH ============

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json() or {}
        result = ac.register(**data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json() or {}
        result = ac.login(**data)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@login_required
def me():
    return jsonify(current_user())

# ============ USERS ============

@app.route('/api/users', methods=['GET'])
@login_required
def list_users():
    try:
        users = uc.get_all()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    try:
        user = uc.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users', methods=['POST'])
@login_required
def create_user():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        uc.create(**data)
        return jsonify({"message": "User created successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@login_required
def update_user(user_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        uc.update(user_id, **data)
        return jsonify({"message": "User updated successfully"})
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@login_required
def delete_user(user_id):
    try:
        uc.delete(user_id)
        return '', 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ============ TICKETS ============

@app.route('/api/tickets', methods=['GET'])
@login_required
def list_tickets():
    try:
        tickets = tc.get_all()
        return jsonify(tickets)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/<int:ticket_id>', methods=['GET'])
@login_required
def get_ticket(ticket_id):
    try:
        ticket = tc.get(ticket_id)
        if not ticket:
            return jsonify({"error": "Ticket not found"}), 404
        return jsonify(ticket)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets', methods=['POST'])
@login_required
def create_ticket():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        result = tc.create(**data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/<int:ticket_id>', methods=['PUT'])
@login_required
def update_ticket(ticket_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400
        result = tc.update(ticket_id, **data)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tickets/<int:ticket_id>', methods=['DELETE'])
@login_required
def delete_ticket(ticket_id):
    try:
        tc.delete(ticket_id)
        return '', 204
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path.startswith("api/"):
        return jsonify({"error": "Not found"}), 404

    if not FRONTEND_DIST.exists():
        return jsonify({"error": "Frontend build not found"}), 404

    requested_file = FRONTEND_DIST / path
    if path and requested_file.is_file():
        return send_from_directory(FRONTEND_DIST, path)

    return send_from_directory(FRONTEND_DIST, "index.html")


if __name__ == '__main__':
    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
        port=int(os.getenv("PORT", os.getenv("FLASK_PORT", "5001"))),
    )
