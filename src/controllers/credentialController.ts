import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import { Credential } from "@prisma/client";
import { createCredentialParams } from "@/schemas";
import credentialService from "@/services/credentialService";

export async function findAllCredentials(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const credentials = await credentialService.findAllCredentials(userId);
    console.log("resultado", credentials);
    return res.status(httpStatus.OK).send(credentials);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function findCredential(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  
  const credentialId = parseInt(req.params.id);

  try {
    const credential: Credential = await credentialService.findCredential(userId, credentialId);
    res.status(httpStatus.OK).send(credential);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createCredential(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const credential = req.body as createCredentialParams;
  
  try {
    const result = await credentialService.createCredential(userId, credential);
    res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_ACCEPTABLE);
  }
}

export async function deleteCredential(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const credentialId = parseInt(req.params.id);
  
  try {
    const result =  await credentialService.deleteCredential(userId, credentialId);
    res.status(httpStatus.MOVED_PERMANENTLY).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
