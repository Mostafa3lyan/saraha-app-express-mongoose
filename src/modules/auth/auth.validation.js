import Joi from "joi";
import { generalValidationFields } from './../../common/utils/index.js';


export const loginSchema = {
  body: Joi.object()
    .keys({
      email: generalValidationFields.email,
      password: generalValidationFields.password,
    })
    .required(),
};

export const signupSchema = {
  body: loginSchema.body
    .append({
      fullName: generalValidationFields.fullName.required(),
      phone: generalValidationFields.phone.required(),
      confirmPassword: generalValidationFields.confirmPassword()
        .required()
        .messages({ "any.only": "Confirm password does not match" }),
    })
    .required(),

  query: Joi.object()
    .keys({
      lang: Joi.string().valid("ar", "en").required(),
    })
    .required(),
};
