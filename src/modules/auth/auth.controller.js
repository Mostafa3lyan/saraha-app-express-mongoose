import { Router } from "express";
import { signup } from "./auth.service.js";
import { successResponse } from "./../../common/utils/response/success.response.js";
const router = Router();
router.post("/signup", async (req, res, next) => {
  const user = await signup(req.body);
  return successResponse({
    message: "signed up successfully",
      status: 201,
    res,
    data: {user},
  });
});

export default router;
