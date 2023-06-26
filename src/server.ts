import express, { Request, Response } from 'express';
import * as amqp from 'amqplib';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Create Express app
const app = express();

const server = http.createServer(app);


// RabbitMQ configuration
const rabbitMQUrl = process.env.RABBIT_MQ!;
const queueName = 'RabbitMQ_Queue';

// Connect to RabbitMQ and consume messages
async function consumeMessages() {
  try {
    const connection = await amqp.connect(rabbitMQUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    channel.consume(
      queueName,
      (msg) => {
        if (msg !== null) {
          const message = msg.content.toString();
          console.log('Received message:', message);

          channel.ack(msg);
        }
      },
      { noAck: false }
    );

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    process.on('SIGINT', async () => {
      await channel.close();
      await connection.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error while setting up RabbitMQ connection:', error);
  }
}

// Express route to handle incoming requests
app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// Start the server
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  consumeMessages();
});
