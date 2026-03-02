import { Request, Response } from "express";
import Stripe from "stripe";
import config from "config";
import orderModel from "../order/orderModel";
import { PaymentStatus } from "../order/orderTypes";
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
        config.get("stripe.webhookSecret"), // 👈 USE WEBHOOK SECRET HERE
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return res.status(400).send("Webhook Error");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === "paid") {
        const updatedOrder = await orderModel.findByIdAndUpdate(
          session.metadata?.orderId,
          {
            paymentStatus: PaymentStatus.PAID,
            paymentId: session.payment_intent,
          },
          { new: true },
        );

        await this.broker.sendMessage("order", JSON.stringify(updatedOrder));
      }
    }

    return res.json({ received: true });
  };
}
