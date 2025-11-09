import amqp from 'amqplib';
import config from '../config/config.js';

let channel = null;
let connection = null;
let isConnecting = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 10000; // 10 seconds

export async function connect() {
  // Prevent multiple simultaneous connection attempts
  if (isConnecting || connection) {
    console.log('RabbitMQ connection already exists or is in progress');
    return;
  }

  isConnecting = true;

  try {
    console.log('Connecting to RabbitMQ...');
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
    retryCount = 0;
    isConnecting = false;
  } catch (err) {
    connection = null;
    channel = null;
    isConnecting = false;
    
    console.error('Failed to connect to RabbitMQ:', err?.message || err);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`Will retry in ${RETRY_DELAY/1000} seconds (attempt ${retryCount}/${MAX_RETRIES})`);
      setTimeout(() => {
        isConnecting = false;
        connect();
      }, RETRY_DELAY);
    } else {
      console.error('Max connection retries reached');
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
    throw new Error('Channel not initialized');
  }
  await channel.assertQueue(queueName, { durable: true });

  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      try {
        await callback(JSON.parse(msg.content.toString()));
        channel.ack(msg);
      } catch (err) {
        console.error('Error processing message:', err);
        // Optionally do not ack to requeue the message or ack to discard
      }
    }
  });
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