// src/app/api/openapi/route.js
// Serves docs/api/openapi.yaml so Swagger UI can load it.
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_API_DOCS !== "true") {
    return new Response("Not found", { status: 404 });
  }

  const file = path.join(process.cwd(), "docs", "api", "openapi.yaml");
  const yaml = await fs.readFile(file, "utf8");

  return new Response(yaml, {
    headers: { "Content-Type": "application/yaml; charset=utf-8" },
  });
}