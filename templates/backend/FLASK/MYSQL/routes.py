
from flask import request, jsonify
from config import app, db
from models import User, Note

@app.route("/autostack", methods=["GET"]) 
def autostack():
    message = """ 
        Congrats! You have successfully set up your full-stack project!
        If you're reading this message, it means your frontend and backend are completely connected!
        You are ready to create your next big project!
"""
    return jsonify({"message": message, "backend": "Flask", "database": "MySQL", "filepath": 'backend/main.py'}), 200

# Example user REST APIs
@app.route("/get-users", methods=["GET"])
def get_users():
    users = User.query.all()
    json_users = list(map(lambda x: x.to_json(), users))
    return jsonify({"users": json_users}), 200

@app.route("/create-user", methods=["POST"])
def create_user():
    username = request.json.get("username")
    email = request.json.get("email")
    
    if not username or not email:
        return(jsonify({"message": "Missing fields"})), 400
    
    new_user = User(username=username, email=email)
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New User Created"}), 201
    

@app.route("/update-users/<int:user_id>", methods=["PATCH"])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    data = request.json
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    if "username" in data:
        user.username = data["username"]
    if "email" in data:
        user.email = data["email"]

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User Updated"}), 200


@app.route("/delete-user/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    try:
        db.session.delete(user)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User Deleted"}), 200


# Example Notes REST APIs
@app.route("/get-notes", methods=["GET"])
def get_notes():
    notes = Note.query.all()
    json_notes = list(map(lambda x: x.to_json(), notes))
    return jsonify({"notes": json_notes}), 200

@app.route("/create-note", methods=["POST"])
def create_note():
    title = request.json.get("title")
    content = request.json.get("content")
    
    if not title or not content:
        return(jsonify({"message": "Missing fields"})), 400
    
    new_note = Note(title=title, content=content)
    try:
        db.session.add(new_note)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400
    
    return jsonify({"message": "New Note Created"}), 201
    

@app.route("/update-notes/<int:note_id>", methods=["PATCH"])
def update_note(note_id):
    note = Note.query.get(note_id)
    if not note:
        return jsonify({"message": "Note not found"}), 404
    data = request.json
    
    if not data:
        return jsonify({"message": "No data provided for updation"})
    
    if "title" in data:
        note.title = data["title"]
    if "content" in data:
        note.content = data["content"]

    try:
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "User Updated"}), 200


@app.route("/delete-note/<int:note_id>", methods=["DELETE"])
def delete_note(note_id):
    note = Note.query.get(note_id)
    if not note:
        return jsonify({"message": "Note not found"}), 404
    try:
        db.session.delete(note)
        db.session.commit()
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    return jsonify({"message": "Note Deleted"}), 200
