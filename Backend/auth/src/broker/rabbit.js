import amqp from 'amqplib';
import config from '../config/config.js';

let channel = null;
let connection = null;
let isConnecting = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 10000; // 10 seconds between retries

function redactUri(uri) {
  try {
    const u = new URL(uri);
    if (u.username) u.username = '****';
    if (u.password) u.password = '****';
    return u.toString();
  } catch {
    return 'Invalid or missing RABBITMQ_URI';
  }
}

export async function connect() {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting || connection) {
    console.log('RabbitMQ connection already exists or is in progress');
    return;
  }

  isConnecting = true;
  const url = config.RABBITMQ_URI;
  const opts = {
    heartbeat: 60, // Increase heartbeat interval to reduce traffic
    clientProperties: { 
      connection_name: `auth-service-${process.pid}` // Unique name per process
    },
  };

  try {
    if (!url) {
      throw new Error('RABBITMQ_URI is not set');
    }

    console.log('Connecting to RabbitMQ at', redactUri(url));
    connection = await amqp.connect(url, opts);

    connection.on('error', (err) => {
      console.error('AMQP Connection error:', err?.message || err);
      // Don't auto-reconnect on error to avoid connection buildup
      channel = null;
      connection = null;
    });

    connection.on('close', () => {
      console.log('AMQP Connection closed');
      channel = null;
      connection = null;
      isConnecting = false;
      
      // Only reconnect if we haven't exceeded retry limit
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Will retry connection in ${RETRY_DELAY/1000} seconds (attempt ${retryCount}/${MAX_RETRIES})`);
        setTimeout(() => {
          isConnecting = false;
          connect();
        }, RETRY_DELAY);
      } else {
        console.error('Max RabbitMQ reconnection attempts reached. Notifications disabled.');
      }
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('AMQP Channel error:', err?.message || err);
    });

    console.log('✅ Connected to RabbitMQ successfully!');
    retryCount = 0; // Reset retry count on successful connection
    isConnecting = false;
  } catch (err) {
    connection = null;
    channel = null;
    isConnecting = false;
    
    const details = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      replyCode: err?.replyCode,
      replyText: err?.replyText,
    };
    console.error(`Failed to connect to RabbitMQ:`, details);
    
    // Only retry if under limit
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Will retry in ${RETRY_DELAY/1000} seconds (attempt ${retryCount}/${MAX_RETRIES})`);
      setTimeout(() => {
        isConnecting = false;
        connect();
      }, RETRY_DELAY);
    } else {
      console.error('Max RabbitMQ connection retries reached. Notifications will be disabled.');
    }
  }
}

export async function publishToQueue(queueName, data) {
  if (!channel) {
    console.warn('RabbitMQ channel not available. Skipping message to queue:', queueName);
    return; // Don't throw error, just log warning
  }
  try {
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log('Message sent to Queue', queueName);
  } catch (error) {
    console.error('Failed to publish to queue:', queueName, error.message);
  }
}

// Graceful shutdown function
export async function closeConnection() {
  try {
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