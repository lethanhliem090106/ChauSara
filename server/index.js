import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";

const port = Number(process.env.PORT) || 3001;
const host =
  process.env.HOST ||
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

app.use("/assets", (req, res, next) => {
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  next();
});
app.use(express.static(path.join(projectRoot, "dist")));

app.get("/{*path}", (req, res, next) => {
  res.sendFile(path.join(projectRoot, "dist", "index.html"), (error) => {
    if (error) next(error);
  });
});

app.listen(port, host, () => {
  console.log(`CleanBite server listening on ${host}:${port}`);
});
