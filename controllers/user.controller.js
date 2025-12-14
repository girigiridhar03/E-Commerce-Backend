import {
  loginService,
  signupService,
  verifyEmailService,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

export const signup = asyncHandler(async (req, res) => {
  const { status, message, user } = await signupService(req);

  response(res, status, message, user);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { status, message } = await verifyEmailService(req);
  response(res, status, message);
});

export const login = asyncHandler(async (req, res) => {
  const { status, message, token } = await loginService(req);
  response(res, status, message, token);
});
