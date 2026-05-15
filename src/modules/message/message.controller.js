import { Router } from "express";
import {
  BadRequestException,
  successResponse,
} from "./../../common/utils/response/index.js";
import {
  deleteMessage,
  getAllMessages,
  getMessage,
  sendMessage,
} from "./message.service.js";
import {
  decodeToken,
  fileFieldValidation,
  localFileUpload,
} from "../../common/utils/index.js";
import { validation } from "../../middleware/validation.middleware.js";
import * as validators from "./message.validation.js";
import { TokenTypeEnum } from "../../common/enums/security.enum.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import strict from "node:assert/strict";

const router = Router({ caseSensitive: true, strict: true });

// send message
router.post(
  "/:receiverId",
  async (req, res, next) => {
    if (req.headers.authorization) {
      const { user, decoded } = await decodeToken({
        token: req.headers.authorization.split(" ")[1],
        tokenType: TokenTypeEnum.access,
      });

      req.user = user;
      req.decoded = decoded;
    }
    next();
  },
  localFileUpload({
    validation: fileFieldValidation.image,
    customPath: "Messages",
    maxSize: 1,
  }).array("attachments", 2),
  validation(validators.sendMessageSchema),
  async (req, res, next) => {
    if (!req.body?.content && !req.files?.length) {
      throw BadRequestException({
        message:
          "At least one of content or attachments is required to send a message",
        extra: {
          key: "body",
          path: ["content"],
          message: "content is required",
        },
      });
    }
    const message = await sendMessage(
      req.params.receiverId,
      req.body,
      req.files,
      req.user,
    );

    return successResponse({ res, status: 201, data: message });
  },
);

// get message
router.get(
  "/:messageId",
  authentication(),
  validation(validators.getMessagesSchema),
  async (req, res, next) => {
    const message = await getMessage(req.params.messageId, req.user);

    return successResponse({ res, data: message });
  },
);

// get all messages
router.get("/", authentication(), async (req, res, next) => {
  const message = await getAllMessages(req.user);

  return successResponse({ res, data: message });
});

// delete message
router.delete(
  "/:messageId",
  authentication(),
  validation(validators.getMessagesSchema),
  async (req, res, next) => {
    const message = await deleteMessage(req.params.messageId, req.user);

    return successResponse({ res, data: message });
  },
);

export default router;
