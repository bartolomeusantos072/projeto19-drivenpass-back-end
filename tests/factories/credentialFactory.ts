import { faker } from "@faker-js/faker";
import { createCredentialParams } from "@/schemas";
import { prisma } from "@/config";

async function createCredential( userId: number) {
  const credential: createCredentialParams = {
    title: faker.internet.domainWord(),
    url: faker.internet.url(),
    username: faker.internet.email(),
    password: faker.internet.password()
  };
  const savedCredential = await prisma.credential.create({
    data: { ...credential, userId }
  });

  return savedCredential;
}

const credentialFactory = {
  createCredential,
};

export default credentialFactory;
