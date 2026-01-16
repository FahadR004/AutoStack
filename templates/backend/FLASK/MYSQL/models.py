from config import db

class User(db.Model): # DB Model
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }
    

class Note(db.Model): # DB Model
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(80), unique=True, nullable=False)
    content = db.Column(db.String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content
        }