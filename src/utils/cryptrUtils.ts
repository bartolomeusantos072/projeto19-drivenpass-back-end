import Cryptr from "cryptr";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const cryptr = new Cryptr(process.env.CRYPTR_SECRET);

export function encrypt(value: string) {
  return cryptr.encrypt(value);
}

export function decrypt(encryptedValue: string) {
  return cryptr.decrypt(encryptedValue);
}
