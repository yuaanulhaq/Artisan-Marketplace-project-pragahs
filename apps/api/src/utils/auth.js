import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const hashPassword = (value) => bcrypt.hash(value, 10);
export const comparePassword = (value, hash) => bcrypt.compare(value, hash);

export const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role
    },
    env.jwtSecret,
    {
      expiresIn: "7d"
    }
  );

