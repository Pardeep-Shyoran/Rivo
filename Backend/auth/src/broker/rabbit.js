import amqp from 'amqplib';
import config from '../config/config.js';

let channel, connection;

export async function connect() {
  try {
    connection = await amqp.connect(config.RABBITMQ_URI);

    connection.on('error', (err) => {
      console.error('AMQP Connection error:', err);
      if (err.code === 'ECONNRESET') {
        console.log('Connection reset - attempting to reconnect');
        setTimeout(connect, 5000);
      }
    });

    connection.on('close', () => {
      console.log('AMQP Connection closed - attempting to reconnect');
      setTimeout(connect, 5000);
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      console.error('AMQP Channel error:', err);
    });

    console.log('Connected to RabbitMQ!');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ:', err);
    setTimeout(connect, 5000); // retry after 5 seconds if initial connection fails
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