import app, { init } from "@/app";
import { prisma } from "@/config";
import { conflictError } from "@/errors";
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories/userFactory";
import { cleanDb } from "../helpers";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("POST /users", () => {
  it("should respond with status 400 when body is not given", async () => {
    const response = await server.post("/users");

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when body is not valid", async () => {
    const invalidBody = { [faker.lorem.word()]: faker.lorem.word() };

    const response = await server.post("/users").send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should respond with status 400 when one of the body parameters is not valid", async () => {
    const body = { email: faker.internet.email() } || { password: faker.internet.password(10) };
    const invalidBody = body;

    const response = await server.post("/users").send(invalidBody);

    expect(response.status).toBe(httpStatus.BAD_REQUEST);
  });
  describe("when body is valid", () => {
    const generateValidBody = () => ({
      email: faker.internet.email(),
      password: faker.internet.password(10),
    });
   
    it("should respond with status 409 when there is an user with given email", async () => {
      const body = generateValidBody();
      await createUser(body);

      const response = await server.post("/users").send(body);

      expect(response.status).toBe(httpStatus.CONFLICT);
      expect(response.body).toEqual(conflictError("There is already an user with given email"));
    });

    it("should respond with status 201 and create user when given email is unique", async () => {
      const body = generateValidBody();

      const response = await server.post("/users").send(body);

      expect(response.status).toBe(httpStatus.CREATED);
      expect(response.body).toEqual({
        id: expect.any(Number),
        email: body.email,
      });
    });

    it("should not return user password on body", async () => {
      const body = generateValidBody();

      const response = await server.post("/users").send(body);

      expect(response.body).not.toHaveProperty("password");
    });

    it("should save user on db", async () => {
      const body = generateValidBody();

      const response = await server.post("/users").send(body);

      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });
      expect(user).toEqual(
        expect.objectContaining({
          id: response.body.id,
          email: body.email,
        }),
      );
    });
  });
});
