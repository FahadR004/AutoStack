import pool from "../config/db.js";

// Get All Notes
export const getAllNotes = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM notes ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Get A Single Note
export const getNoteByID = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM notes WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "Note not found!"});
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

// Create A Note
export const createNote = async (req, res) => {
    try {
        const {title, content} = req.body;
        if (!title || !content) {
            return res.status(400).json({message: "Please fill in all the fields"});
        }
        
        const result = await pool.query(
            'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
            [title, content]
        );
        
        res.status(201).json({
            message: "Note created successfully", 
            createdNote: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error creating note", error: error.message});
    }
}

// Update Note
export const updateNote = async (req, res) => {
    try {
        const {title, content} = req.body;
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [title, content, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "Note not found!"});
        }
        
        res.status(200).json({
            message: "Note updated successfully", 
            updatedNote: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error updating note", error: error.message});
    }
}

// Delete Note
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM notes WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "Note not found"});
        }
        
        res.status(200).json({
            message: "Note deleted successfully", 
            deletedNote: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error deleting note", error: error.message});
    }
}