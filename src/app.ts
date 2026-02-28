import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import config from "config";
import cors from "cors";
import customerRouter from "./customer/customerRoute";
import couponRouter from "./coupon/couponRouter";
import orderRouter from "./order/orderRouter";

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
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});

app.use("/customer", customerRouter);
app.use("/coupons", couponRouter);
app.use("/orders", orderRouter);

app.use(globalErrorHandler);

export default app;
