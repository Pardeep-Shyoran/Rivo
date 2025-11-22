import amqp from 'amqplib';
import config from '../config/config.js';

let channel = null;
let connection = null;
let isConnecting = false;
let retryCount = 0;
const MAX_RETRIES = 5; // Increased from 3
const RETRY_DELAY = 10000; // 10 seconds
let lastConnectionAttempt = null;
let lastSuccessfulConnection = null;
let healthCheckInterval = null;

export async function connect() {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting || connection) {
    console.log('RabbitMQ connection already exists or is in progress');
    return;
  }

  isConnecting = true;

  try {
    if (!config.RABBITMQ_URI) {
      throw new Error('RABBITMQ_URI environment variable is not set. Please configure it in Render dashboard.');
    }

    console.log('🔌 Connecting to RabbitMQ...');
    console.log('📍 RabbitMQ Host:', config.RABBITMQ_URI.split('@')[1]?.split('/')[0] || 'unknown');
    
    connection = await amqp.connect(config.RABBITMQ_URI, {
      heartbeat: 60,
      clientProperties: { 
        connection_name: `notification-service-${process.pid}` 
      }
    });

    connection.on('error', (err) => {
      console.error('AMQP Connection error:', err?.message || err);
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.log('AMQP Connection closed');
      channel = null;
      connection = null;
      isConnecting = false;
      
      // Only reconnect if under retry limit
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Will retry in ${RETRY_DELAY/1000} seconds (attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(() => {
          isConnecting = false;
          connect();
        }, RETRY_DELAY);
      } else {
        console.error('Max reconnection attempts reached');
      }
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('AMQP Channel error:', err?.message || err);
    });

    console.log('✅ Connected to RabbitMQ successfully!');
    console.log('📬 Notification service is ready to receive messages');
    retryCount = 0;
    isConnecting = false;
    lastSuccessfulConnection = new Date().toISOString();
    
    // Start periodic health check to keep connection alive
    startHealthCheck();
  } catch (err) {
    connection = null;
    channel = null;
    isConnecting = false;
    lastConnectionAttempt = new Date().toISOString();
    
    console.error('❌ Failed to connect to RabbitMQ');
    console.error('Error details:', {
      message: err?.message,
      code: err?.code,
      type: err?.name,
    });
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`🔄 Will retry in ${RETRY_DELAY/1000} seconds (attempt ${retryCount}/${MAX_RETRIES})`);
      setTimeout(() => {
        isConnecting = false;
        connect();
      }, RETRY_DELAY);
    } else {
      console.error('🚨 CRITICAL: Max connection retries reached. Notification service will NOT send emails!');
      console.error('🔧 Action required: Check RABBITMQ_URI environment variable and network connectivity');
    }
  }
}

export async function publishToQueue(queueName, data) {
  if (!channel) {
    throw new Error('Channel not initialized');
  }
  await channel.assertQueue(queueName, { durable: true });
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log('Message sent to Queue', queueName);
}

export async function subscribeToQueue(queueName, callback) {
  if (!channel) {
    console.error(`❌ Cannot subscribe to queue '${queueName}': RabbitMQ channel not initialized`);
    throw new Error('Channel not initialized. Check RabbitMQ connection.');
  }
  
  await channel.assertQueue(queueName, { durable: true });
  console.log(`👂 Listening to queue: ${queueName}`);

  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        const data = JSON.parse(msg.content.toString());
        console.log(`📨 Received message from '${queueName}':`, data.email || 'no email');
        await callback(data);
        channel.ack(msg);
        console.log(`✅ Message processed successfully from '${queueName}'`);
      } catch (err) {
        console.error(`❌ Error processing message from '${queueName}':`, err.message);
        // Ack anyway to prevent infinite requeue loops
        channel.ack(msg);
      }
    }
  });
}

// Periodic health check to keep connection alive and detect issues early
function startHealthCheck() {
  // Clear any existing interval
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  // Check connection health every 5 minutes
  healthCheckInterval = setInterval(async () => {
    if (!connection || !channel) {
      console.warn('⚠️ Health check: Connection lost, attempting reconnect...');
      if (retryCount < MAX_RETRIES) {
        await connect();
      }
      return;
    }
    
    try {
      // Send a lightweight check to verify channel is alive
      await channel.checkQueue('user_created');
      console.log('💚 Health check: RabbitMQ connection is healthy');
      // Reset retry count on successful health check
      retryCount = 0;
      lastSuccessfulConnection = new Date().toISOString();
    } catch (err) {
      console.error('❌ Health check failed:', err.message);
      // Connection is stale, reset and reconnect
      connection = null;
      channel = null;
      if (retryCount < MAX_RETRIES) {
        console.log('🔄 Attempting to reconnect...');
        await connect();
      }
    }
  }, 5 * 60 * 1000); // Every 5 minutes
}

// Get connection status for health checks
export function getConnectionStatus() {
  return {
    connected: !!connection && !!channel,
    isConnecting,
    retryCount,
    maxRetries: MAX_RETRIES,
    lastConnectionAttempt,
    lastSuccessfulConnection,
  };
}

// Force reconnection (useful for external health checks)
export async function ensureConnection() {
  if (!connection || !channel) {
    console.log('🔄 Ensuring connection...');
    // Reset retry count to allow reconnection
    if (retryCount >= MAX_RETRIES) {
      console.log('♻️ Resetting retry count to allow reconnection');
      retryCount = 0;
    }
    await connect();
    return getConnectionStatus();
  }
  
  try {
    // Verify connection is actually working
    await channel.checkQueue('user_created');
    return getConnectionStatus();
  } catch (err) {
    console.error('Connection verification failed:', err.message);
    connection = null;
    channel = null;
    retryCount = 0; // Reset to allow reconnection
    await connect();
    return getConnectionStatus();
  }
}

// Graceful shutdown function
export async function closeConnection() {
  try {
    // Clear health check interval
    if (healthCheckInterval) {
      clearInterval(healthCheckInterval);
      healthCheckInterval = null;
    }
    
    if (channel) {
      console.log('Closing RabbitMQ channel...');
      await channel.close();
      channel = null;
    }
    if (connection) {
      console.log('Closing RabbitMQ connection...');
      await connection.close();
      connection = null;
    }
    console.log('RabbitMQ connection closed gracefully');
  } catch (error) {
    console.error('Error closing RabbitMQ connection:', error.message);
  }
}

// Setup graceful shutdown handlers
if (process.env.NODE_ENV !== 'test') {
  process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT signal, closing RabbitMQ connection...');
    await closeConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\nReceived SIGTERM signal, closing RabbitMQ connection...');
    await closeConnection();
    process.exit(0);
  });

  process.on('exit', () => {
    console.log('Process exiting, RabbitMQ cleanup complete');
  });
}