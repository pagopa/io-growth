import mjml2html from "mjml";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatesDir = resolve(__dirname, "../src");

const TEMPLATE_PLACEHOLDER = "{{TEMPLATE}}";

// Email clients can't resolve local/relative paths, so <mj-image> references
// to ../assets/ are rewritten to this repo's raw.githubusercontent.com URL.
const LOCAL_ASSET_REGEX = /\.\.\/assets\//g;
const REMOTE_ASSET_BASE_URL =
  "https://raw.githubusercontent.com/pagopa/io-growth/main/packages/io-core-email-templates/src/assets/";

const generateTemplate = async (templateName) => {
  const templateDir = resolve(templatesDir, templateName);
  const mjmlPath = resolve(templateDir, "index.mjml");
  const applierPath = resolve(templateDir, "applier.template.ts");

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

  const html = compiledHtml.replace(LOCAL_ASSET_REGEX, REMOTE_ASSET_BASE_URL);

  const applierContent = readFileSync(applierPath, "utf8");
  if (!applierContent.includes(TEMPLATE_PLACEHOLDER)) {
    throw new Error(
      `Template placeholder (${TEMPLATE_PLACEHOLDER}) not found in "${templateName}/applier.template.ts". Make sure it hasn't been accidentally removed.`,
    );
  }

  const generatedContent = applierContent.replace(
    TEMPLATE_PLACEHOLDER,
    () => html,
  );

  writeFileSync(resolve(templateDir, "index.ts"), generatedContent);
  console.log(`Generated "${templateName}/index.ts"`);
};

const templateNames = readdirSync(templatesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  // Shared folders (partials, assets, ...) don't have an index.mjml
  .filter((name) => existsSync(resolve(templatesDir, name, "index.mjml")));

for (const templateName of templateNames) {
  await generateTemplate(templateName);
}
