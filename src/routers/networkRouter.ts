import { Router } from "express";

import  { createNetwork, deleteNetwork, findNetwork, findAllNetworks }from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { networkSchema } from "@/schemas";

const networkRouter = Router();

networkRouter.all("/*", authenticateToken)
  .get("/", findAllNetworks)
  .post("/", validateBody(networkSchema), createNetwork)
  .get("/:id", findNetwork)
  .delete("/:id", deleteNetwork);

export  { networkRouter };
