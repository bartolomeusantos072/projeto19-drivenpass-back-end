import app, { init } from "@/app";
import * as jwt from "jsonwebtoken"; 
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories/userFactory";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";
import { decrypt, encrypt } from "@/utils/cryptrUtils";
import { createSession } from "../factories/sessionsFactory";
import { User } from "@prisma/client";

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
      password: faker.internet.password(10)
    });
    
    it("should respond with status 201 and create new credentials if there is not any", async () => {
      const user = await  createUser();
      const token = await generateValidToken(user);
      const body = generateValidBody();

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.CREATED);
      const credentials = await prisma.credential.findFirst({ where: { title: body.title } });
      expect(credentials).toBeDefined();
    });
    it("should respond with status 409 when create new credentials with conflit title", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const credential = generateValidBody();
      const insertCredential = await prisma.credential.create({
        data: { ...credential, userId: user.id }
      });
      const { title, url, username, password } = credential;
    
      await prisma.credential.findFirst( { where: { userId: user.id, title } } );

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`).send( { title: insertCredential.title, url, username, password });
  
      expect(response.status).toBe(httpStatus.CONFLICT);
    });

    it("should respond with status 409 when create new credentials with conflit url Greater 2", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const credential = generateValidBody();

      await prisma.credential.create({
        data: { ...credential, userId: user.id }
      });
      const { title, url, username, password } = credential;
      
      await prisma.credential.create({
        data: { ...credential, url: credential.url, title: faker.lorem.word(), userId: user.id }
      });

      await prisma.credential.findFirst( { where: { userId: user.id, title } } );

      const response = await server.post("/credentials").set("Authorization", `Bearer ${token}`).send( { title: faker.lorem.word(), url: credential.url, username, password });
  
      expect(response.status).toBe(httpStatus.CONFLICT);
    });
  });
  describe("when body is invalid", () => {
    const generateInvalidBody = () => ({
      title: faker.internet.domainWord(),
      url: "",
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

describe("DELETE credential/id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.delete("/credentials");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.delete("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.delete("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when params is invalid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: faker.internet.password(10)
    });

    it("should respond with status 204 when credentialId no exists", async () => {
      const token = await generateValidToken();
      const credentialId = 0;
      const response = await server.delete(`/credentials/${credentialId}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NO_CONTENT);
    });
    it("should respond with status 500 when not informing the credentialId parameter", async () => {
      const token = await generateValidToken();
      const response = await server.delete("/credentials").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });
    it("should respond with status 404 when credentialId does not belong to the user", async () => {
      const user2 = await createUser();
      const token2 = await generateValidToken(user2);
      const credential = generateValidBody();
      const insertCredential = await prisma.credential.create({
        data: { ...credential, userId: user2.id }
      });
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.delete(`/credentials/${insertCredential.id}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  describe("when params is valid", () => {
    const generateCredential = () => ({
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: encrypt(faker.internet.password(10))
    });
    it("should respond with status 301 when credentialId exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const data = generateCredential();

      const credential =  await prisma.credential.create({
        data: { ...data, userId: user.id }
      });
      const response = await server.delete(`/credentials/${credential.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.MOVED_PERMANENTLY);
    });
  });
});

describe("GET credentials/:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/credentials");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when params is invalid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: faker.internet.password(10)
    });

    it("should respond with status 204 when credentialId no exists", async () => {
      const token = await generateValidToken();
      const credentialId = 0;
      const response = await server.get(`/credentials/${credentialId}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 when credentialId does not belong to the user", async () => {
      const user2 = await createUser();
      const token2 = await generateValidToken(user2);
      const credential = generateValidBody();
      const insertCredential = await prisma.credential.create({
        data: { ...credential, userId: user2.id }
      });
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get(`/credentials/${insertCredential.id}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  
  describe("when params is valid", () => {
    const generateCredential = () => ({
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: encrypt(faker.internet.password(10))
    });
    it("should respond with status 200 when credentialId exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const data = generateCredential();

      const credential =  await prisma.credential.create({
        data: { ...data, userId: user.id }
      });
      const response = await server.get(`/credentials/${credential.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
    });
  });
});

describe("GET credentials", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/credentials");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 200 when userId exists", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const data = {
      title: faker.internet.domainWord(),
      url: faker.internet.url(),
      username: faker.internet.email(),
      password: encrypt(faker.internet.password(10))
    };

    await prisma.credential.create({
      data: { ...data, userId: user.id }
    });
    await prisma.credential.create({
      data: { ...data, userId: user.id }
    });
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
  });
  it("should respond with status 404 when userId exists but not correct token", async () => {
    const user: User = {
      id: 0,
      email: faker.internet.email(),
      password: faker.internet.password(10)
    };
    const token = await generateValidToken(user);
    const response = await server.get("/credentials").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
});
