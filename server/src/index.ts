import express from "express";
import { env, validateEnv } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";
import { recipesRouter } from "./routes/recipes.js";

validateEnv();

const app = express();

app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", recipesRouter);

app.use("/api", notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Mood-to-Menu server listening on http://localhost:${env.port}`);
});
