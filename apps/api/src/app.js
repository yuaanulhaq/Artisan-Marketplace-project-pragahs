import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import "./db/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import paymentRouter from "./modules/payments/payments.routes.js";
import apiRouter from "./routes/index.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use("/api/payments", express.raw({ type: "application/json" }), paymentRouter);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(env.uploadsDir));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "artisan-marketplace-api"
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
