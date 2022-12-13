import { NetWork } from "@prisma/client";
import netWorkRepository from "@/repositories/netWorkRepository";
import { decrypt, encrypt } from "@/utils/cryptrUtils";
import { conflictError, notFoundError } from "@/errors";
import { createNetWorkParams } from "@/schemas";

export type CreateNetWorkData = Omit<NetWork, "id">;

async function findAllNetWorks(userId: number) {
  const netWorks = await netWorkRepository.findAllNetWork(userId);
  if(!netWorks) throw notFoundError();

  const result =  netWorks.map(netWork => {
    const { password } = netWork;
    return { ...netWork, password: decrypt(password) };
  });

  return result;
}

async function findNetWork(userId: number, netWorkId: number) {
  const netWork = await netWorkRepository.findNetWork(userId, netWorkId);
  if(!netWork) throw notFoundError();
  const { password } = netWork;
  const dcrypt = decrypt(password);
  return {
    ...netWork,
    password: dcrypt
  };
}

async function createNetWork(userId: number, netWork: createNetWorkParams) {
  const existingNetWork = await netWorkRepository.findNetWorkByTitle(userId, netWork.title);
  if(existingNetWork ) throw conflictError("Title already in use");

  const netWorkPassword = encrypt(netWork.password);

  const netWorkInfos = { ...netWork, userId, password: netWorkPassword };
  const result = await netWorkRepository.insertNetWork(userId, netWorkInfos);
  return result;
}

async function deleteNetWork(userId: number, netWorkId: number) {
  const find = await findNetWork(userId, netWorkId);
  await netWorkRepository.deleteNetWork(find.id);
}

const netWorkService = {
  findNetWork,
  findAllNetWorks,
  createNetWork,
  deleteNetWork
};

export default netWorkService;
