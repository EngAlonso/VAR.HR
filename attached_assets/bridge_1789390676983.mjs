import http from "node:http";
import https from "node:https";

/*
 * رابط السيرفر الذي يستقبل بيانات جهاز البصمة
 * اتركه كما هو إذا كان هذا هو رابط موقعك الحالي.
 */
const targetOrigin = "https://varhr.vercel.app";

/*
 * الكوبري يعمل على Port 80 لأن جهاز البصمة يرسل إليه مباشرة.
 */
const listenPort = 80;

/*
 * ضع هنا Registration Key الخاص بجهاز البصمة.
 * لا تترك النص الموجود كما هو.
 */
const REGISTRATION_KEY = "414101";


const targetBase = new URL(targetOrigin);

const server = http.createServer((req, res) => {
  const incomingUrl = req.url || "/";
  const safeUrl = new URL(incomingUrl, "http://bridge.local");

  console.log(
    `[Bridge] Incoming ${req.method} ${safeUrl.pathname} from ${req.socket.remoteAddress}`,
  );

  /*
   * السماح فقط بمسارات ZKTeco ADMS.
   */
  if (!safeUrl.pathname.startsWith("/iclock")) {
    res.writeHead(404, {
      "content-type": "text/plain; charset=utf-8",
    });
    res.end("Not Found");
    return;
  }

  /*
   * الاحتفاظ بالـ query string مثل:
   * SN و KEY و INFO وغيرها.
   */
  const targetUrl = new URL(incomingUrl, targetBase);

  /*
   * تمرير كل Headers القادمة من جهاز البصمة،
   * مع استبدال Host وإضافة مفتاح التسجيل للسيرفر.
   */
  const headers = {
    ...req.headers,
    host: targetUrl.host,
    "x-zkteco-key": REGISTRATION_KEY,
  };

  /*
   * لا نرسل Connection من الجهاز للسيرفر الخارجي.
   */
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
      res.writeHead(502, {
        "content-type": "text/plain; charset=utf-8",
      });
    }

    res.end("Bridge forwarding error");
  });

  req.on("error", (error) => {
    console.error(`[Bridge] Device request error: ${error.message}`);
    upstream.destroy(error);
  });

  /*
   * تسجيل حجم البيانات القادمة من جهاز البصمة.
   * هذا الجزء لا يغير البيانات ولا يحذف منها شيئًا.
   * يساعدنا نعرف هل الجهاز أرسل كل السجل أم أرسل يومين فقط.
   */
  let incomingBytes = 0;

  req.on("data", (chunk) => {
    incomingBytes += chunk.length;
  });

  req.on("end", () => {
    console.log(
      `[Bridge] Request complete: ${req.method} ${safeUrl.pathname}, bytes=${incomingBytes}`,
    );
  });

  /*
   * تمرير Body بالكامل كما وصل من جهاز البصمة.
   * لا يوجد هنا فلتر لآخر يومين ولا حد لعدد السجلات.
   */
  req.pipe(upstream);
});

server.on("error", (error) => {
  console.error(`[Bridge] Server error: ${error.message}`);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`[Bridge] Connected & listening on port ${listenPort}`);
  console.log(`[Bridge] Forwarding data to ${targetOrigin}`);
});