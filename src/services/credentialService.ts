import { conflictError, notFoundError } from "@/errors";
import credentialRepository from "@/repositories/credentialRepository";
import { createCredentialParams } from "@/schemas";
import { Credential } from "@prisma/client";
import { decrypt, encrypt } from "../utils/cryptrUtils";

async function findAllCredentials(userId: number) {
  const credentials = await credentialRepository.findAllCredential(userId);
  if(!credentials) throw notFoundError();
  
  const result = credentials.map(credential => {
    const { password } = credential;
    return { ...credential, password: decrypt(password) };
  });
  return result;
}

async function findCredential(userId: number, credentialId: number) {
  const credential: Credential = await credentialRepository.findCredential(userId, credentialId);
  if(!credential) throw notFoundError();

  return {
    ...credential,
    password: decrypt(credential.password)
  };
}

async function createCredential(userId: number, credential: createCredentialParams) {
  const existingCredential = await credentialRepository.findCredentialByTitle(userId, credential.title);
  if(existingCredential) throw conflictError("Title already in use");

  const existingCredentialUrl: Credential[] = await credentialRepository.findCredentialByUrl(userId, credential.url);
  if(existingCredentialUrl.length >= 2) throw conflictError("it is possible to register only two credentials for the same site.");

  const credencialPassword = credential.password;
  const credentialInfos = { ...credential, password: encrypt(credencialPassword) };

  await credentialRepository.insertCredential(userId, credentialInfos);
}

async function deleteCredential(userId: number, credentialId: number) {
  await findCredential(userId, credentialId);
  await credentialRepository.deleteCredential(credentialId);
}

const credentialService = {
  findCredential,
  findAllCredentials,
  createCredential,
  deleteCredential
};

export default credentialService;
