import amqp from 'amqplib';
import config from '../config/config.js';

let channel, connection;

export async function connect() {
  try {
    connection = await amqp.connect(config.RABBITMQ_URI);

    connection.on('error', (err) => {
      console.error('AMQP Connection error:', err);
      if (err.code === 'ECONNRESET') {
        console.log('Connection reset, retrying...');
        setTimeout(connect, 5000);
      }
    });

    connection.on('close', () => {
      console.log('AMQP Connection closed, retrying...');
      setTimeout(connect, 5000);
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('AMQP Channel error:', err);
    });

    console.log('Connected to RabbitMQ!');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
    setTimeout(connect, 5000);
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