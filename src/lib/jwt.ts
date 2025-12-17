// jwt.ts
// TODO: JWT sign / verify helpers
//Handels the creation and verification of JWT tokens. Think of a JWT as a

import jwt from "jsonwebtoken";

//Define the shape of our jwt payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-prod";

//Create a JWT token
export const createToken = (payload: JwtPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1d",
  });
};

//Verify a JWT token
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};
