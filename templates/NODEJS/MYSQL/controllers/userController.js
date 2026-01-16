import pool from "../config/db.js";

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({message: "Error getting users", error: error.message});
    }
}

// Get A Single User
export const getUserByID = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({message: "User not found!"});
        }
        
        res.status(200).json(rows[0]);
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
        
        const [result] = await pool.query(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            [username, email]
        );
        
        const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
        
        res.status(201).json({
            message: "User created successfully", 
            createdUser: newUser[0]
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
        
        const [result] = await pool.query(
            'UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [username, email, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "User not found!"});
        }
        
        const [updatedUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        
        res.status(200).json({
            message: "User updated successfully", 
            updatedUser: updatedUser[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error updating user", error: error.message});
    }
}

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        
        if (user.length === 0) {
            return res.status(404).json({message: "User not found"});
        }
        
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        
        res.status(200).json({
            message: "User deleted successfully", 
            deletedUser: user[0]
        });
    } catch (error) {
        res.status(500).json({message: "Error deleting user", error: error.message});
    }
}