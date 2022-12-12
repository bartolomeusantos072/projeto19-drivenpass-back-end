
import { Credential } from "@prisma/client";
import joi from "joi";

export type createCredentialParams = Pick<Credential, "title" | "url" | "username" |"password">
export type credential = {
  id: number;
  title: string;
  url: string;
  username: string;
  password: string;
  userId: number;
}

export const credentialSchema = joi.object<createCredentialParams>({
  title: joi.string().max(50).required(),
  url: joi.string().required(),
  username: joi.string().required(),
  password: joi.string().required(),
});

