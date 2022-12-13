import { createNetWorkParams } from "@/schemas";
import { prisma } from "../config/database";

async function findAllNetWork(userId: number) {
  if(userId < 1) {
    return null;
  }
  return prisma.netWork.findMany({
    where: { userId }
  });
}

async function findNetWork(userId: number, netWorkId: number) {
  return prisma.netWork.findFirst({
    where: {
      userId,
      id: netWorkId
    }
  });
}
async function findNetWorkByTitle(userId: number, title: string) {
  const result  = await prisma.netWork.findFirst( { where: { userId, title } } );
  return result;
}

async function insertNetWork(userId: number, netWork: createNetWorkParams) {
  return prisma.netWork.create({
    data: { ...netWork, userId }
  });
}

async function deleteNetWork(id: number) {
  return prisma.netWork.delete({
    where: { id }
  });
}

const netWorkRepository = {
  findAllNetWork,
  findNetWork,
  findNetWorkByTitle,
  deleteNetWork,
  insertNetWork
};

export default netWorkRepository;
