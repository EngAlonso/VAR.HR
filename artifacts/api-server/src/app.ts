import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import router from "./routes";
import iclockRouter from "./routes/iclock";
import { logger } from "./lib/logger";
import { WorkspaceAccessError, WorkspaceAuthError, requestedLocale } from "./lib/tenant-context";
import { translateApiMessage } from "./lib/i18n";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Backup files are database snapshots, so allow a bounded but practical JSON body.
// The upload endpoint still rejects oversized payloads before any database write.
app.use(express.json({ limit: "25mb" }));
app.use(express.text({ type: ["text/plain", "application/x-www-form-urlencoded"], limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);
app.use("/iclock", iclockRouter);

app.use((error: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof WorkspaceAuthError || error instanceof WorkspaceAccessError) {
    res.status(error.statusCode).json({ error: error.message, code: error.code });
    return;
  }

  req.log.error({ err: error }, "Unhandled API error");
  res.status(500).json({
    error: translateApiMessage(requestedLocale(req), "internalError"),
    code: "INTERNAL_ERROR",
  });
});

export default app;
