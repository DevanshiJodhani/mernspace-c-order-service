import express from "express";
import { asyncWrapper } from "../utils";
import { CouponController } from "./couponController";
import authenticate from "../common/middleware/authenticate";

const router = express.Router();

const couponController = new CouponController();

router.post("/", authenticate, asyncWrapper(couponController.create));

router.patch("/:couponId", authenticate, asyncWrapper(couponController.update));

router.get("/:couponId", authenticate, asyncWrapper(couponController.getOne));

router.get("/", authenticate, asyncWrapper(couponController.getAll));

export default router;
