import express from 'express' 
import { connectDB } from './config/dbConn.js';
import dotenv from 'dotenv'
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js';
// import rateLimiter from './middleware/upstash.js'; // Uncomment this after setting rateLimiter credentials or remove entirely
import cors from 'cors';

dotenv.config(); // This will help you read the env variable. Else, undefined.

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(express.json());
app.use(cors());
// app.use(rateLimiter); // Uncomment this after setting rateLimiter credentials or remove entirely

// AutoStack API
app.use('/autostack', (req, res) => {
    const message = ` 
        Congrats! You have successfully set up your full-stack project!
        If you're reading this message, it means your frontend and backend are completely connected!
        You are ready to create your next big project!
`
    return res.json({message: message, backend: 'NodeJS', database: "MySQL", filepath: 'backend/src/server.js'})
})

// These are example APIs you can choose to keep them as it is, modify them according to your database or remove them entirely
app.use("/api/notes", noteRoutes);
app.use("/api/users", userRoutes);


// connectDB().then(() => {
//     app.listen(PORT, () => 
//         console.log("Server is running on port", PORT));
// })

app.listen(PORT, () => console.log("Server is running on port", PORT))
