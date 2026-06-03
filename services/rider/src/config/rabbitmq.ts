import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL!);

    channel = await connection.createChannel();

    await channel.assertQueue(process.env.RIDER_QUEUE!, {
      durable: true,
    });

    await channel.assertQueue(process.env.ORDER_READY_QUEUE!, {
      durable: true,
    });

    console.log("🐇 Connected to RabbitMQ (rider service)");

  } catch (error) {
    console.error("❌ RabbitMQ connection failed (rider). Retrying in 5 seconds...");
    setTimeout(connectRabbitMQ, 5000);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error("RabbitMQ channel not initialized");
  }
  return channel;
};