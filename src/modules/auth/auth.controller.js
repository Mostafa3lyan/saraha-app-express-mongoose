import { Router } from "express";
import { login, signup } from "./auth.service.js";
import { successResponse } from "./../../common/utils/response/success.response.js";
const router = Router();

// signup
router.post("/signup", async (req, res, next) => {
  const user = await signup(req.body);
  return successResponse({
    message: "signed up successfully",
      status: 201,
    res,
    data: {user},
  });
});

// login
router.post("/login", async (req, res, next) => {
  const credentials = await login(req.body, `${req.protocol}://${req.host}`);
  return successResponse({
    message: "logged in successfully",
    res,
    data: { credentials },
  });
});

export default router;
