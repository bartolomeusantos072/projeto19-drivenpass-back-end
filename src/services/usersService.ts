import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserParams } from "@/schemas";
import { conflictError } from "@/errors";
import usersRepository from "@/repositories/usersRepository";

export async function createUser({ email, password }: CreateUserParams): Promise<User> {
  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);
  return usersRepository.create({
    email,
    password: hashedPassword,
  });
}

async function validateUniqueEmailOrFail(email: string) {
  const userWithSameEmail = await usersRepository.findByEmail(email);
  if (userWithSameEmail) {
    throw conflictError( "There is already an user with given email" );
  }
}

const usersService = {
  createUser,
};

export default usersService;
