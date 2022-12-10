import * as jwt from "jsonwebtoken";
import { User } from "@prisma/client";

import { createUser } from "./factories/userFactory";
import { createSession } from "./factories/sessionsFactory";
import { prisma } from "@/config";

export async function cleanDb() {
  await prisma.credential.deleteMany({});
  await prisma.netWork.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
}

export async function generateValidToken(user?: User) {
  const incomingUser = user || (await createUser());
  const token = jwt.sign({ userId: incomingUser.id }, process.env.JWT_SECRET);

  await createSession(token);

  return token;
}
