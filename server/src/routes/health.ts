import { Router } from "express";
import { z } from "zod";

const healthResponseSchema = z.object({
  status: z.literal("ok"),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  const payload: HealthResponse = healthResponseSchema.parse({ status: "ok" });
  res.json(payload);
});
