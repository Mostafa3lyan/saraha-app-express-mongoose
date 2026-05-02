import Joi from "joi";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/utils/index.js";

export const shareProfile = {
  params: Joi.object().keys({
    userId: generalValidationFields.id.required()
  }).required()
}