import {
  getUserRoleDistributionService,
  getSignUpTrendsService,
  getUserStatsService,
  loginService,
  signupService,
  verifyEmailService,
  getNewUsersService,
  singleUserDetailsService,
} from "../services/user.service.js";
import { asyncHandler } from "../utils/handlers.js";
import { response } from "../utils/response.js";

///// Auth /////
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

///// Analytics Dashboard /////
// Cards
export const getUserStats = asyncHandler(async (_, res) => {
  const { status, message, userStats } = await getUserStatsService();
  response(res, status, message, userStats);
});

// Line Chart
export const getSignUpTrends = asyncHandler(async (req, res) => {
  const { status, message, trends } = await getSignUpTrendsService(req);

  response(res, status, message, trends);
});

// Pie Chart
export const getUserRoleDistribution = asyncHandler(async (_, res) => {
  const { status, message, roleCount } = await getUserRoleDistributionService();

  return response(res, status, message, roleCount);
});

// Line Chart
export const getNewUsers = asyncHandler(async (_, res) => {
  const { status, message, latestUsers } = await getNewUsersService();
  return response(res, status, message, latestUsers);
});

///// Dynamic Controllers /////
export const singleUserDetails = asyncHandler(async (req, res) => {
  const { status, message, details } = await singleUserDetailsService(req);
  response(res, status, message, details);
});
