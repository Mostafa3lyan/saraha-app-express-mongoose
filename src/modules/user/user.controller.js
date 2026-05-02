import { Router } from "express";
import { profile, rotateToken, shareProfile } from "./user.service.js";
import { successResponse } from "./../../common/utils/response/index.js";
import { authentication, authorization } from "../../middleware/index.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { RoleEnum } from "../../common/enums/user.enum.js";
import * as validators from "./user.validation.js"
import { validation } from "../../middleware/validation.middleware.js";
const router = Router();

// User Profile
router.get(
  "/",
  authentication(),
  // authorization([RoleEnum.User, RoleEnum.Admin]),
  async (req, res, next) => {
    const user = await profile(req.user);
    return successResponse({
      res,
      data: { user },
    });
  },
);

router.get(
  "/:userId/share-profile",
  validation(validators.shareProfile),
  async (req, res, next) => {
    const account = await shareProfile(req.params.userId);
    return successResponse({
      res,
      data: { account },
    });
  },
);

// Rotate Token
router.get(
  "/rotate-token",
  authentication(TokenTypeEnum.refresh),
  async (req, res, next) => {
    const credentials = await rotateToken(
      req.user,
      `${req.protocol}://${req.host}`,
    );
    return successResponse({
      res,
      data: { credentials },
    });
  },
);

export default router;
