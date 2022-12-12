import app, { init } from "@/app";
import * as jwt from "jsonwebtoken"; 
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories/userFactory";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("POST credential", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/credentials");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not present", async () => {
      const token = await generateValidToken();

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  } );
  describe("when body is valid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: faker.internet.password()
    });
    
    it("should respond with status 201 and create new credentials if there is not any", async () => {
      const body = generateValidBody();
      const token = await generateValidToken();

      const response = await server.post("/credentialss").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.OK);
      const credentials = await prisma.credential.findFirst({ where: { title: body.title } });
      expect(credentials).toBeDefined();
    });
  });
  describe("when body is invalid", () => {
    const generateInvalidBody = () => ({
      title: faker.internet.domainWord(),
      url: faker.lorem.word(),
      username: faker.internet.email(),
      password: faker.internet.password()
    });

    it("should respond with status 400 and create new credentials if there is not any", async () => {
      const body = generateInvalidBody();
      const token = await generateValidToken();

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});