import { createCredentialParams } from "@/schemas";
import { prisma } from "../config/database";

async function findAllCredential(userId: number) {
  return prisma.credential.findMany({
    where: { userId }
  });
}

async function findCredential(userId: number, credencialId: number) {
  return prisma.credential.findFirst({
    where: {
      userId,
      id: credencialId
    }
  });
}

async function findCredentialByTitle(userId: number, title: string) {
  return prisma.credential.findFirst({
    where: { userId, title }
  });
}

async function findCredentialByUrl(userId: number, url: string) {
  return prisma.credential.findMany({
    where: { userId, url }
  });
}

async function insertCredential(userId: number, credential: createCredentialParams) {
  return prisma.credential.create({
    data: { ...credential, userId }
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
