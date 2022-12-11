import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  let user = await prisma.user.findFirst();
  if(!user) {
    user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        password: await bcrypt.hash("1234567890", 12)
      }
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

