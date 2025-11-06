import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    RABBITMQ_URI: process.env.RABBITMQ_URI,
    FRONTEND_URL: process.env.FRONTEND_URL,
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN, // e.g., .onrender.com or your custom apex domain
    NODE_ENV: process.env.NODE_ENV || 'development',
}

export default _config;