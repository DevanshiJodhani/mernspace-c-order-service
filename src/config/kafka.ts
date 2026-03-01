import { Consumer, EachMessagePayload, Kafka, Producer } from "kafkajs";
import { MessageBroker } from "../types/broker";
import { handleProductUpdate } from "../productCache/productUpdateHandler";
import { handleToppingUpdate } from "../toppingCache/toppingUpdateHandler";

export class KafkaBroker implements MessageBroker {
  private consumer: Consumer;
  private producer: Producer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });

    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: clientId });
  }

  /**
   * Connect the producer
   */
  async connectProducer() {
    await this.producer.connect();
  }


  /**
   * Connect the consumer
   */
  async connectConsumer() {
    await this.consumer.connect();
  }

  /**
   * Disconnect the producer
   */
  async disconnectProducer() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  /**
   *
   * @param topic - the topic to send the message to
   * @param message - The message to send
   * @throws {Error} - When the producer is not connected
   */
  async sendMessage(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }

  /**
   * Disconnect the consumer
   */
  async disconnectConsumer() {
    await this.consumer.disconnect();
  }

  async consumeMessage(topics: string[], fromBeginning: boolean = false) {
    await this.consumer.subscribe({ topics, fromBeginning });

    await this.consumer.run({
      eachMessage: async ({
        topic,
        partition,
        message,
      }: EachMessagePayload) => {
        // Logic to handle incoming messages.

        switch (topic) {
          case "product":
            await handleProductUpdate(message.value.toString());
            return;
          case "topping":
            await handleToppingUpdate(message.value.toString());
            return;
          default:
            console.log("Doing nothing...");
        }

        console.log({
          value: message.value.toString(),
          topic,
          partition,
        });
      },
    });
  }
}
