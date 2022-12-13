import { netWorkSchema } from "@/schemas";
import { faker } from "@faker-js/faker";

describe("netWorkSchema", () => {
  const generateValidInput = () => ({
    title: faker.internet.domainWord(),
    netWork: faker.internet.email(),
    password: faker.internet.password()
  });
  describe("when title is not valid", () => {
    it("should return error if title is not present", () => {
      const input = generateValidInput();
      delete input.title;

      const { error } = netWorkSchema.validate(input);

      expect(error).toBeDefined();
    });
  });

  describe("when netWork not valid", () => {
    it("should return error if netWork is not present", () => {
      const input = generateValidInput();
      delete input.netWork;
      const { error } = netWorkSchema.validate(input);
      expect(error).toBeDefined();
    });
  });
  describe("when password is not valid", () => {
    it("should return error if password is not present", () => {
      const input = generateValidInput();
      delete input.password;

      const { error } = netWorkSchema.validate(input);

      expect(error).toBeDefined();
    });
  });
  it("should return no error if input is valid", () => {
    const input = generateValidInput();

    const { error } = netWorkSchema.validate(input);

    expect(error).toBeUndefined();
  });
});
