import { faker } from "@faker-js/faker";

import { prisma } from "@/config";

import { createNetWorkParams } from "@/schemas";

function createNetWorkInfo() {
  return {
    title: faker.internet.domainWord(),
    url: faker.internet.url(),
    username: faker.internet.email(),
    password: faker.internet.password()
  };
}

async function createNetWork(netWorkInfo: createNetWorkParams, userId: number) {
  const savedNetWork = await prisma.netWork.create({
    data: { ...netWorkInfo, userId }
  });

  return savedNetWork;
}

const netWorkFactory = {
  createNetWork,
  createNetWorkInfo
};

export default netWorkFactory;
