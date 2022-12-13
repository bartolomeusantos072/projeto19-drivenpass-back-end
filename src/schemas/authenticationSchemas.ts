import { User } from "@prisma/client";
import Joi from "joi";

export type SignInParams = Pick<User, "email" | "password">;

export const signInSchema = Joi.object<SignInParams>({
  email: Joi.string().email().required(),
  password: Joi.string().min(10).required(),
});
