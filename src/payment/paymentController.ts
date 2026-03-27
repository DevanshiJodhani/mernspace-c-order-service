import { Request, Response } from "express";
import Stripe from "stripe";
import config from "config";
import orderModel from "../order/orderModel";
import { OrderEvents, PaymentStatus } from "../order/orderTypes";
import { MessageBroker } from "../types/broker";
import { PaymentGW } from "./paymentTypes";

export class PaymentController {
  private stripe: Stripe;

  constructor(
    private paymentGw: PaymentGW,
    private broker: MessageBroker,
  ) {
    this.stripe = new Stripe(config.get("stripe.secretKey"));
  }

  handleWebhook = async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.get("stripe.webhookSecret"),
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send("Webhook Error");
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const orderId = paymentIntent.metadata?.orderId;

      console.log("ORDER ID FROM WEBHOOK:", orderId);

      if (!orderId) {
        console.error("OrderId missing in metadata");
        return res.sendStatus(200);
      }

      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: PaymentStatus.PAID,
          paymentId: paymentIntent.id,
        },
        { new: true },
      );

      const brokerMessage = {
        event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
        data: updatedOrder,
      };

      await this.broker.sendMessage(
        "order",
        JSON.stringify(brokerMessage),
        updatedOrder._id.toString(),
      );
    }

    return res.json({ success: true });
  };
}
