import { notFound } from "next/navigation";
import SwaggerDocs from "@/components/SwaggerDocs";

export const metadata = { title: "ACE Results API Docs" };

export default function ApiDocsPage() {
  // Hidden in production unless explicitly enabled.
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_API_DOCS !== "true") {
    notFound();
  }
  return <SwaggerDocs />;
}