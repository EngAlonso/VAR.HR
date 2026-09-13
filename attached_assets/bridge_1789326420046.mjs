import http from "node:http";
import https from "node:https";

const targetOrigin = "https://varhr.vercel.app";
const listenPort = 80;

// ⚠️ استبدل النص اللي تحت ده بمفتاح التسجيل الجديد اللي نسخته من الموقع
const REGISTRATION_KEY = "414101"; 

const targetBase = new URL(targetOrigin);

const server = http.createServer((req, res) => {
  const incomingUrl = req.url || "/";
  const safeUrl = new URL(incomingUrl, "http://bridge.local");
  
  console.log(
    `[Bridge] Incoming ${req.method} ${safeUrl.pathname} from ${req.socket.remoteAddress}`,
  );

  if (!safeUrl.pathname.startsWith("/iclock")) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not Found");
    return;
  }

  const targetUrl = new URL(incomingUrl, targetBase);
  
  // 🟢 تعديل المطور: إضافة مفتاح الأمان للـ Headers لتخطي الـ 401
  const headers = {
    ...req.headers,
    host: targetUrl.host,
    "x-zkteco-key": REGISTRATION_KEY 
  };
  delete headers.connection;

  const upstream = https.request(
    targetUrl,
    {
      method: req.method,
      headers,
    },
    (response) => {
      console.log(
        `[Bridge] Vercel response ${response.statusCode} for ${req.method} ${safeUrl.pathname}`,
      );
      res.writeHead(response.statusCode || 502, response.headers);
      response.pipe(res);
    },
  );

  upstream.on("error", (error) => {
    console.error(`[Bridge] Forwarding error: ${error.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    }
    res.end("Bridge forwarding error");
  });

  req.on("error", (error) => {
    console.error(`[Bridge] Device request error: ${error.message}`);
    upstream.destroy(error);
  });

  req.pipe(upstream);
});

server.on("error", (error) => {
  console.error(`[Bridge] Server error: ${error.message}`);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`[Bridge] Connected & listening on port ${listenPort}`);
  console.log(`[Bridge] Forwarding data to ${targetOrigin}`);
});
