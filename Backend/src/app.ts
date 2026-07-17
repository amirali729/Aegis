// app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/routes/auth.router.js";
import userRouter from "./routes/user.router.js";

export function createApp() {
  const app = express();

  if (!process.env.CORS_ORIGIN) {
    throw new Error("CORS_ORIGIN missing in .env");
  }

  app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }));

  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  app.use(express.static("public"));
  app.use(cookieParser());

  app.use("/api/v1", authRouter);
  app.use("/api/v1",userRouter)
  

  return app;
}
