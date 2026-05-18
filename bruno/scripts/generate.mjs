#!/usr/bin/env node
/**
 * Generate Bruno API collections from OpenAPI specs.
 *
 * Usage: pnpm bruno:generate
 *
 * Re-run whenever an openapi spec changes to keep the collections in sync.
 * Generated .bru files are committed so the collection is immediately usable.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const __dir = dirname(fileURLToPath(import.meta.url));
const BRUNO_ROOT = resolve(__dir, "..");
const REPO_ROOT = resolve(BRUNO_ROOT, "..");

/** @type {Array<{name: string, specPath: string, localBaseUrl: string}>} */
const COLLECTIONS = [
  {
    name: "ced-browser-be",
    specPath: "apps/ced-browser-be/openapi/exposed/openapi.yaml",
    localBaseUrl: "http://localhost:8080",
  },
  {
    name: "ced-card-request-be",
    specPath: "apps/ced-card-request-be/openapi/exposed/openapi.yaml",
    localBaseUrl: "http://localhost:8081",
  },
];

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------

/** Resolve a JSON Pointer $ref within the same document (e.g. #/components/schemas/Foo). */
function resolveRef(ref, spec) {
  const parts = ref.replace(/^#\//, "").split("/");
  let current = spec;
  for (const part of parts) {
    current = current?.[part];
    if (current === undefined) return {};
  }
  return current;
}

/** Build a minimal sample value for a schema node. */
function buildSampleValue(schema, spec, depth = 0) {
  if (depth > 5 || !schema) return null;

  if (schema.$ref) {
    return buildSampleValue(resolveRef(schema.$ref, spec), spec, depth + 1);
  }

  if (schema.example !== undefined) return schema.example;

  if (schema.allOf) {
    const merged = {};
    for (const sub of schema.allOf) {
      const resolved = sub.$ref ? resolveRef(sub.$ref, spec) : sub;
      const value = buildSampleValue(resolved, spec, depth + 1);
      if (value && typeof value === "object") Object.assign(merged, value);
    }
    return merged;
  }

  const type = schema.type;

  if (type === "string") {
    if (schema.enum) return schema.enum[0];
    if (schema.format === "date") return "2026-01-01";
    if (schema.format === "date-time") return "2026-01-01T00:00:00Z";
    if (schema.format === "uuid") return "00000000-0000-0000-0000-000000000001";
    if (schema.format === "uri") return "https://example.com";
    return "string";
  }
  if (type === "integer" || type === "number") return 0;
  if (type === "boolean") return true;

  if (type === "array") {
    return [buildSampleValue(schema.items, spec, depth + 1)];
  }

  if (type === "object" || schema.properties) {
    const obj = {};
    const required = new Set(schema.required ?? []);
    for (const [key, val] of Object.entries(schema.properties ?? {})) {
      if (required.has(key)) {
        obj[key] = buildSampleValue(val, spec, depth + 1);
      }
    }
    return obj;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Bruno format helpers
// ---------------------------------------------------------------------------

function sanitizeFolderName(tag) {
  return tag
    .replace(/[^a-zA-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getEffectiveSecurity(spec, operation) {
  // operation.security === [] means explicitly no auth
  if (Array.isArray(operation.security)) return operation.security;
  return spec.security ?? [];
}

/**
 * Returns { name, value } for the auth header, or null if unauthenticated.
 */
function resolveAuthHeader(spec, operation) {
  const reqs = getEffectiveSecurity(spec, operation);
  if (reqs.length === 0) return null;

  const schemeName = Object.keys(reqs[0])[0];
  if (!schemeName) return null;

  const scheme = spec.components?.securitySchemes?.[schemeName];
  if (!scheme) return null;

  if (scheme.type === "apiKey" && scheme.in === "header") {
    return { name: scheme.name, value: "{{sessionToken}}" };
  }
  if (scheme.type === "http" && scheme.scheme === "bearer") {
    return { name: "Authorization", value: "Bearer {{sessionToken}}" };
  }
  return null;
}

function paramLine(param) {
  const raw = param.example !== undefined ? String(param.example) : "";
  const prefix = param.required ? "" : "~";
  return `  ${prefix}${param.name}: ${raw}`;
}

/** Returns true if the 200 response schema has a top-level `token` string field. */
function responseHasToken(operation, spec) {
  let schema =
    operation.responses?.["200"]?.content?.["application/json"]?.schema;
  if (!schema) return false;
  if (schema.$ref) schema = resolveRef(schema.$ref, spec);
  const props = schema.properties ?? {};
  return "token" in props;
}

function generateBruContent(path, method, operation, spec, seq) {
  const name =
    operation.summary ??
    operation.operationId ??
    `${method.toUpperCase()} ${path}`;
  // Convert {param} → :param
  const bruUrl = `{{baseUrl}}${path.replace(/\{([^}]+)\}/g, ":$1")}`;

  const params = operation.parameters ?? [];
  const queryParams = params.filter((p) => p.in === "query");
  const pathParams = params.filter((p) => p.in === "path");
  const headerParams = params.filter((p) => p.in === "header");

  const hasBody = !!operation.requestBody;
  const bodyType = hasBody ? "json" : "none";

  const authHeader = resolveAuthHeader(spec, operation);

  // Build JSON body sample
  let bodyJson = null;
  if (hasBody) {
    const content = operation.requestBody.content?.["application/json"];
    if (content?.schema) {
      const sample = buildSampleValue(content.schema, spec);
      bodyJson = JSON.stringify(sample, null, 2);
    }
  }

  const lines = [];

  lines.push(`meta {`);
  lines.push(`  name: ${name}`);
  lines.push(`  type: http`);
  lines.push(`  seq: ${seq}`);
  lines.push(`}`);
  lines.push(``);
  lines.push(`${method} {`);
  lines.push(`  url: ${bruUrl}`);
  lines.push(`  body: ${bodyType}`);
  lines.push(`  auth: none`);
  lines.push(`}`);

  if (queryParams.length > 0) {
    lines.push(``);
    lines.push(`params:query {`);
    for (const p of queryParams) lines.push(paramLine(p));
    lines.push(`}`);
  }

  if (pathParams.length > 0) {
    lines.push(``);
    lines.push(`params:path {`);
    for (const p of pathParams) {
      const val =
        p.schema?.format === "uuid"
          ? "00000000-0000-0000-0000-000000000001"
          : (p.example ?? "");
      lines.push(`  ${p.name}: ${val}`);
    }
    lines.push(`}`);
  }

  if (authHeader || headerParams.length > 0) {
    lines.push(``);
    lines.push(`headers {`);
    if (authHeader) lines.push(`  ${authHeader.name}: ${authHeader.value}`);
    for (const p of headerParams) lines.push(paramLine(p));
    lines.push(`}`);
  }

  if (bodyJson) {
    lines.push(``);
    lines.push(`body:json {`);
    lines.push(bodyJson);
    lines.push(`}`);
  }

  if (responseHasToken(operation, spec)) {
    lines.push(``);
    lines.push(`script:post-response {`);
    lines.push(`  if (res.status === 200) {`);
    lines.push(`    bru.setVar("sessionToken", res.body.token);`);
    lines.push(`  }`);
    lines.push(`}`);
  }

  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// Collection generator
// ---------------------------------------------------------------------------

function generateCollection(config) {
  const specPath = join(REPO_ROOT, config.specPath);
  const spec = parse(readFileSync(specPath, "utf-8"));
  const collectionDir = join(BRUNO_ROOT, config.name);

  // Wipe and recreate (except we'll rebuild everything)
  if (existsSync(collectionDir)) rmSync(collectionDir, { recursive: true });
  mkdirSync(collectionDir, { recursive: true });

  const productionUrl = spec.servers?.[0]?.url ?? "";

  // bruno.json — collection root
  writeFileSync(
    join(collectionDir, "bruno.json"),
    JSON.stringify(
      {
        version: "1",
        name: spec.info?.title ?? config.name,
        type: "collection",
        ignore: [],
      },
      null,
      2,
    ) + "\n",
  );

  // Environments
  const envsDir = join(collectionDir, "environments");
  mkdirSync(envsDir, { recursive: true });

  writeFileSync(
    join(envsDir, "local.bru"),
    `vars {\n  baseUrl: ${config.localBaseUrl}\n  sessionToken: \n  sessionId: \n}\n`,
  );
  writeFileSync(
    join(envsDir, "production.bru"),
    `vars {\n  baseUrl: ${productionUrl}\n  sessionToken: \n  sessionId: \n}\n`,
  );

  // Requests grouped by tag
  const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
  const tagSeq = {};

  for (const [path, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of HTTP_METHODS) {
      const operation = pathItem[method];
      if (!operation) continue;

      const tag = operation.tags?.[0] ?? "Default";
      const folder = sanitizeFolderName(tag);
      const folderDir = join(collectionDir, folder);
      mkdirSync(folderDir, { recursive: true });

      tagSeq[folder] = (tagSeq[folder] ?? 0) + 1;
      const seq = tagSeq[folder];

      const fileName = `${operation.operationId ?? `${method}-${path.replace(/\//g, "-")}`}.bru`;
      writeFileSync(
        join(folderDir, fileName),
        generateBruContent(path, method, operation, spec, seq),
      );
      console.log(`  ✓ ${config.name}/${folder}/${fileName}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log("Generating Bruno collections from OpenAPI specs…\n");
for (const config of COLLECTIONS) {
  generateCollection(config);
  console.log();
}
console.log("Done. Open the bruno/ folder in Bruno to start testing.");
