import { User } from "@prisma/client";
import Joi from "joi";

export type CreateUserParams = Pick<User, "email" | "password">;

export const createUserSchema = Joi.object<CreateUserParams>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
