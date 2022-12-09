
import { NetWork } from "@prisma/client";
import joi from "joi";

export type createNetWorkParams = Pick<NetWork, "title" | "netWork" |"password">

export const netWorkSchema = joi.object<createNetWorkParams>({
  title: joi.string().max(50).required(),
  netWork: joi.string().required(),
  password: joi.string().required()
});
