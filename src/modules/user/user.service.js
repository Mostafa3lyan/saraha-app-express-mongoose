import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { generateDecryption, NotFoundException } from "../../common/utils/index.js";
import {
  createLoginCredentials,
  decodeToken,
} from "../../common/utils/security/token.security.js";
import { findOne } from "../../DB/db.repository.js";
import { UserModel } from "../../DB/index.js";

export const profile = async (user) => {
  return user;
};

export const shareProfile = async (userId) => {
  const account = await findOne({ model: UserModel, filter: { _id: userId }, select: "-password", });

  if (!account) {
    throw NotFoundException({ message: "profile not found" });
  }

  if (account.phone) {
    account.phone = await generateDecryption(account.phone)
  }

  return account;

};

export const rotateToken = async (user, issuer) => {
  return createLoginCredentials(user, issuer);
};
