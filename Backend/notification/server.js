import app from './src/App.js';
import {connect} from './src/broker/rabbit.js'
import startListener from './src/broker/listener.js';
import config from './src/config/config.js';

console.log('🚀 Starting Notification Service...');
console.log('📋 Environment:', process.env.NODE_ENV || 'development');

const PORT = process.env.PORT || config.PORT || 10000;
const HOST = '0.0.0.0'; // Required for Render

// START HTTP SERVER FIRST (Critical for Render deployment)
app.listen(PORT, HOST, ()=> {
    console.log(`✅ Notification service is running on port ${PORT}`);
    console.log(`🏥 Health check available at: http://localhost:${PORT}/health`);
    console.log(`🌐 Listening on ${HOST}:${PORT}`);
    
    // THEN connect to RabbitMQ in the background
    connect().then(() => {
        console.log("✅ RabbitMQ connection established");
        startListener();
        console.log("👂 Email listeners activated");
    }).catch((err) => {
        console.error("❌ Failed to connect to RabbitMQ");
        console.error("Error details:", err?.message || err);
        console.error("⚠️  Service will start but emails will NOT be sent!");
    });
})