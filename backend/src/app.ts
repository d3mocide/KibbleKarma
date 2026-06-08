import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import { config } from "./config";
import { logger } from "./logger";
import { errorHandler, notFoundHandler } from "./middleware/error";

import { authRouter } from "./routes/auth";
import { petsRouter } from "./routes/pets";
import { foodsRouter } from "./routes/foods";
import {
  petFoodsNestedRouter,
  petFoodProfilesRouter,
} from "./routes/petFoodProfiles";
import { mealsNestedRouter, mealsRouter } from "./routes/meals";
import { weightsNestedRouter, weightsRouter } from "./routes/weights";
import { eventsNestedRouter, eventsRouter } from "./routes/events";
import { exportsNestedRouter } from "./routes/exports";

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") }));
  app.use(express.json({ limit: "1mb" }));

  // Correlation id + lightweight request logging.
  app.use((req, res, next) => {
    const correlationId = (req.headers["x-correlation-id"] as string) || randomUUID();
    req.correlationId = correlationId;
    res.setHeader("x-correlation-id", correlationId);
    const start = Date.now();
    res.on("finish", () => {
      logger.info("request", {
        correlationId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        ms: Date.now() - start,
      });
    });
    next();
  });

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use("/api/auth", authRouter);

  // Nested pet sub-resources mounted onto the pets router.
  petsRouter.use("/:petId/foods", petFoodsNestedRouter);
  petsRouter.use("/:petId", mealsNestedRouter);
  petsRouter.use("/:petId", weightsNestedRouter);
  petsRouter.use("/:petId", eventsNestedRouter);
  petsRouter.use("/:petId", exportsNestedRouter);
  app.use("/api/pets", petsRouter);

  app.use("/api/foods", foodsRouter);
  app.use("/api/pet-food-profiles", petFoodProfilesRouter);
  app.use("/api/meals", mealsRouter);
  app.use("/api/weights", weightsRouter);
  app.use("/api/events", eventsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
