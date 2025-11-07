import express from 'express';

const app = express();

// Basic health check endpoint for uptime monitoring
app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' });
});

export default app;