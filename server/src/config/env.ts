import "dotenv/config";

function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? Number(raw) : 3001;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3001;
}

export const env = {
  port: getPort(),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
};
