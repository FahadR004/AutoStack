import pool from "../config/db.js"

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({message: "Error getting users", error: error.message});
    }
}

// Get A Single User
export const getUserByID = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "User not found!"});
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({message: "Error finding user", error: error.message});
    }
}

// Create A User
export const createUser = async (req, res) => {
    try {
        const {username, email} = req.body;
        if (!username || !email) {
            return res.status(400).json({message: "Please fill in all the fields"});
        }
        
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
            [username, email]
        );
        
        res.status(201).json({
            message: "User created successfully", 
            createdUser: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error creating user", error: error.message});
    }
}

// Update User
export const updateUser = async (req, res) => {
    try {
        const {username, email} = req.body;
        const { id } = req.params;
        
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [username, email, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "User not found!"});
        }
        
        res.status(200).json({
            message: "User updated successfully", 
            updatedUser: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error updating user", error: error.message});
    }
}

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        
        res.status(200).json({
            message: "User deleted successfully", 
            deletedUser: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error deleting user", error: error.message});
    }
}