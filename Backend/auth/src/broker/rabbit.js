import amqp from 'amqplib';
import config from '../config/config.js';

let channel, connection;

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
  const url = config.RABBITMQ_URI;
  const opts = {
    // Keep the connection healthy and visible in the broker UI
    heartbeat: 30,
    clientProperties: { connection_name: 'auth-service' },
  };

  try {
    if (!url) {
      throw new Error('RABBITMQ_URI is not set');
    }

    console.log('Connecting to RabbitMQ at', redactUri(url));
    connection = await amqp.connect(url, opts);

    connection.on('error', (err) => {
      console.error('AMQP Connection error:', err?.message || err);
      if (err && err.code === 'ECONNRESET') {
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
      console.error('AMQP Channel error:', err?.message || err);
    });

    console.log('Connected to RabbitMQ!');
  } catch (err) {
    // amqplib often includes useful fields on errors returned during handshake
    const details = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      replyCode: err?.replyCode,
      replyText: err?.replyText,
      classId: err?.classId,
      methodId: err?.methodId,
    };
    console.error('Failed to connect to RabbitMQ:', details);
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