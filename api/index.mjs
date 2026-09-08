import app from "../artifacts/api-server/dist/index.mjs";

export default function handler(req, res) {
  const requestUrl = new URL(req.url || "/", "http://vercel.local");
  const rawPath =
    req.query?.__path ?? requestUrl.searchParams.get("__path");
  const rawPrefix =
    req.query?.__prefix ?? requestUrl.searchParams.get("__prefix");
  const prefix = rawPrefix === "iclock" ? "/iclock" : "/api";

  if (rawPath !== undefined) {
    const path = Array.isArray(rawPath)
      ? rawPath.join("/")
      : String(rawPath).replace(/^\/+/, "");
    requestUrl.searchParams.delete("__path");
    requestUrl.searchParams.delete("__prefix");
    const query = requestUrl.searchParams.toString();
    req.url = `${prefix}/${path}${query ? `?${query}` : ""}`;
  }

  return app(req, res);
}