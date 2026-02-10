import { Response } from "express";
import { Request } from "express-jwt";
import customerModel from "./customerModel";

export class CustomerController {
  getCustomer = async (req: Request, res: Response) => {
    // todo: add these fields to jwt in auth service
    const { sub: userId, firstName, lastName, email } = req.auth;

    console.log(req.auth);

    const customer = await customerModel.findOne({ userId });
    // todo: implement service layer
    if (!customer) {
      const newCustomer = await customerModel.create({
        userId,
        firstName,
        lastName,
        email,
        addresses: [],
      });

      // todo: add logging
      return res.json(newCustomer);
    }

    res.json(customer);
  };
}
