import { TokenTypeEnum } from "../common/enums/security.enum.js";
import {
  UnauthorizedException,
  ForbiddenException,
} from "../common/utils/response/error.response.js";
import { decodeToken } from "../common/utils/security/token.security.js";

export const authentication = (tokenType = TokenTypeEnum.access) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        throw UnauthorizedException({
          message: "missing authentication key or Invalid token format",
        });
      }

      const token = authHeader.split(" ")[1];
      req.token = token;

      const {user, decoded} = await decodeToken({
        token,
        tokenType,
      });

      req.user = user;
      req.decoded = decoded;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};


export const authorization = (accessRole = []) => {
  return async (req, res, next) => {
    try {
      if (!accessRole.includes(req.user.role)) {
        throw ForbiddenException({
          message: "Not authorized account",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
