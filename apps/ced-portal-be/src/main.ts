import express from "express";

import { mountInfoHandler } from "./adapters/inbound/express/index.js";
import { getInfoUseCase } from "./application/use-cases/info.use-case.js";

const host = process.env.HOST ?? "0.0.0.0";
const portValue = process.env.PORT;
const port = portValue ? Number.parseInt(portValue, 10) : 3000;

if (Number.isNaN(port)) {
  throw new Error("PORT environment variable must be a valid integer");
}

const app = express();

app.use(express.json());

mountInfoHandler(app, getInfoUseCase);

app.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
