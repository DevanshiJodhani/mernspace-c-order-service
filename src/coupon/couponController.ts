import { NextFunction, Request, Response } from "express";
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

  update = async (req: Request, res: Response, next: NextFunction) => {
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
      const error = createHttpError(400, "coupon not found");
      next(error);
    }

    return res.json(updatedCoupon);
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const { couponId } = req.params;

    const coupon = await couponModel.findById(couponId);

    if (!coupon) {
      const error = createHttpError(400, "coupon not found");
      next(error);
    }

    return res.json(coupon);
  };

  getAll = async (req: Request, res: Response) => {
    const coupons = await couponModel.find();

    return res.json(coupons);
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    const { couponId } = req.params;

    const deletedCoupon = await couponModel.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      const error = createHttpError(400, "coupon not found");
      next(error);
    }

    return res.json({
      message: "Coupon deleted successfully",
    });
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    const { code, tenantId } = req.body;

    //  todo: request validation

    const coupon = await couponModel.findOne({ code, tenantId });

    if (!coupon) {
      const error = createHttpError(400, "coupon not found");
      next(error);
    }

    // validate expiry
    const currentDate = new Date();
    const couponDate = new Date(coupon.validUpto);

    if (currentDate <= couponDate) {
      return res.json({
        valid: true,
        discount: coupon.discount,
      });
    }

    return res.json({
      valid: false,
      discount: 0,
    });
  };
}
