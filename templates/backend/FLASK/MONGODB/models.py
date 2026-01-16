from bson import ObjectId

def serialize_user(doc):
    return {
        "id": str(doc.get("_id")),
        "username": doc.get("username"),
        "email": doc.get("email"),
    }


def serialize_note(doc):
    return {
        "id": str(doc.get("_id")),
        "title": doc.get("title"),
        "content": doc.get("content"),
    }
