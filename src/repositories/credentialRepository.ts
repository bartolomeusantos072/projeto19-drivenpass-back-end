import { createCredentialParams } from "@/schemas";
import { prisma } from "../config/database";

async function findAllCredential(userId: number) {
  if(userId < 1) {
    return null;
  }
  return prisma.credential.findMany({
    where: { userId }
  });
}

async function findCredential(userId: number, credencialId: number) {
  if(userId < 1 || credencialId < 1) {
    return null;
  }
  return prisma.credential.findFirst({
    where: {
      userId,
      id: credencialId
    }
  });
}

async function findCredentialByTitle(userId: number, title: string) {
  const result  = await prisma.credential.findFirst( { where: { userId, title } } );
  return result;
}

async function findCredentialByUrl(userId: number, url: string) {
  return prisma.credential.findMany({
    where: { userId, url }
  });
}

async function insertCredential(userId: number, credentialData: createCredentialParams) {
  return prisma.credential.create({
    data: { ...credentialData, userId }
  });
}

async function deleteCredential(id: number) {
  return prisma.credential.delete({ where: { id } });
}

const credentialRepository = {
  findAllCredential,
  findCredential,
  findCredentialByTitle,
  findCredentialByUrl,
  deleteCredential,
  insertCredential
};

export default credentialRepository;
