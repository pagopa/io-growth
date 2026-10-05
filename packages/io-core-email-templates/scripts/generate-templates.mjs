import mjml2html from "mjml";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, "../src");

// Email clients can't resolve local/relative paths, so <mj-image> references
// to ../assets/ are rewritten to this repo's raw.githubusercontent.com URL.
const LOCAL_ASSET_REGEX = /\.\.\/assets\//g;
const REMOTE_ASSET_BASE_URL =
  "https://raw.githubusercontent.com/pagopa/io-growth/main/packages/io-core-email-templates/src/assets/";

// SES stores/sends the Html as-is, so formatting whitespace (indentation,
// line breaks between tags) is pure dead weight — collapse it to one line.
const collapseWhitespace = (html) =>
  html.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();

// Double-quoted attributes would need escaping once embedded in the
// generated JSON file's Html string — single quotes stay valid HTML without
// any escaping.
const useSingleQuotedAttributes = (html) =>
  html.replace(/="([^"]*)"/g, "='$1'");

const generateTemplate = async (templateName) => {
  const templateDir = resolve(templatesDir, templateName);
  const mjmlPath = resolve(templateDir, "index.mjml");
  const metaPath = resolve(templateDir, "meta.json");

  const mjmlContent = readFileSync(mjmlPath, "utf8");
  // filePath lets mjml resolve <mj-include> paths (../style.css, ../partials/*)
  // relative to this template's own directory.
  const { errors, html: compiledHtml } = await mjml2html(mjmlContent, {
    filePath: mjmlPath,
  });

  if (errors.length > 0) {
    console.error(`Errors while compiling template "${templateName}":`);
    for (const error of errors) {
      console.error(error.formattedMessage);
    }
    process.exit(1);
  }

  const html = useSingleQuotedAttributes(
    collapseWhitespace(
      compiledHtml.replace(LOCAL_ASSET_REGEX, REMOTE_ASSET_BASE_URL),
    ),
  );
  const { subject, text } = JSON.parse(readFileSync(metaPath, "utf8"));

  // Shape matches the SESv2 `CreateEmailTemplate` request (see `../src/types.ts`).
  // Placeholders (e.g. `{{opportunityName}}`) are left unresolved — SES
  // substitutes them at send time from the caller's `TemplateData`.
  const template = {
    TemplateContent: { Html: html, Subject: subject, Text: text },
    TemplateName: templateName,
  };

  writeFileSync(
    resolve(templateDir, `${templateName}.json`),
    `${JSON.stringify(template, null, 2)}\n`,
  );
  console.log(`Generated "${templateName}/${templateName}.json"`);
};

const templateNames = readdirSync(templatesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  // Shared folders (partials, assets, ...) don't have an index.mjml
  .filter((name) => existsSync(resolve(templatesDir, name, "index.mjml")));

for (const templateName of templateNames) {
  await generateTemplate(templateName);
}
