import { model } from "mongoose";
import {
  createOne,
  find,
  findOne,
  findOneAndDelete,
} from "../../DB/db.repository.js";
import { UserModel } from "../../DB/index.js";
import { NotFoundException } from "../../common/utils/response/error.response.js";
import { MessageModel } from "./../../DB/models/message.model.js";

// send message
export const sendMessage = async (
  receiverId,
  { content = undefined } = {},
  files = [],
  sender,
) => {
  const account = await findOne({
    model: UserModel,
    filter: { _id: receiverId, confirmEmail: { $exists: true } },
  });

  if (!account) {
    throw NotFoundException({ message: "failed to find receiver account" });
  }

  const message = await createOne({
    model: MessageModel,
    data: {
      content,
      attachments: files.map((file) => file.finalPath),
      receiverId,
      senderId: sender?._id ?? undefined,
    },
  });

  return message;
};

// get message
export const getMessage = async (messageId, user) => {
  const message = await findOne({
    model: MessageModel,
    filter: {
      _id: messageId,
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    },
    select: "-senderId",
  });

  if (!message) {
    throw NotFoundException({
      message: "invalid message or un authorized action",
    });
  }

  return message;
};

// get message
export const getAllMessages = async (user) => {
  const message = await find({
    model: MessageModel,
    filter: {
      $or: [{ senderId: user._id }, { receiverId: user._id }],
    },
    select: "-senderId",
  });

  return message;
};

// get message
export const deleteMessage = async (messageId, user) => {
  const message = await findOneAndDelete({
    model: MessageModel,
    filter: {
      _id: messageId,
      receiverId: user._id,
    },
    select: "-senderId",
  });

  if (!message) {
    throw NotFoundException({
      message: "invalid message or un authorized action",
    });
  }

  return message;
};
