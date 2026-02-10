import { Request, Response } from "express";
import couponModel from "./couponModel";
import createHttpError from "http-errors";

export class CouponController {
  create = async (req: Request, res: Response) => {
    const { title, code, validUpto, discount, tenantId } = req.body;

    const coupon = await couponModel.create({
      title,
      code,
      validUpto,
      discount,
      tenantId,
    });

    return res.json(coupon);
  };

  update = async (req: Request, res: Response) => {
    const { couponId } = req.params;
    const { title, code, validUpto, discount } = req.body;

    const updatedCoupon = await couponModel.findByIdAndUpdate(
      couponId,
      {
        $set: {
          ...(title !== undefined && { title }),
          ...(code !== undefined && { code }),
          ...(validUpto !== undefined && { validUpto }),
          ...(discount !== undefined && { discount }),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedCoupon) {
      throw createHttpError(404, "Coupon not found");
    }

    return res.json(updatedCoupon);
  };

  getOne = async (req: Request, res: Response) => {
    const { couponId } = req.params;

    const coupon = await couponModel.findById(couponId);

    if (!coupon) {
      throw createHttpError(404, "Coupon not found");
    }

    return res.json(coupon);
  };

  getAll = async (req: Request, res: Response) => {
    const coupons = await couponModel.find();

    return res.json(coupons);
  };

  delete = async (req: Request, res: Response) => {
    const { couponId } = req.params;

    const deletedCoupon = await couponModel.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      throw createHttpError(404, "Coupon not found");
    }

    return res.json({
      message: "Coupon deleted successfully",
    });
  };
}
