import { credentialSchema } from "@/schemas";
import { faker } from "@faker-js/faker";

describe("credentialSchema", () => {
  const generateValidInput = () => ({
    title: faker.internet.domainWord(),
    url: faker.internet.url(),
    username: faker.internet.email(),
    password: faker.internet.password()
  });
  describe("when title is not valid", () => {
    it("should return error if title is not present", () => {
      const input = generateValidInput();
      delete input.title;

      const { error } = credentialSchema.validate(input);

      expect(error).toBeDefined();
    });
  });
  describe("when url is not valid", () => {
    it("should return error if url is not present", () => {
      const input = generateValidInput();
      delete input.url;

      const { error } = credentialSchema.validate(input);
      
      expect(error).toBeDefined();
    });

    it("should return error if url does not follow valid url format", () => {
      const input = generateValidInput();
      input.url = faker.lorem.word();

      const { error } = credentialSchema.validate(input);

      expect(error).toBeDefined();
    });
  });
  describe("when username not valid", () => {
    it("should return error if username is not present", () => {
      const input = generateValidInput();
      delete input.username;
      const { error } = credentialSchema.validate(input);
      expect(error).toBeDefined();
    });
  });
  describe("when password is not valid", () => {
    it("should return error if password is not present", () => {
      const input = generateValidInput();
      delete input.password;

      const { error } = credentialSchema.validate(input);

      expect(error).toBeDefined();
    });
  });
  it("should return no error if input is valid", () => {
    const input = generateValidInput();

    const { error } = credentialSchema.validate(input);

    expect(error).toBeUndefined();
  });
});
