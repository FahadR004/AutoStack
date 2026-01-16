import mysql2 from 'mysql2';
import dotenv from 'dotenv'

dotenv.config();

export const connectDB = async () => {
    try {
        const connection = await mysql2.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        });
        console.log('MySQL connected successfully!');
        return connection;
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        process.exit(1);
    }
};