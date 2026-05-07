import Joi from "joi";
import { Types } from "mongoose";
import { generalValidationFields } from "../../common/utils/index.js";
import { fileFieldValidation } from "../../common/utils/multer/validation.multer.js";

export const shareProfile = {
  params: Joi.object()
    .keys({
      userId: generalValidationFields.id.required(),
    })
    .required(),
};

export const profileImage = {
  file: generalValidationFields.file(fileFieldValidation.image).required(),
};

export const profileCoverImage = {
  files: Joi.array()
    .items(generalValidationFields.file(fileFieldValidation.image).required())
    .min(1)
    .max(5)
    .required(),
};

export const profileAttachments = {
  files: Joi.object()
    .keys({
      firstAttachment: Joi.array()
        .items(
          generalValidationFields.file(fileFieldValidation.image).required(),
        )
        .length(1)
        .required(),
      secondAttachment: Joi.array()
        .items(
          generalValidationFields.file(fileFieldValidation.image).required(),
        )
        .min(1)
        .max(5)
        .required(),
    })
    .required(),
};
