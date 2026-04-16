import { HashApproachEnum } from "../../common/enums/security.enum.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import {
  compareHash,
  createLoginCredentials,
  generateEncryption,
  generateHash,
} from "../../common/utils/security/index.js";

import { createOne, findOne, UserModel } from "../../DB/index.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from "./../../common/utils/response/error.response.js";
import { OAuth2Client } from "google-auth-library";

// signup
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

// login
export const login = async (inputs, issuer) => {
  const { email, password } = inputs;

  const user = await findOne({
    model: UserModel,
    filter: { email, provider: ProviderEnum.System },
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

  return createLoginCredentials(user, issuer);
};

// verify google token
const verifyGoogleToken = async (idToken) => {
  const client = new OAuth2Client();
  const WEB_CLIENT_ID =
    "316381827166-m19cnn4mpl7ln562ubvbiq2cvocjkuni.apps.googleusercontent.com";
  const ticket = await client.verifyIdToken({
    idToken,
    audience: WEB_CLIENT_ID, // Specify the WEB_CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  if (!payload?.email_verified) {
    throw BadRequestException({ message: "fail to verify by google" });
  }

  return payload;
};

// signup with gmail
export const signupWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleToken(idToken);
  console.log(payload);

  const checkExist = await findOne({
    model: UserModel,
    filter: { email: payload.email },
  });
  if (checkExist) {
    if (checkExist.provider !== ProviderEnum.Google) {
      throw ConflictException({ message: "invalid provider" });
    }
    return {
      message: "logged in successfully",
      status: 200,
      credentials: await loginWithGmail(idToken, issuer),
    };
  }

  const user = await createOne({
    model: UserModel,
    data: {
      firstName: payload.given_name,
      lastName: payload.family_name,
      email: payload.email,
      confirmEmail: new Date(),
      provider: ProviderEnum.Google,
      profilePicture: payload.picture,
    },
  });

  return {
    message: "signed up successfully",
    status: 201,
    credentials: await createLoginCredentials(user, issuer),
  };
};

// login with gmail
export const loginWithGmail = async (idToken, issuer) => {
  const payload = await verifyGoogleToken(idToken);
  const user = await findOne({
    model: UserModel,
    filter: { email: payload.email, provider: ProviderEnum.Google },
  });
  if (!user) {
    throw NotFoundException({ message: "Not registered account" });
  }
  return createLoginCredentials(user, issuer);
};


// {
//   iss: 'https://accounts.google.com',
//   azp: '316381827166-m19cnn4mpl7ln562ubvbiq2cvocjkuni.apps.googleusercontent.com',
//   aud: '316381827166-m19cnn4mpl7ln562ubvbiq2cvocjkuni.apps.googleusercontent.com',
//   sub: '110433618588318955903',
//   email: 'mostafaelyan99@gmail.com',
//   email_verified: true,
//   nbf: 1776298361,
//   name: 'Mostafa Elyan',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocKf22ngO6CU6f2icKXOYsHvVabX06nIAsm6VKvrT7omTpGTsrUa=s96-c',
//   given_name: 'Mostafa',
//   family_name: 'Elyan',
//   iat: 1776298661,
//   exp: 1776302261,
//   jti: '411a954e9231c288889b236b226c121409bb5275'
// }
