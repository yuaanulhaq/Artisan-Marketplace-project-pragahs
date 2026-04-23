import dotenv from "dotenv";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, "../..");
const dataDir = resolve(packageRoot, "data");
const uploadsDir = resolve(packageRoot, "uploads");

mkdirSync(dataDir, { recursive: true });
mkdirSync(uploadsDir, { recursive: true });

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtSecret: process.env.JWT_SECRET || "change-this-in-production",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: process.env.STRIPE_CURRENCY || "inr",
  databasePath: process.env.DATABASE_PATH || resolve(dataDir, "marketplace.db"),
  uploadsDir
};

