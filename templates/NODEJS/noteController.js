import { Note } from "../models/noteModel.js"
import mongoose from "mongoose"

// Get All Notes
export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find();
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Get A Single Note
export const getNoteByID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({message: "Note not found!"})
        }
        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({message: "Note not found!"})
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Create A Note
export const createNote = async (req, res) => {
    try {
        const {title, content} = req.body;
        if (!title || !content) {
            return res.status(400).json({message: "Please fill in all the fields"})
        }
        const newNote = new Note({title, content});
        const savedNote = await newNote.save();
        res.status(201).json({message: "Note created successfully", createdNote: savedNote});
    } catch (error) {
        res.status(500).json({message: "Error creating note", error: error.message});
    }
}


// Update Note
export const updateNote = async (req, res) => {
    try {
        const {title, content} = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            {
                title, 
                content
            },
            {
                new: true  // Returns the updated note
            }
        )
        if (!updatedNote) return res.status(404).json({message: "Note not found!"});
        res.status(200).json({message: "Note updated successfully", updatedNote: updatedNote});
    } catch (error) {
        res.status(500).json({message: "Error updating note", error: error.message});
    }
}


// Delete Note
export const deleteNote = async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({message: "Note not found"});
        res.status(200).json({message: "Note deleted successfully", deletedNote});
    } catch (error) {
        res.status(500).json({message: "Error deleting note", error: error.message});
    }
}

