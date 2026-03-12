import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import config from "config";
import cors from "cors";
import customerRouter from "./customer/customerRoute";
import couponRouter from "./coupon/couponRouter";
import orderRouter from "./order/orderRouter";
import paymentRouter from "./payment/paymentRouter";

const app = express();
app.use(cookieParser());

const ALLOWED_DOMAINS = [
  config.get("frontend.adminUI"),
  config.get("frontend.clientUI"),
];
app.use(
  cors({
    origin: ALLOWED_DOMAINS as string[],
    credentials: true,
  }),
);

app.use("/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).send('Order service running perfectly')
})

app.use("/customer", customerRouter);
app.use("/coupons", couponRouter);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);

app.use(globalErrorHandler);

export default app;
