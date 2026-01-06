import { User } from "./userModel.js"
import mongoose from "mongoose"

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await Note.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({message: "Error getting users", error: error.message});
    }
}

// Get A Single User
export const getUserByID = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({message: "User not found!"})
        }
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({message: "User not found!"})
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: "Error finding user", error: error.message});
    }
}

// Create A User
export const createUser = async (req, res) => {
    try {
        const {username, email} = req.body;
        if (!username || !email) {
            return res.status(400).json({message: "Please fill in all the fields"})
        }
        const newUser = new User({title, content});
        const savedUser = await newUser.save();
        res.status(201).json({message: "User created successfully", createdNote: savedUser});
    } catch (error) {
        res.status(500).json({message: "Error creating user", error: error.message});
    }
}


// Update User
export const updateUser = async (req, res) => {
    try {
        const {username, email} = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                username, 
                email
            },
            {
                new: true  // Returns the updated user
            }
        )
        if (!updatedUser) return res.status(404).json({message: "User not found!"});
        res.status(200).json({message: "User updated successfully", updatedUser: updatedUser});
    } catch (error) {
        res.status(500).json({message: "Error updating user", error: error.message});
    }
}


// Delete User
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({message: "User not found"});
        res.status(200).json({message: "User deleted successfully", deletedUser});
    } catch (error) {
        res.status(500).json({message: "Error deleting user", error: error.message});
    }
}

