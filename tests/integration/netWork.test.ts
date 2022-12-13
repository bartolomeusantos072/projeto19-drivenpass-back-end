import app, { init } from "@/app";
import * as jwt from "jsonwebtoken"; 
import { faker } from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { createUser } from "../factories/userFactory";
import { cleanDb, generateValidToken } from "../helpers";
import { prisma } from "@/config";
import { encrypt } from "@/utils/cryptrUtils";
import { User } from "@prisma/client";

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe("POST netWork", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/network");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.post("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.post("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 400 when body is not present", async () => {
      const token = await generateValidToken();

      const response = await server.post("/network").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });

    it("should respond with status 400 when body is not valid", async () => {
      const token = await generateValidToken();
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post("/network").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  } );
  describe("when body is valid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: faker.internet.password()
    });
    
    it("should respond with status 201 and create new network if there is not any", async () => {
      const user = await  createUser();
      const token = await generateValidToken(user);
      const body = generateValidBody();

      const response = await server.post("/network").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.CREATED);
      const network = await prisma.netWork.findFirst({ where: { title: body.title } });
      expect(network).toBeDefined();
    });
    it("should respond with status 409 when create new network with conflit title", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const wifi = generateValidBody();
      const insertNetWork = await prisma.netWork.create({
        data: { ...wifi, userId: user.id }
      });
      const { title, netWork, password } = wifi;
    
      await prisma.netWork.findFirst( { where: { userId: user.id, title } } );

      const response = await server.post("/network").set("Authorization", `Bearer ${token}`).send( { title: insertNetWork.title, netWork, password });
  
      expect(response.status).toBe(httpStatus.CONFLICT);
    });
  });
  describe("when body is invalid", () => {
    const generateInvalidBody = () => ({
      title: faker.internet.domainWord(),
      netWork: "",
      password: faker.internet.password()
    });

    it("should respond with status 400 and create new network if there is not any", async () => {
      const body = generateInvalidBody();
      const token = await generateValidToken();

      const response = await server.post("/network").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});

describe("DELETE wifi/id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.delete("/network");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.delete("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.delete("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when params is invalid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: faker.internet.password()
    });

    it("should respond with status 204 when netWorkId no exists", async () => {
      const token = await generateValidToken();
      const netWorkId = 0;
      const response = await server.delete(`/network/${netWorkId}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NO_CONTENT);
    });
    it("should respond with status 500 when not informing the netWorkId parameter", async () => {
      const token = await generateValidToken();
      const response = await server.delete("/network").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.INTERNAL_SERVER_ERROR);
    });
    it("should respond with status 404 when netWorkId does not belong to the user", async () => {
      const user2 = await createUser();
      const token2 = await generateValidToken(user2);
      const netWork = generateValidBody();
      const insertNetWork = await prisma.netWork.create({
        data: { ...netWork, userId: user2.id }
      });
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.delete(`/network/${insertNetWork.id}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  describe("when params is valid", () => {
    const generateNetWork = () => ({
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: encrypt(faker.internet.password())
    });
    it("should respond with status 301 when netWorkId exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const data = generateNetWork();

      const netWork =  await prisma.netWork.create({
        data: { ...data, userId: user.id }
      });
      const response = await server.delete(`/network/${netWork.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.MOVED_PERMANENTLY);
    });
  });
});

describe("GET netWork/:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/network");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when params is invalid", () => {
    const generateValidBody = () => ({
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: faker.internet.password()
    });

    it("should respond with status 204 when netWorkId no exists", async () => {
      const token = await generateValidToken();
      const netWorkId = 0;
      const response = await server.get(`/network/${netWorkId}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 when netWorkId does not belong to the user", async () => {
      const user2 = await createUser();
      const token2 = await generateValidToken(user2);
      const netWork = generateValidBody();
      const insertNetWork = await prisma.netWork.create({
        data: { ...netWork, userId: user2.id }
      });
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get(`/network/${insertNetWork.id}`).set("Authorization", `Bearer ${token}`);
      
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
  });
  
  describe("when params is valid", () => {
    const generateNetWork = () => ({
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: encrypt(faker.internet.password())
    });
    it("should respond with status 200 when netWorkId exists", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const data = generateNetWork();

      const netWork =  await prisma.netWork.create({
        data: { ...data, userId: user.id }
      });
      const response = await server.get(`/network/${netWork.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
    });
  });
});

describe("GET netWork", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/network");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 200 when userId exists", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const data = {
      title: faker.internet.domainWord(),
      netWork: faker.internet.userName(),
      password: encrypt(faker.internet.password())
    };

    await prisma.netWork.create({
      data: { ...data, userId: user.id }
    });
    
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.OK);
  });
  it("should respond with status 404 when userId exists but not correct token", async () => {
    const user: User = {
      id: 0,
      email: faker.internet.email(),
      password: faker.internet.password(10)
    };
    const token = await generateValidToken(user);
    const response = await server.get("/network").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });
});
