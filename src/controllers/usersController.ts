import { Request, Response } from "express";
import httpStatus from "http-status";
import { CreateUserParams } from "@/schemas";
import usersService from "@/services/usersService";

export async function usersPost(req: Request, res: Response) {
  const { email, password } = req.body as CreateUserParams;
  
  try {
    const user = await usersService.createUser({ email, password });
    
    return res.status(httpStatus.CREATED).send(user);
  } catch (error) {
    if (error.name === "ConflictError" ) {
      return res.status(httpStatus.CONFLICT).send(error);
    }
    return res.status(httpStatus.BAD_REQUEST).send(error);
  }
}
