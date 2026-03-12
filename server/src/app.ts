import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import { authRouter } from "./routes/auth.js";
import { deckRouter } from "./routes/decks.js";
import { collectionRouter } from "./routes/collection.js";
import { errorHandler } from "./middleware/error.js";

export function createApp(prisma: PrismaClient) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Routes
  app.use("/api/auth", authRouter(prisma));
  app.use("/api/decks", deckRouter(prisma));
  app.use("/api/collection", collectionRouter(prisma));

  // Error handling
  app.use(errorHandler);

  return app;
}
