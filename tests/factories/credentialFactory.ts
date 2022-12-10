import { faker } from "@faker-js/faker";
import { createCredentialParams } from "@/schemas";
import { prisma } from "@/config";

function createCredentialInfo() {
  return {
    title: faker.internet.domainWord(),
    url: faker.internet.url(),
    username: faker.internet.email(),
    password: faker.internet.password()
  };
}

async function createCredential(credentialInfo: createCredentialParams, userId: number) {
  const savedCredential = await prisma.credential.create({
    data: { ...credentialInfo, userId }
  });

  return savedCredential;
}

const credentialFactory = {
  createCredential,
  createCredentialInfo
};

export default credentialFactory;
