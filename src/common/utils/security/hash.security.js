import bcrypt from "bcrypt";
import argon2 from "argon2";
import { SALT_ROUND } from "../../../../config/config.service.js";
import { HashApproachEnum } from "../../enums/security.enum.js";

export const generateHash = async ({
  plainText,
  salt = SALT_ROUND,
  approach = HashApproachEnum.bcrypt,
} = {}) => {
  let hashValue;

  switch (approach) {
    case HashApproachEnum.argon2:
      hashValue = await argon2.hash(plainText);
      break;

    case HashApproachEnum.bcrypt:
    default:
      hashValue = await bcrypt.hash(plainText, salt);
      break;
  }

  return hashValue;
};

export const compareHash = async ({
  plainText,
  cipherText,
  approach = HashApproachEnum.bcrypt,
} = {}) => {
  let match = false;

  switch (approach) {
    case HashApproachEnum.argon2:
      match = await argon2.verify(cipherText, plainText);
      break;

    case HashApproachEnum.bcrypt:
    default:
      match = await bcrypt.compare(plainText, cipherText);
      break;
  }

  return match;
};
