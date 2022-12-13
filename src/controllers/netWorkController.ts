import { Response } from "express";
import httpStatus from "http-status";
import { createNetWorkParams } from "@/schemas";
import { NetWork } from "@prisma/client";
import netWorkService from "@/services/netWorkService";
import { AuthenticatedRequest } from "@/middlewares";

export async function findAllNetWorks(req: AuthenticatedRequest, res: Response) {
  const { userId }= req;
  try {
    const netWorks: NetWork[] = await netWorkService.findAllNetWorks(userId);
    res.status(httpStatus.OK).send(netWorks);  
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function findNetWork(req: AuthenticatedRequest, res: Response) {
  const { userId }= req;
  const netWorkId = parseInt(req.params.id);

  try {
    const netWork: NetWork = await netWorkService.findNetWork(userId, netWorkId);
    res.status(httpStatus.OK).send(netWork);  
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createNetWork(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const netWork = req.body as createNetWorkParams;

  try {
    const result = await netWorkService.createNetWork(userId, netWork);
    res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    if(error.name === "ConflictError") {
      res.sendStatus(httpStatus.CONFLICT).send(error);  
    }
    return res.sendStatus(httpStatus.NOT_ACCEPTABLE);
  }
}

export async function deleteNetWork(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const netWorkId = parseInt(req.params.id);
  if(isNaN(netWorkId) || netWorkId === 0) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
  try {
    const result = await netWorkService.deleteNetWork(userId, netWorkId);
    res.status(httpStatus.MOVED_PERMANENTLY).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
