import { findOne, UserModel } from "../../DB/index.js";
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
    data: { fullName, email, password, phone },
  });
  return user;
};

export const login = async (inputs) => {
  const { email, password } = inputs;

  const user = await findOne({
    model: UserModel,
      filter: { email, password },
    options : { lean: true },
  });
  if (!user) {
    throw UnauthorizedException({ message: "Email or Password is incorrect" });
  }

  return user;
};
