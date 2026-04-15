import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
  SYSTEM_ACCESS_TOKEN_SECRET_KEY,
  SYSTEM_REFRESH_TOKEN_SECRET_KEY,
} from "../../../../config/config.service.js";
import jwt from "jsonwebtoken";
import { findOne } from "../../../DB/db.repository.js";
import { UserModel } from "../../../DB/index.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../response/error.response.js";
import { TokenTypeEnum } from "../../enums/security.enum.js";
import { RoleEnum } from "../../enums/user.enum.js";

export const generateToken = ({
  payload = {},
  secretKey = ACCESS_TOKEN_SECRET_KEY,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({
  token = {},
  secretKey = ACCESS_TOKEN_SECRET_KEY,
}) => {
  return jwt.verify(token, secretKey);
};

export const detectSignature = (level) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };

  switch (level) {
    case RoleEnum.Admin:
      signatures = {
        accessSignature: SYSTEM_ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: SYSTEM_REFRESH_TOKEN_SECRET_KEY,
      };
      break;

    default:
      signatures = {
        accessSignature: ACCESS_TOKEN_SECRET_KEY,
        refreshSignature: REFRESH_TOKEN_SECRET_KEY,
      };
      break;
  }
  return signatures;
};

export const getSignature = ({
  tokenType = TokenTypeEnum.access,
  level,
}) => {
  const { accessSignature, refreshSignature } = detectSignature(level);
  let signature = undefined;

  switch (tokenType) {
    case TokenTypeEnum.refresh:
      signature = refreshSignature;
      break;
    default:
      signature = accessSignature;
      break;
  }
  return signature;
};

export const decodeToken = async ({
  token,
  tokenType = TokenTypeEnum.access,
}) => {
  const decoded = jwt.decode(token);  

  if (!decoded?.aud?.length) {
    throw BadRequestException({ message: "Missing token audience" });
  }

  const [tokenApproach, level] = decoded.aud || [];
  if (tokenType !== tokenApproach) {
    throw ConflictException({
      message: `invalid token signature we expected ${tokenType} but got ${tokenApproach}`,
    });
  }

  const secretKey = getSignature({ tokenType: tokenApproach, level });

  const verifiedData = verifyToken({
    token,
    secretKey,
  });

  const user = await findOne({
    model: UserModel,
    filter: { _id: verifiedData.sub },
  });

  if (!user) {
    throw NotFoundException({ message: "No registered account" });
  }

  return user;
};

export const createLoginCredentials = (user, issuer) => {
  const payload = { sub: user._id.toString() };
  const { accessSignature, refreshSignature } = detectSignature(
    user.role,
  );

  const access_token = generateToken({
    payload,
    secretKey: accessSignature,
    options: {
      issuer,
      audience: [TokenTypeEnum.access, user.role],
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    },
  });

  const refresh_token = generateToken({
    payload,
    secretKey: refreshSignature,
    options: {
      issuer,
      audience: [TokenTypeEnum.refresh, user.role],
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    },
  });

  return { access_token, refresh_token };
};
