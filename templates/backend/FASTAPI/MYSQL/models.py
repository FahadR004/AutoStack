from sqlalchemy import Column, Integer, String
from config import Base

class User(Base):
    __tablename__ = "user"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email
        }


class Note(Base):
    __tablename__ = "note"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(80), unique=True, nullable=False, index=True)
    content = Column(String(120), unique=True, nullable=False)

    def to_json(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content
        }