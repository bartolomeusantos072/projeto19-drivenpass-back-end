import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { CreateUserParams } from "@/schemas";
import { cannotEnrollBeforeStartDateError, conflictError } from "@/errors";
import usersRepository from "@/repositories/usersRepository";

export type ResponseUser = Pick<User, "id"| "email">;

export async function createUser({ email, password }: CreateUserParams): Promise<ResponseUser> {
  await validateUniqueEmailOrFail(email);

  const hashedPassword = await bcrypt.hash(password, 12);
  const result = await usersRepository.create({
    email,
    password: hashedPassword,
  });
  if(!result) throw cannotEnrollBeforeStartDateError();
  return { id: result.id, email: result.email };
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
