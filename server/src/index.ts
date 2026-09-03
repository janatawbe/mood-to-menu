import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";

const app = express();

app.use(express.json());

app.use("/api", healthRouter);

app.use("/api", notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Mood-to-Menu server listening on http://localhost:${env.port}`);
});
