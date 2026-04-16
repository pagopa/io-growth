import type { Express } from "express";

import type { BaseError } from "../../../domain/errors/errors.js";
import type { UseCase } from "../../../domain/ports/inbound/use-case.js";

import { createHttpHandler, emptyValidator } from "./http-handler-builder.js";

export const mountInfoHandler = <O>(
  expressApp: Express,
  useCase: UseCase<Record<string, never>, O, BaseError>,
) => {
  expressApp.get("/api/info", createHttpHandler(useCase, emptyValidator));
};
