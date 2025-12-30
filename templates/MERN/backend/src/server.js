import express from 'express' 
import { connectDB } from './config/database.js';
import dotenv from 'dotenv'
import noteRoutes from './routes/noteRoutes.js';
import rateLimiter from './middleware/rateLimiter.js';

dotenv.config(); // This will help you read the env variable. Else, undefined.

const app = express();
const PORT = process.env.PORT || 3000; 

// Middleware
app.use(express.json());
app.use(rateLimiter)

app.use("/api/notes", noteRoutes);

// Better to check database connection first then start the application
connectDB().then(() => {
    app.listen(PORT, () => 
        console.log("Server is running on port ", PORT));
})
