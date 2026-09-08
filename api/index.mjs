import app from "../artifacts/api-server/dist/index.mjs";

export default function handler(req, res) {
  const rawPath = req.query?.__path;
  const prefix = req.query?.__prefix === "iclock" ? "/iclock" : "/api";

  if (rawPath !== undefined) {
    const path = Array.isArray(rawPath)
      ? rawPath.join("/")
      : String(rawPath).replace(/^\/+/, "");
    const requestUrl = new URL(req.url || "/", "http://vercel.local");
    requestUrl.searchParams.delete("__path");
    requestUrl.searchParams.delete("__prefix");
    const query = requestUrl.searchParams.toString();
    req.url = `${prefix}/${path}${query ? `?${query}` : ""}`;
  }

  return app(req, res);
}