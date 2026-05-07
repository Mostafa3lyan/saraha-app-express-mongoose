import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from "../../../config/config.service.js";
import { LogoutEnum, TokenTypeEnum } from "../../common/enums/security.enum.js";
import {
  ConflictException,
  generateDecryption,
  NotFoundException,
} from "../../common/utils/index.js";
import {
  createLoginCredentials,
  decodeToken,
} from "../../common/utils/security/token.security.js";
import { createOne, deleteMany, findOne } from "../../DB/db.repository.js";
import { UserModel } from "../../DB/index.js";
import TokenModel from "../../DB/models/token.model.js";

export const profile = async (user) => {
  return user;
};

export const logout = async ({ flag }, user, { jti, iat }) => {
  let status = 200;
  switch (flag) {
    case LogoutEnum.all:
      user.changeCredentialsTime = new Date();
      await user.save();
        await deleteMany({ model: TokenModel, filter: { userId: user._id } });
      break;

    default:
      await createOne({
        model: TokenModel,
        data: {
          userId: user._id,
          jti,
          expiresIn: new Date((iat + REFRESH_TOKEN_EXPIRES_IN) * 1000),
        },
      });
      status = 201;
      break;
  }

  return status;
};

export const shareProfile = async (userId) => {
  const account = await findOne({
    model: UserModel,
    filter: { _id: userId },
    select: "-password",
  });

  if (!account) {
    throw NotFoundException({ message: "profile not found" });
  }

  if (account.phone) {
    account.phone = await generateDecryption(account.phone);
  }

  return account;
};

export const rotateToken = async (user, { jti, iat }, issuer) => {

  if ((iat + ACCESS_TOKEN_EXPIRES_IN) * 1000 > Date.now() + (30000)) {
    throw ConflictException({ message: " Current Access token still valid" });
  }

        await createOne({
          model: TokenModel,
          data: {
            userId: user._id,
            jti,
            expiresIn: new Date((iat + REFRESH_TOKEN_EXPIRES_IN) * 1000),
          },
        });
  
  return createLoginCredentials(user, issuer);
};

export const profileImage = async (file, user) => {
  user.profilePicture = file.finalPath;
  await user.save();
  return user;
};

export const profileCoverImage = async (files, user) => {
  user.profileCoverPictures = files.map((file) => file.finalPath);
  await user.save();
  return user;
};
