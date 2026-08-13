import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { asyncHandler } from "./middleware/asyncHandler";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import usersRouter from "./modules/users/users.routes";
import tasksRouter from "./modules/tasks/tasks.routes";
import dashboardRouter from "./modules/dashboard/dashboard.routes";
import externalRouter from "./modules/external/external.routes";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.status(200).json({ data: { status: "ok" } });
  })
);

app.use("/api/users", usersRouter);
// The comments sub-router (GET/POST /api/tasks/:id/comments) is mounted
// inside tasks.routes.ts so it can share the :id param via mergeParams.
app.use("/api/tasks", tasksRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/external", externalRouter);

// Catch-all for unmatched routes. Must come after all real routers.
app.use(notFound);

// Global error handler. Must be registered last.
app.use(errorHandler);

export default app;
