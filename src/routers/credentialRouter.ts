import { Router } from "express";

import { createCredential, deleteCredential, findCredential, findAllCredentials } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { credentialSchema } from "@/schemas";

const credentialRouter = Router();

credentialRouter
  .all("/*", authenticateToken)
  .get("/", findAllCredentials)
  .post("/", validateBody(credentialSchema), createCredential)
  .get("/:id", findCredential)
  .delete("/:id", deleteCredential);

export  { credentialRouter };
