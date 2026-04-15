import { HashApproachEnum } from "../../common/enums/security.enum.js";
import { compareHash, createLoginCredentials, generateEncryption, generateHash } from "../../common/utils/security/index.js";

import { createOne, findOne, UserModel } from "../../DB/index.js";
import {
  ConflictException,
  UnauthorizedException,
} from "./../../common/utils/response/error.response.js";

export const signup = async (inputs) => {
  const { fullName, email, password, phone } = inputs;
  const emailExist = await findOne({
    model: UserModel,
    filter: { email },
  });

  if (emailExist) {
    throw ConflictException({ message: "Email already exist" });
  }

  const user = await createOne({
    model: UserModel,
    data: {
      fullName,
      email,
      password: await generateHash({ plainText: password }),
      phone: await generateEncryption({ plainText: phone }),
    },
  });
  return user;
};

export const login = async (inputs, issuer) => {
  const { email, password } = inputs;

  const user = await findOne({
    model: UserModel,
    filter: { email },
  });
  if (!user) {
    throw UnauthorizedException({ message: "Email or Password is incorrect" });
  }

  const match = await compareHash({
    plainText: password,
    cipherText: user.password,
    approach: HashApproachEnum.bcrypt,
  });

  if (!match) {
    throw UnauthorizedException({ message: "Email or Password is incorrect" });
  }

return createLoginCredentials(user, issuer)
};
