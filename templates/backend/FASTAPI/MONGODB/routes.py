from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from config import users_collection, notes_collection
from schemas import (
    UserCreate, UserUpdate, UserResponse,
    NoteCreate, NoteUpdate, NoteResponse
)

router = APIRouter()

# Convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

@router.get("/", status_code=status.HTTP_200_OK)
async def autostack():
    message = """
        Congrats! You have successfully set up your full-stack project!
        If you're reading this message, it means your frontend and backend are connected and running!
    """
    return {"message": message}


# Example User REST APIs
@router.get("/get-users", status_code=status.HTTP_200_OK)
async def get_users():
    users = []
    async for user in users_collection.find():
        users.append(serialize_doc(user))
    return {"users": users}


@router.post("/create-user", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    existing = await users_collection.find_one({
        "$or": [
            {"username": user.username},
            {"email": user.email}
        ]
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    
    user_dict = user.model_dump()
    result = await users_collection.insert_one(user_dict)
    
    if result.inserted_id:
        return {"message": "New User Created"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to create user"
    )


@router.patch("/update-users/{user_id}", status_code=status.HTTP_200_OK)
async def update_user(user_id: str, user_data: UserUpdate):
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    update_data = user_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided"
        )
    
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User Updated"}


@router.delete("/delete-user/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: str):
    # Validate ObjectId
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "User Deleted"}


# Example Note REST APIs
@router.get("/get-notes", status_code=status.HTTP_200_OK)
async def get_notes():
    notes = []
    async for note in notes_collection.find():
        notes.append(serialize_doc(note))
    return {"notes": notes}


@router.post("/create-note", status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate):
    existing = await notes_collection.find_one({"title": note.title})
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Note with this title already exists"
        )
    
    note_dict = note.model_dump()
    result = await notes_collection.insert_one(note_dict)
    
    if result.inserted_id:
        return {"message": "New Note Created"}
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Failed to create note"
    )


@router.patch("/update-notes/{note_id}", status_code=status.HTTP_200_OK)
async def update_note(note_id: str, note_data: NoteUpdate):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    update_data = note_data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data provided for updation"
        )
    
    result = await notes_collection.update_one(
        {"_id": ObjectId(note_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return {"message": "Note Updated"}


@router.delete("/delete-note/{note_id}", status_code=status.HTTP_200_OK)
async def delete_note(note_id: str):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid note ID"
        )
    
    result = await notes_collection.delete_one({"_id": ObjectId(note_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    return {"message": "Note Deleted"}