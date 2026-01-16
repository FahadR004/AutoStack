from flask import request, jsonify
from MDB_config import app, db
from models import serialize_user, serialize_note
from bson import ObjectId

@app.route("/autostack", methods=["GET"]) 
def autostack():
    message = """ 
        Congrats! You have successfully set up your full-stack project!
        If you're reading this message, it means your frontend and backend are completely connected!
        You are ready to create your next big project!
"""
    return jsonify({"message": message, "backend": "Flask", "database": "MongoDB", "filepath": 'backend/main.py'}), 200

# Example User REST APIs
@app.route("/get-users", methods=["GET"])
def get_users():
    users = list(db.users.find())
    json_users = [serialize_user(u) for u in users]
    return jsonify({"users": json_users}), 200

@app.route("/create-user", methods=["POST"])
def create_user():
    username = request.json.get("username")
    email = request.json.get("email")
    if not username or not email:
        return jsonify({"message": "Missing fields"}), 400

    # optional uniqueness check
    if db.users.find_one({"$or": [{"username": username}, {"email": email}] } ): 
        return jsonify({"message": "User with same username or email already exists"}), 400

    res = db.users.insert_one({"username": username, "email": email})
    return jsonify({"message": "New User Created", "id": str(res.inserted_id)}), 201


@app.route("/update-users/<user_id>", methods=["PATCH"])
def update_user(user_id):
    try:
        _id = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user id"}), 400

    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400

    update = {}
    if "username" in data:
        update["username"] = data["username"]
    if "email" in data:
        update["email"] = data["email"]

    if not update:
        return jsonify({"message": "No valid fields to update"}), 400

    result = db.users.update_one({"_id": _id}, {"$set": update})
    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "User Updated"}), 200


@app.route("/delete-user/<user_id>", methods=["DELETE"])
def delete_user(user_id):
    try:
        _id = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user id"}), 400

    result = db.users.delete_one({"_id": _id})
    if result.deleted_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "User Deleted"}), 200


# Example Notes REST APIs
@app.route("/get-notes", methods=["GET"])
def get_notes():
    notes = list(db.notes.find())
    json_notes = [serialize_note(n) for n in notes]
    return jsonify({"notes": json_notes}), 200

@app.route("/create-note", methods=["POST"])
def create_note():
    title = request.json.get("title")
    content = request.json.get("content")
    if not title or not content:
        return jsonify({"message": "Missing fields"}), 400

    if db.notes.find_one({"title": title}):
        return jsonify({"message": "Note with same title already exists"}), 400

    res = db.notes.insert_one({"title": title, "content": content})
    return jsonify({"message": "New Note Created", "id": str(res.inserted_id)}), 201


@app.route("/update-notes/<note_id>", methods=["PATCH"])
def update_note(note_id):
    try:
        _id = ObjectId(note_id)
    except Exception:
        return jsonify({"message": "Invalid note id"}), 400

    data = request.json
    if not data:
        return jsonify({"message": "No data provided for updation"}), 400

    update = {}
    if "title" in data:
        update["title"] = data["title"]
    if "content" in data:
        update["content"] = data["content"]

    if not update:
        return jsonify({"message": "No valid fields to update"}), 400

    result = db.notes.update_one({"_id": _id}, {"$set": update})
    if result.matched_count == 0:
        return jsonify({"message": "Note not found"}), 404

    return jsonify({"message": "Note Updated"}), 200


@app.route("/delete-note/<note_id>", methods=["DELETE"])
def delete_note(note_id):
    try:
        _id = ObjectId(note_id)
    except Exception:
        return jsonify({"message": "Invalid note id"}), 400

    result = db.notes.delete_one({"_id": _id})
    if result.deleted_count == 0:
        return jsonify({"message": "Note not found"}), 404

    return jsonify({"message": "Note Deleted"}), 200
