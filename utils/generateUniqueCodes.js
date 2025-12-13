import crypto from "crypto";

export function generateEmailVerification() {
  const token = crypto.randomBytes(20).toString("hex");
  const expires = Date.now() + 15 * 60 * 1000;

  return { token, expires };
}
