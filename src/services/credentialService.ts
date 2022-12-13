import { conflictError, notFoundError } from "@/errors";
import credentialRepository from "@/repositories/credentialRepository";
import { createCredentialParams } from "@/schemas";
import { Credential } from "@prisma/client";
import { decrypt, encrypt } from "@/utils/cryptrUtils";

async function findAllCredentials(userId: number) {
  const credentials = await credentialRepository.findAllCredential(userId);
  if(!credentials) throw notFoundError();
  
  const result = credentials.map(credential => {
    const { password } = credential;
    return { ...credential, password: decrypt(password) };
  });
  return result;
}

async function findCredential( idUser: number, credentialId: number) {
  const credential = await credentialRepository.findCredential(idUser, credentialId);
  if(!credential) throw notFoundError();
  const { title, url, userId, password, username, id } = credential;
  const descrypt = decrypt(password);
  return { id, title, url, username, password: descrypt, userId };
}

async function createCredential(userId: number, credential: createCredentialParams) {
  const existingCredential = await credentialRepository.findCredentialByTitle(userId, credential.title);
  if(existingCredential ) throw conflictError("Title already in use");
  
  const existingCredentialUrl: Credential[] = await credentialRepository.findCredentialByUrl(userId, credential.url);
  if(existingCredentialUrl.length >= 2) throw conflictError("it is possible to register only two credentials for the same site.");
 
  const credencialPassword = encrypt(credential.password);
  const credentialInfos = { ...credential, password: credencialPassword };
 
  const result = await credentialRepository.insertCredential(userId, credentialInfos);
  return result;
}

async function deleteCredential(userId: number, credentialId: number) {
  const find = await findCredential(userId, credentialId);
 
  return await credentialRepository.deleteCredential(find.id);
}

const credentialService = {
  findCredential,
  findAllCredentials,
  createCredential,
  deleteCredential
};

export default credentialService;
