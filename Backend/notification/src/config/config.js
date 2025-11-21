import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const _config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    EMAIL_USER: process.env.EMAIL_USER,
    RABBITMQ_URI: process.env.RABBITMQ_URI,
    REDIRECT_URI: process.env.REDIRECT_URI,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,
    EMAIL_FROM: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL,
    NODE_ENV: process.env.NODE_ENV,
}

// Validate critical environment variables
const requiredEnvVars = ['RABBITMQ_URI', 'EMAIL_USER', 'CLIENT_ID', 'CLIENT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !_config[varName]);

if (missingVars.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error('\n💡 Please set these environment variables in your Render dashboard or .env file');
}

export default Object.freeze(_config);