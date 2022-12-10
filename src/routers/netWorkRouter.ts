import { Router } from "express";

import  { createNetWork, deleteNetWork, findNetWork, findAllNetWorks }from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { netWorkSchema } from "@/schemas";

const netWorkRouter = Router();

netWorkRouter
  .all("/*", authenticateToken)
  .get("/", findAllNetWorks)
  .post("/", validateBody(netWorkSchema), createNetWork)
  .get("/:id", findNetWork)
  .delete("/:id", deleteNetWork);

export  { netWorkRouter };
