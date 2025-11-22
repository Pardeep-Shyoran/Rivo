import express from 'express';
import { getConnectionStatus, ensureConnection } from './broker/rabbit.js';
import cors from 'cors';

const app = express();
app.use(cors());

// Enhanced health check endpoint with RabbitMQ status
app.get('/health', (_req, res) => {
	const rabbitStatus = getConnectionStatus();
	const isHealthy = rabbitStatus.connected;
	
	res.status(isHealthy ? 200 : 503).json({ 
		status: isHealthy ? 'ok' : 'degraded',
		service: 'notification-service',
		rabbitmq: rabbitStatus,
		timestamp: new Date().toISOString()
	});
});

// Detailed status endpoint for debugging
app.get('/status', (_req, res) => {
	const rabbitStatus = getConnectionStatus();
	
	res.json({
		service: 'notification-service',
		uptime: process.uptime(),
		memory: process.memoryUsage(),
		rabbitmq: rabbitStatus,
		environment: {
			NODE_ENV: process.env.NODE_ENV,
			hasRabbitMqUri: !!process.env.RABBITMQ_URI,
			hasEmailUser: !!process.env.EMAIL_USER,
		},
		timestamp: new Date().toISOString()
	});
});

// Reconnection endpoint - triggers connection verification/restoration
app.post('/reconnect', async (_req, res) => {
	try {
		const status = await ensureConnection();
		res.json({
			message: 'Connection check completed',
			rabbitmq: status,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		res.status(500).json({
			error: 'Reconnection failed',
			details: error.message,
			timestamp: new Date().toISOString()
		});
	}
});

export default app;