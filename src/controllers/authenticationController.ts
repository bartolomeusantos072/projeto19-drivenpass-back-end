import { Request, Response } from "express";
import httpStatus from "http-status";
import { SignInParams } from "@/schemas";
import authenticationService from "@/services/authenticationService";

export async function singInPost(req: Request, res: Response) {
  const { email, password } = req.body as SignInParams;

  try {
    const result = await authenticationService.signIn({ email, password });
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    return res.status(httpStatus.UNAUTHORIZED).send(error.text);
  }
}
