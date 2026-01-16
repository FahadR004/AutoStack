// db.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT || 5432
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL connected successfully!');
        client.release();
        return pool;
    } catch (error) {
        console.error("Error connecting to database:", error.message);
        process.exit(1);
    }
};

export default pool;