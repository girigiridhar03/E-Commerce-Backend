import { signupService, verifyEmailService } from "../services/user.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const signup = asyncHandler(async (req, res) => {
  const { status, message } = await signupService(req);

  response(res, status, message);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { status, message } = await verifyEmailService(req);
  response(res, status, message);
});
