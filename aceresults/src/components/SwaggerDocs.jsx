"use client";

import { useEffect } from "react";

const VERSION = "5.17.14";
const CDN = `https://cdn.jsdelivr.net/npm/swagger-ui-dist@${VERSION}`;

export default function SwaggerDocs() {
  useEffect(() => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${CDN}/swagger-ui.css`;
    document.head.appendChild(css);

    const script = document.createElement("script");
    script.src = `${CDN}/swagger-ui-bundle.js`;
    script.onload = () => {
      window.SwaggerUIBundle({
        url: "/api/openapi",
        dom_id: "#swagger-root",
        deepLinking: true,
        persistAuthorization: true,
      });
    };
    document.body.appendChild(script);

    return () => {
      css.remove();
      script.remove();
    };
  }, []);

  // White background wrapper: Swagger UI's default theme is light.
  return <div id="swagger-root" className="min-h-screen bg-white" />;
}